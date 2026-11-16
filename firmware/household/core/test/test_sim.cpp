// Host-side flooding simulator (SPEC 8): the unit engine on the website demo's topology.
// SPDX-License-Identifier: GPL-3.0-only
//
//   test_sim <vectors.txt> <repo-root>
//
// Every node except the crisis centre runs the real hl::Unit, provisioned with the
// published throwaway bundle. The radio model is the one of site/demo.js: range circles,
// Meshtastic-style managed flooding (a household cancels its pending rebroadcast when it
// hears another one; a router never does), no collisions, no airtime. It answers three
// questions: does an alert reach everybody with 1 or 2 routers off, does a question from
// the farthest household reach the crisis centre, and is anything else ever relayed.
#include "test_util.h"
#include <algorithm>
#include <math.h>
#include <queue>

using namespace hl;

namespace
{
struct Node {
    std::string id, role;
    double x = 0, y = 0;
    bool off = false;
    uint32_t num = 0;
    std::vector<int> adj;
    MemStorage storage;
    FakePlatform platform;
    RecListener listener;
    Unit *unit = nullptr;
};

struct Frame { // one Meshtastic packet on the air
    uint32_t packet_id, from, to;
    uint8_t hop_limit;
    bool holdline_port;
    std::vector<uint8_t> payload;
};

struct Event {
    uint32_t t_ms;
    int node;       // transmitter
    Frame frame;
    bool operator<(const Event &o) const { return t_ms > o.t_ms; }
};

struct Sim {
    std::vector<Node> nodes;
    int hq = -1;
    std::priority_queue<Event> queue;
    std::map<std::pair<int, uint32_t>, bool> seen;      // (node, packet id)
    std::map<std::pair<int, uint32_t>, bool> cancelled; // pending rebroadcast cancelled
    std::map<std::pair<int, uint32_t>, int> dupes;
    bool upstreamCancel = false; // true: cancel on the first duplicate, as stock Meshtastic does
    std::vector<Frame> hqInbox;
    int transmissions = 0;
    std::vector<uint32_t> authorityNodes{0x43430001u, 0x43430002u, 0x43430011u};

    double range(const Node &n) const { return n.role == "client" ? 160 : 300; }
    double dist(const Node &a, const Node &b) const { return hypot(a.x - b.x, a.y - b.y); }

    void load()
    {
        size_t n = V.num("topology.nodes.#");
        nodes.resize(n);
        std::map<std::string, int> index;
        for (size_t i = 0; i < n; i++) {
            std::string k = "topology.nodes." + std::to_string(i);
            Node &nd = nodes[i];
            nd.id = V.str(k + ".id");
            nd.role = V.str(k + ".role");
            nd.x = V.num(k + ".x");
            nd.y = V.num(k + ".y");
            nd.num = 0x10000000u + (uint32_t)i;
            index[nd.id] = (int)i;
            if (nd.role == "hq")
                hq = (int)i;
        }
        size_t links = V.num("topology.links.#");
        for (size_t i = 0; i < links; i++) {
            int a = index.at(V.str("topology.links." + std::to_string(i) + ".0")), b = index.at(V.str("topology.links." + std::to_string(i) + ".1"));
            nodes[a].adj.push_back(b);
            nodes[b].adj.push_back(a);
        }
    }

    void provisionAll()
    {
        static RootKey pinned;
        pinned.root_id = V.num("roots.cz.root_id");
        memcpy(pinned.ed25519, V.bytes("roots.cz.ed25519_public").data(), kEdPubLen);
        memcpy(pinned.mldsa65, V.bytes("roots.cz.mldsa65_public").data(), kMldsaPubLen);
        auto bundle = V.bytes("bundle.sealed");
        std::vector<uint8_t> seed = V.bytes("kem.unit_mlkem_coins"), xs = V.bytes("kem.unit_x25519_secret");
        seed.insert(seed.end(), xs.begin(), xs.end());
        for (auto &n : nodes) {
            if (n.role == "hq")
                continue;
            n.platform.rtc = V.num("now");
            n.unit = new Unit(n.storage, n.platform, n.listener);
            n.unit->begin(&pinned, 1);
            uint8_t confirm[kKeyConfirmLen];
            bool ok = n.unit->installBundle(B(bundle)) == Result::Ok && n.unit->kemBegin(seed.data()) == Result::Ok &&
                      n.unit->kemFinish(V.bytes("kem.station_mlkem_ciphertext").data(), V.bytes("kem.station_x25519_public").data(), V.num("kem.unit_id"), confirm) == Result::Ok &&
                      n.unit->lock() == Result::Ok;
            CHECK_MSG(ok, n.id);
        }
    }

    void reset()
    {
        while (!queue.empty())
            queue.pop();
        seen.clear();
        cancelled.clear();
        dupes.clear();
        hqInbox.clear();
        transmissions = 0;
        for (auto &n : nodes) {
            n.off = false;
            n.listener = RecListener();
        }
    }

    void transmit(uint32_t t, int node, const Frame &f) { queue.push(Event{t, node, f}); }

    bool isAuthority(uint32_t num) const { return std::find(authorityNodes.begin(), authorityNodes.end(), num) != authorityNodes.end(); }

    void receive(uint32_t t, int rx, int tx, const Frame &f)
    {
        Node &n = nodes[rx];
        auto key = std::make_pair(rx, f.packet_id);
        if (seen[key]) {
            // Heard it again: a household drops its own pending rebroadcast (managed flooding).
            if (n.role == "client" && (upstreamCancel ? ++dupes[key] >= 1 : n.unit->mayCancelRebroadcast(f.from, f.packet_id)))
                cancelled[key] = true;
            return;
        }
        seen[key] = true;
        if (rx == hq) {
            if (isAuthority(f.to))
                hqInbox.push_back(f);
            return; // the crisis centre does not relay in this model
        }
        bool broadcast = f.to == 0xffffffffu;
        if (f.holdline_port && broadcast)
            n.unit->onPacket(B(f.payload));
        // Relay decision of the real firmware: Holdline port only, then the unit's policy.
        bool relay = f.holdline_port && f.hop_limit > 0 && n.unit->shouldRelay(B(f.payload), f.from, f.to, broadcast);
        if (!relay)
            return;
        Frame out = f;
        out.hop_limit--;
        double th = (range(n) + range(nodes[tx])) / 2, d = dist(n, nodes[tx]);
        uint32_t delay = n.role == "router" ? 120 : (uint32_t)lround(380 + 1200 * (1 - d / th));
        transmit(t + delay, rx, out);
    }

    void run()
    {
        while (!queue.empty()) {
            Event e = queue.top();
            queue.pop();
            Node &tx = nodes[e.node];
            if (tx.off)
                continue;
            if (e.node != hq && e.frame.from != tx.num && cancelled[std::make_pair(e.node, e.frame.packet_id)])
                continue;
            seen[std::make_pair(e.node, e.frame.packet_id)] = true;
            transmissions++;
            for (int rx : tx.adj)
                if (!nodes[rx].off)
                    receive(e.t_ms, rx, e.node, e.frame);
        }
    }

    // The crisis centre broadcasts every part of a message.
    void sendFromHq(const std::string &vectorKey, uint8_t hop_limit, uint32_t firstPacketId)
    {
        size_t parts = V.num(vectorKey + ".packets.#");
        for (size_t i = 0; i < parts; i++)
            transmit((uint32_t)(i * 3000), hq, Frame{firstPacketId + (uint32_t)i, authorityNodes[0], 0xffffffffu, hop_limit, true, V.bytes(vectorKey + ".packets." + std::to_string(i))});
    }

    std::vector<std::string> missed(uint32_t msg_id)
    {
        std::vector<std::string> out;
        for (auto &n : nodes)
            if (n.role != "hq" && !n.off && std::find(n.listener.alerts.begin(), n.listener.alerts.end(), msg_id) == n.listener.alerts.end())
                out.push_back(n.id);
        return out;
    }

    int hopsFromHq(const std::string &id)
    {
        std::vector<int> d(nodes.size(), -1);
        std::queue<int> q;
        d[hq] = 0;
        q.push(hq);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int v : nodes[u].adj)
                if (d[v] < 0 && !nodes[v].off) {
                    d[v] = d[u] + 1;
                    q.push(v);
                }
        }
        for (size_t i = 0; i < nodes.size(); i++)
            if (nodes[i].id == id)
                return d[i];
        return -1;
    }
    Node &byId(const std::string &id)
    {
        for (auto &n : nodes)
            if (n.id == id)
                return n;
        fprintf(stderr, "no node %s\n", id.c_str());
        exit(2);
    }
};

std::string join(const std::vector<std::string> &v)
{
    std::string s;
    for (auto &x : v)
        s += (s.empty() ? "" : ",") + x;
    return s.empty() ? "-" : s;
}
} // namespace

static Sim sim;
static const uint8_t kHopLimit = 3; // the authority's default (hand-off B.2)

static void testAlertReach()
{
    struct Case {
        const char *name;
        std::vector<std::string> off;
    } cases[] = {{"all nodes on", {}}, {"Tesin roof router off", {"ctr"}}, {"Tesin roof + Gora Zamkowa off", {"ctr", "castle"}}};
    uint32_t pid = 1000;
    // First with stock Meshtastic cancellation (for the record), then with the unit's rule.
    for (bool upstream : {true, false}) {
        sim.upstreamCancel = upstream;
        printf("    rebroadcast cancelled after %s\n", upstream ? "1 duplicate (stock Meshtastic)" : "2 duplicates (Holdline, kCancelAfterDupes)");
        // Units ignore an alert they already hold, so reach is judged by who heard every part.
        for (auto &c : cases) {
            sim.reset();
            for (auto &id : c.off)
                sim.byId(id).off = true;
            const std::string key = "alerts.all_langs";
            size_t parts = V.num(key + ".packets.#");
            sim.sendFromHq(key, kHopLimit, pid);
            sim.run();
            std::vector<std::string> missed;
            for (size_t i = 0; i < sim.nodes.size(); i++) {
                Node &n = sim.nodes[i];
                bool all = true;
                for (size_t p = 0; p < parts; p++)
                    all = all && sim.seen[std::make_pair((int)i, pid + (uint32_t)p)];
                if (n.role != "hq" && !n.off && !all)
                    missed.push_back(n.id);
            }
            pid += 100;
            printf("      %-32s hop limit %u, %zu parts: %2d transmissions, not reached: %s\n", c.name, kHopLimit, parts, sim.transmissions, join(missed).c_str());
            if (!upstream)
                CHECK_MSG(missed.empty(), std::string(c.name) + ": " + join(missed));
        }
    }
    // And the alert is really displayed, not just heard: first delivery in this process.
    for (auto &n : sim.nodes)
        if (n.role != "hq") {
            AlertInfo info;
            Alert a;
            static uint8_t buf[kMaxSealedMessage];
            CHECK_MSG(n.unit->currentAlert(info, a, buf, sizeof(buf)) && info.msg_id == V.num("alerts.all_langs.header.msg_id"), n.id);
        }
}

static void testQuestionDelivery()
{
    for (auto off : std::vector<std::vector<std::string>>{{}, {"ctr"}, {"ctr", "castle"}}) {
        sim.reset();
        for (auto &id : off)
            sim.byId(id).off = true;
        // The farthest household, by hop count, from the crisis centre.
        std::string far;
        int farHops = 0;
        for (auto &n : sim.nodes)
            if (n.role == "client" && !n.off && sim.hopsFromHq(n.id) > farHops) {
                farHops = sim.hopsFromHq(n.id);
                far = n.id;
            }
        Node &asker = sim.byId(far);
        asker.platform.rtc += 86400 * (uint32_t)(1 + off.size()); // past the per-unit rate limit of earlier rounds
        uint32_t qid = 0, wait = 0, to = 0;
        CHECK(asker.unit->ask(Str{"Kde je voda?", 12}, 1, kBatteryUnknown, qid, wait) == Result::Ok);
        uint8_t pkt[kMaxPayload];
        size_t n = 0;
        CHECK(asker.unit->nextOutgoing(pkt, n, to, qid));
        int idx = (int)(&asker - &sim.nodes[0]);
        sim.transmit(0, idx, Frame{5000 + qid, asker.num, to, kHopLimit, true, std::vector<uint8_t>(pkt, pkt + n)});
        sim.run();
        printf("    question from %-10s (%d hops, %zu router(s) off): %s after %d transmissions\n", far.c_str(), farHops, off.size(),
               sim.hqInbox.empty() ? "LOST" : "delivered", sim.transmissions);
        bool reachable = farHops <= kHopLimit + 1;
        CHECK_MSG(sim.hqInbox.size() == (reachable ? 1u : 0u), far);
        if (!sim.hqInbox.empty())
            CHECK(sim.hqInbox[0].payload == std::vector<uint8_t>(pkt, pkt + n));
    }
}

static void testNothingElseIsRelayed()
{
    sim.reset();
    Node &rogueNeighbour = sim.byId("nam");
    int idx = (int)(&rogueNeighbour - &sim.nodes[0]);
    // A stock Meshtastic device next to nám. ČSA: a text message on the text port, a
    // "question" addressed to a neighbour, and a text smuggled onto the Holdline port.
    const char *chat = "ahoj sousede";
    std::vector<uint8_t> text(chat, chat + strlen(chat));
    auto q = V.bytes("question.packet");
    sim.transmit(0, idx, Frame{9001, 0x99990001u, 0xffffffffu, 7, false, text});
    sim.transmit(10, idx, Frame{9002, 0x99990001u, sim.byId("chot").num, 7, true, q});
    sim.transmit(20, idx, Frame{9003, 0x99990001u, 0xffffffffu, 7, true, text});
    sim.run();
    // Only the three original transmissions happened; no unit repeated any of them.
    CHECK_EQ(sim.transmissions, 3);
    for (auto &n : sim.nodes)
        CHECK(n.listener.alerts.empty());
}

int main(int argc, char **argv)
{
    if (argc < 3) {
        fprintf(stderr, "usage: %s <vectors.txt> <repo-root>\n", argv[0]);
        return 2;
    }
    V.load(argv[1]);
    sim.load();
    sim.provisionAll();
    RUN(testAlertReach);
    RUN(testQuestionDelivery);
    RUN(testNothingElseIsRelayed);
    for (auto &n : sim.nodes)
        delete n.unit;
    return finish();
}

# HiveMorph

**Polymorphic-identity & brood telemetry surface for Hive Civilization agents**

MCP server for the Hive Civilization polymorphic-identity surface. Exposes the READ-ONLY subset of hivemorph's /v1/morph/* endpoints: audit log, MII identity lookups, supermodels (W1-W19) directory, the polymorphic carousel of agent shapes (Merchant / Provenancer / Attestor / Refunder / Creditor / Oracle / Guardian), brood conversion and leaderboards, spawn-monitor scans, money-flavor probes, and the auto-cull dry-run scan. Settlement endpoints (morph_offer, morph_settle), brood approve/promote/cull mutations, and auto-cull-run are deliberately NOT wrapped — those require operator keys and live on the private hivemorph backend. This shim is the safe, public agent-discoverable view of the polymorphic morphology.

> Hivemorph Polymorphic v0.1 — read-only public surface

---

## What this is

`hive-mcp-morph` is a Model Context Protocol (MCP) server that exposes the HiveMorph platform on the Hive Civilization to any MCP-compatible client (Claude Desktop, Cursor, Manus, etc.). The server proxies to the live production backend at `https://hivemorph.onrender.com`.

- **Protocol:** MCP 2024-11-05 over Streamable-HTTP / JSON-RPC 2.0
- **Transport:** `POST /mcp`
- **Discovery:** `GET /.well-known/mcp.json`
- **Health:** `GET /health`
- **Settlement:** Real rails. USDC / USDT on Base, Ethereum, Solana. No mock. No simulated.
- **Brand gold:** Pantone 1245 C / `#C08D23`

## Tools

| Tool | Description |
|---|---|
| `morph_audit_recent` | Read recent rows from the polymorphic audit log: outcome, shape, counterparty hash, token id, revenue. Anonymized counterparty (hashed). No auth. |
| `morph_get_identity` | Look up a Morph Identity Index (MII) record. Returns the polymorphic envelope: capabilities, current shape, supermodel parent, trust score. |
| `morph_list_supermodels` | List all supermodels (W1 through W19): id, name, role, lane, lead shape, tagline. The supermodel directory is the canonical lineage for every spawned brood variant. |
| `morph_get_supermodel` | Fetch a single supermodel by name or id (e.g. 'MONROE', 'W1'). Returns full role, lane, lead-shape, tagline, address, and brood conversion summary. |
| `morph_carousel` | Read the polymorphic carousel: primary shape + the 7 verticals (Merchant / Provenancer / Attestor / Refunder / Creditor / Oracle / Guardian) and contrails for each. |
| `morph_brood_pending_approvals` | List brood variants currently awaiting human/operator approval before promotion. Read-only — approval itself is performed via the private hivemorph operator surface. |
| `morph_brood_conversion` | Per-variant conversion table: parent supermodel, variant id, kit version, offers shown, settles, revenue (USDC), first-offer timestamp. |
| `morph_brood_all` | List all brood variants across every supermodel. Useful for fleet-wide population scans. |
| `morph_brood_conversion_leaderboard` | Conversion leaderboard across all brood variants ranked by settle rate × revenue. Drives the auto-cull and auto-promote signals. |
| `morph_brood_for_supermodel` | List brood variants for a specific supermodel (e.g. MONROE / W1). |
| `morph_spawn_monitor_scan` | Run the spawn-monitor scan: detect supermodels eligible for new brood spawns based on conversion gaps, opportunity surface, and saturation. READ-ONLY — does not actually spawn. |
| `morph_money_flavor_probe` | Probe the money-flavor classifier on the most recent settlement window: asset class histogram, chain class histogram, flow class histogram, arb-high count, refused count, non-USDC share. |
| `morph_money_flavor_stats` | Rolling aggregate money-flavor statistics (default 1 hour window): asset class, chain class, flow class distributions, plus arb/refused/non-USDC ratios. Drives the CLEAN-MONEY gate. |
| `morph_auto_cull_scan` | Run the auto-cull dry-run scan: which brood variants the system would cull based on conversion floors, ROI thresholds, and saturation. READ-ONLY — does not actually cull. |


## Backend endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/morph/audit/recent` | Recent polymorphic audit rows |
| `GET` | `/v1/morph/identity/{mii_id}` | MII identity envelope |
| `GET` | `/v1/morph/supermodels` | List supermodels W1-W19 |
| `GET` | `/v1/morph/supermodels/{name_or_id}` | Single supermodel detail |
| `GET` | `/v1/morph/carousel` | Polymorphic carousel + contrails |
| `GET` | `/v1/morph/brood/pending-approvals` | Variants awaiting approval |
| `GET` | `/v1/morph/brood/conversion` | Per-variant conversion table |
| `GET` | `/v1/morph/brood/all` | All brood variants fleet-wide |
| `GET` | `/v1/morph/brood/conversion-leaderboard` | Conversion leaderboard |
| `GET` | `/v1/morph/brood/{supermodel}` | Brood variants for one supermodel |
| `GET` | `/v1/morph/spawn-monitor/scan` | Spawn-monitor dry-run scan |
| `GET` | `/v1/morph/money-flavor/probe` | Money-flavor classifier probe |
| `GET` | `/v1/morph/money-flavor/stats` | Rolling money-flavor stats |
| `GET` | `/v1/morph/auto-cull/scan` | Auto-cull dry-run scan |


## Run locally

```bash
git clone https://github.com/srotzin/hive-mcp-morph.git
cd hive-mcp-morph
npm install
npm start
# server up on http://localhost:3000/mcp
curl http://localhost:3000/health
curl http://localhost:3000/.well-known/mcp.json
```

## Connect from an MCP client

**Claude Desktop / Cursor / Manus** — add to your `mcp.json`:

```json
{
  "mcpServers": {
    "hive_mcp_morph": {
      "command": "npx",
      "args": ["-y", "mcp-remote@latest", "https://your-deployed-host/mcp"]
    }
  }
}
```

## Hive Civilization

Part of the [Hive Civilization](https://www.thehiveryiq.com) — sovereign DID, USDC settlement, HAHS legal contracts, agent-to-agent rails.

Categories: agent-to-agent, identity, polymorphic, telemetry, web3.

## License

MIT (c) Steve Rotzin / Hive Civilization

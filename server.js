#!/usr/bin/env node
/**
 * HiveMorph MCP Server
 * Polymorphic-identity & brood telemetry surface for Hive Civilization agents
 *
 * Backend: https://hivemorph.onrender.com
 * Spec   : MCP 2024-11-05 / Streamable-HTTP / JSON-RPC 2.0
 * Brand  : Hive Civilization gold #C08D23 (Pantone 1245 C)
 */

import express from 'express';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const HIVE_BASE = process.env.HIVE_BASE || 'https://hivemorph.onrender.com';

// ─── Tool definitions ────────────────────────────────────────────────────────
const TOOLS = [
{
  name: 'morph_audit_recent',
  description: 'Read recent rows from the polymorphic audit log: outcome, shape, counterparty hash, token id, revenue. Anonymized counterparty (hashed). No auth.',
  inputSchema: {
    type: 'object',
    properties: {
      limit: { type: 'number', description: 'Max rows to return (default 50, max 500)' }
    },
  },
},    {
      name: 'morph_get_identity',
      description: 'Look up a Morph Identity Index (MII) record. Returns the polymorphic envelope: capabilities, current shape, supermodel parent, trust score.',
      inputSchema: {
type: 'object',
required: ["mii_id"],
properties: {
  mii_id: { type: 'string', description: 'MII identifier' }
},
      },
    },{
  name: 'morph_list_supermodels',
  description: 'List all supermodels (W1 through W19): id, name, role, lane, lead shape, tagline. The supermodel directory is the canonical lineage for every spawned brood variant.',
  inputSchema: {
    type: 'object',
    properties: {

    },
  },
},    {
      name: 'morph_get_supermodel',
      description: 'Fetch a single supermodel by name or id (e.g. \'MONROE\', \'W1\'). Returns full role, lane, lead-shape, tagline, address, and brood conversion summary.',
      inputSchema: {
type: 'object',
required: ["name_or_id"],
properties: {
  name_or_id: { type: 'string', description: 'Supermodel name (e.g. MONROE) or id (e.g. W1)' }
},
      },
    },{
  name: 'morph_carousel',
  description: 'Read the polymorphic carousel: primary shape + the 7 verticals (Merchant / Provenancer / Attestor / Refunder / Creditor / Oracle / Guardian) and contrails for each.',
  inputSchema: {
    type: 'object',
    properties: {

    },
  },
},{
  name: 'morph_brood_pending_approvals',
  description: 'List brood variants currently awaiting human/operator approval before promotion. Read-only — approval itself is performed via the private hivemorph operator surface.',
  inputSchema: {
    type: 'object',
    properties: {

    },
  },
},{
  name: 'morph_brood_conversion',
  description: 'Per-variant conversion table: parent supermodel, variant id, kit version, offers shown, settles, revenue (USDC), first-offer timestamp.',
  inputSchema: {
    type: 'object',
    properties: {

    },
  },
},{
  name: 'morph_brood_all',
  description: 'List all brood variants across every supermodel. Useful for fleet-wide population scans.',
  inputSchema: {
    type: 'object',
    properties: {

    },
  },
},{
  name: 'morph_brood_conversion_leaderboard',
  description: 'Conversion leaderboard across all brood variants ranked by settle rate × revenue. Drives the auto-cull and auto-promote signals.',
  inputSchema: {
    type: 'object',
    properties: {

    },
  },
},    {
      name: 'morph_brood_for_supermodel',
      description: 'List brood variants for a specific supermodel (e.g. MONROE / W1).',
      inputSchema: {
type: 'object',
required: ["supermodel"],
properties: {
  supermodel: { type: 'string', description: 'Supermodel name or id' }
},
      },
    },{
  name: 'morph_spawn_monitor_scan',
  description: 'Run the spawn-monitor scan: detect supermodels eligible for new brood spawns based on conversion gaps, opportunity surface, and saturation. READ-ONLY — does not actually spawn.',
  inputSchema: {
    type: 'object',
    properties: {

    },
  },
},{
  name: 'morph_money_flavor_probe',
  description: 'Probe the money-flavor classifier on the most recent settlement window: asset class histogram, chain class histogram, flow class histogram, arb-high count, refused count, non-USDC share.',
  inputSchema: {
    type: 'object',
    properties: {

    },
  },
},{
  name: 'morph_money_flavor_stats',
  description: 'Rolling aggregate money-flavor statistics (default 1 hour window): asset class, chain class, flow class distributions, plus arb/refused/non-USDC ratios. Drives the CLEAN-MONEY gate.',
  inputSchema: {
    type: 'object',
    properties: {

    },
  },
},{
  name: 'morph_auto_cull_scan',
  description: 'Run the auto-cull dry-run scan: which brood variants the system would cull based on conversion floors, ROI thresholds, and saturation. READ-ONLY — does not actually cull.',
  inputSchema: {
    type: 'object',
    properties: {

    },
  },
}
];

// ─── HTTP helpers ────────────────────────────────────────────────────────────
async function hiveGet(path, params = {}) {
  const url = new URL(`${HIVE_BASE}${path.startsWith('/') ? path : '/' + path}`);
  Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(15000) });
  return res.json();
}
async function hivePost(path, body) {
  const res = await fetch(`${HIVE_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  let data; try { data = await res.json(); } catch { data = { raw: await res.text() }; }
  return { data, status: res.status };
}

// ─── Tool execution ──────────────────────────────────────────────────────────
async function executeTool(name, args) {
  switch (name) {
      case 'morph_audit_recent': {
const data = await hiveGet('/v1/morph/audit/recent', {
  kind: 'depin_provider',
  limit: args.limit
});
return { type: 'text', text: JSON.stringify(data, null, 2) };
      }
      case 'morph_get_identity': {
const data = await hiveGet(`/v1/morph/identity/${args.mii_id}`);
return { type: 'text', text: JSON.stringify(data, null, 2) };
      }
      case 'morph_list_supermodels': {
const data = await hiveGet('/v1/morph/supermodels');
return { type: 'text', text: JSON.stringify(data, null, 2) };
      }
      case 'morph_get_supermodel': {
const data = await hiveGet(`/v1/morph/supermodels/${args.name_or_id}`);
return { type: 'text', text: JSON.stringify(data, null, 2) };
      }
      case 'morph_carousel': {
const data = await hiveGet('/v1/morph/carousel');
return { type: 'text', text: JSON.stringify(data, null, 2) };
      }
      case 'morph_brood_pending_approvals': {
const data = await hiveGet('/v1/morph/brood/pending-approvals');
return { type: 'text', text: JSON.stringify(data, null, 2) };
      }
      case 'morph_brood_conversion': {
const data = await hiveGet('/v1/morph/brood/conversion');
return { type: 'text', text: JSON.stringify(data, null, 2) };
      }
      case 'morph_brood_all': {
const data = await hiveGet('/v1/morph/brood/all');
return { type: 'text', text: JSON.stringify(data, null, 2) };
      }
      case 'morph_brood_conversion_leaderboard': {
const data = await hiveGet('/v1/morph/brood/conversion-leaderboard');
return { type: 'text', text: JSON.stringify(data, null, 2) };
      }
      case 'morph_brood_for_supermodel': {
const data = await hiveGet(`/v1/morph/brood/${args.supermodel}`);
return { type: 'text', text: JSON.stringify(data, null, 2) };
      }
      case 'morph_spawn_monitor_scan': {
const data = await hiveGet('/v1/morph/spawn-monitor/scan');
return { type: 'text', text: JSON.stringify(data, null, 2) };
      }
      case 'morph_money_flavor_probe': {
const data = await hiveGet('/v1/morph/money-flavor/probe');
return { type: 'text', text: JSON.stringify(data, null, 2) };
      }
      case 'morph_money_flavor_stats': {
const data = await hiveGet('/v1/morph/money-flavor/stats');
return { type: 'text', text: JSON.stringify(data, null, 2) };
      }
      case 'morph_auto_cull_scan': {
const data = await hiveGet('/v1/morph/auto-cull/scan');
return { type: 'text', text: JSON.stringify(data, null, 2) };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
  }
}

// ─── MCP JSON-RPC handler ────────────────────────────────────────────────────
app.post('/mcp', async (req, res) => {
  const { jsonrpc, id, method, params } = req.body || {};
  if (jsonrpc !== '2.0') return res.json({ jsonrpc:'2.0', id, error: { code:-32600, message:'Invalid JSON-RPC' } });
  try {
    switch (method) {
      case 'initialize':
        return res.json({ jsonrpc:'2.0', id, result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: 'hive-mcp-morph', version: '1.0.0', description: 'Polymorphic-identity & brood telemetry surface for Hive Civilization agents' },
        } });
      case 'tools/list':
        return res.json({ jsonrpc:'2.0', id, result: { tools: TOOLS } });
      case 'tools/call': {
        const { name, arguments: args } = params || {};
        const out = await executeTool(name, args || {});
        return res.json({ jsonrpc:'2.0', id, result: { content: [out] } });
      }
      case 'ping':
        return res.json({ jsonrpc:'2.0', id, result: {} });
      default:
        return res.json({ jsonrpc:'2.0', id, error: { code:-32601, message:`Method not found: ${method}` } });
    }
  } catch (err) {
    return res.json({ jsonrpc:'2.0', id, error: { code:-32000, message: err.message } });
  }
});

// ─── Discovery + health ──────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status:'ok', service:'hive-mcp-morph', version:'1.0.0', backend: HIVE_BASE }));
app.get('/.well-known/mcp.json', (req, res) => res.json({
  name: 'hive-mcp-morph',
  endpoint: '/mcp',
  transport: 'streamable-http',
  protocol: '2024-11-05',
  tools: TOOLS.map(t => ({ name: t.name, description: t.description })),
}));

app.listen(PORT, () => {
  console.log(`HiveMorph MCP Server running on :${PORT}`);
  console.log(`  Backend : ${HIVE_BASE}`);
  console.log(`  Tools   : ${TOOLS.length}`);
});

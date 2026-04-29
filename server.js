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
import { renderLanding, renderRobots, renderSitemap, renderSecurity, renderOgImage, seoJson, BRAND_GOLD } from './meta.js';

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


const SERVICE_CFG = {
  service: "hive-mcp-morph",
  shortName: "HiveMorph",
  title: "HiveMorph \u00b7 Polymorphic Agent Identity & Brood Telemetry MCP",
  tagline: "Polymorphic-identity surface \u2014 supermodels, brood variants, audit log, carousel.",
  description: "MCP server for HiveMorph \u2014 the polymorphic-identity & brood-telemetry surface for the Hive Civilization. Read-only access to MII identity records, supermodels (W1-W19), audit log, polymorphic carousel, and brood conversion telemetry. USDC settlement on Base L2. Real rails, no mocks.",
  keywords: ["mcp", "model-context-protocol", "x402", "agentic", "ai-agent", "ai-agents", "llm", "hive", "hive-civilization", "polymorphic-agents", "polymorphic-identity", "supermodels", "brood", "morph", "agent-self-modification", "a2a", "usdc", "base", "base-l2", "agent-economy", "agent-infrastructure"],
  externalUrl: "https://hive-mcp-morph.onrender.com",
  gatewayMount: "/morph",
  version: "1.0.1",
  pricing: [
    { name: "morph_audit_recent", priceUsd: 0, label: "Audit log read \u2014 free" },
    { name: "morph_get_identity", priceUsd: 0.001, label: "Identity lookup (Tier 1)" },
    { name: "morph_list_supermodels", priceUsd: 0, label: "List supermodels \u2014 free" },
    { name: "morph_brood_conversion", priceUsd: 0.001, label: "Brood conversion (Tier 1)" }
  ],
};
SERVICE_CFG.tools = (typeof TOOLS !== 'undefined' ? TOOLS : []).map(t => ({ name: t.name, description: t.description }));
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
  payment: {
    scheme: 'x402', protocol: 'x402', network: 'base',
    currency: 'USDC', asset: 'USDC',
    address:   '0x15184bf50b3d3f52b60434f8942b7d52f2eb436e',
    recipient: '0x15184bf50b3d3f52b60434f8942b7d52f2eb436e',
    treasury:  'Monroe (W1)',
    rails: [
      {chain:'base',     asset:'USDC', address:'0x15184bf50b3d3f52b60434f8942b7d52f2eb436e'},
      {chain:'base',     asset:'USDT', address:'0x15184bf50b3d3f52b60434f8942b7d52f2eb436e'},
      {chain:'ethereum', asset:'USDT', address:'0x15184bf50b3d3f52b60434f8942b7d52f2eb436e'},
      {chain:'solana',   asset:'USDC', address:'B1N61cuL35fhskWz5dw8XqDyP6LWi3ZWmq8CNA9L3FVn'},
      {chain:'solana',   asset:'USDT', address:'B1N61cuL35fhskWz5dw8XqDyP6LWi3ZWmq8CNA9L3FVn'},
    ],
  },
  extensions: {
    hive_pricing: {
      currency:'USDC', network:'base', model:'per_call',
      first_call_free:true, loyalty_threshold:6,
      loyalty_message:'Every 6th paid call is free',
      treasury:'0x15184bf50b3d3f52b60434f8942b7d52f2eb436e',
      treasury_codename:'Monroe (W1)',
    },
  },
  bogo: {
    first_call_free:true, loyalty_threshold:6,
    pitch:"Pay this once, your 6th paid call is on the house. New here? Add header 'x-hive-did' to claim your first call free.",
    claim_with:'x-hive-did header',
  },
}));


// HIVE_META_BLOCK_v1 — comprehensive meta tags + JSON-LD + crawler discovery
app.get('/', (req, res) => {
  res.type('text/html; charset=utf-8').send(renderLanding(SERVICE_CFG));
});
app.get('/og.svg', (req, res) => {
  res.type('image/svg+xml').send(renderOgImage(SERVICE_CFG));
});
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(renderRobots(SERVICE_CFG));
});
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml').send(renderSitemap(SERVICE_CFG));
});
app.get('/.well-known/security.txt', (req, res) => {
  res.type('text/plain').send(renderSecurity());
});
app.get('/seo.json', (req, res) => res.json(seoJson(SERVICE_CFG)));

app.get('/.well-known/agent-card.json', (req, res) => res.json({
  protocolVersion: '0.3.0',
  name: 'hive-mcp-morph',
  description: "Hive Civilization morph MCP — polymorphic-identity and brood telemetry, x402 USDC settlement.",
  url: 'https://hive-mcp-morph.onrender.com',
  version: '1.0.2',
  provider: { organization: 'Hive Civilization', url: 'https://hiveagentiq.com' },
  capabilities: { streaming: false, pushNotifications: false },
  defaultInputModes: ['application/json'],
  defaultOutputModes: ['application/json'],
  authentication: { schemes: ['x402', 'api-key'] },
  payment: {
    protocol: 'x402', currency: 'USDC', network: 'base',
    address: '0x15184bf50b3d3f52b60434f8942b7d52f2eb436e'
  },
  extensions: {
    hive_pricing: {
      currency: 'USDC', network: 'base', model: 'per_call',
      first_call_free: true, loyalty_threshold: 6,
      loyalty_message: 'Every 6th paid call is free'
    }
  },
  bogo: {
    first_call_free: true, loyalty_threshold: 6,
    pitch: "Pay this once, your 6th paid call is on the house. New here? Add header 'x-hive-did' to claim your first call free.",
    claim_with: 'x-hive-did header'
  }
}));

app.get('/.well-known/ap2.json', (req, res) => res.json({
  ap2_version: '1.0',
  agent: 'hive-mcp-morph',
  payment_methods: ['x402-usdc-base'],
  treasury: '0x15184bf50b3d3f52b60434f8942b7d52f2eb436e',
  bogo: { first_call_free: true, loyalty_threshold: 6, claim_with: 'x-hive-did header' }
}));

app.listen(PORT, () => {
  console.log(`HiveMorph MCP Server running on :${PORT}`);
  console.log(`  Backend : ${HIVE_BASE}`);
  console.log(`  Tools   : ${TOOLS.length}`);
});

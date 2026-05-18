interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * NOAA SPC MCP.
 */


const BASE = 'https://www.spc.noaa.gov';
const UA = 'pipeworx-mcp-noaa-spc/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  { name: 'convective_outlook', description: 'Day-N convective outlook GeoJSON.', inputSchema: { type: 'object', properties: { day: { type: 'number', description: '1 (default) | 2 | 3' } } } },
  { name: 'mesoscale_discussions', description: 'Recent mesoscale discussions list (as text page).', inputSchema: { type: 'object', properties: { limit: { type: 'number' } } } },
  { name: 'storm_reports', description: 'Preliminary storm reports CSV.', inputSchema: { type: 'object', properties: { date: { type: 'string', description: 'YYMMDD (default today UTC)' }, kind: { type: 'string', description: 'tornado | wind | hail | filtered (default)' } } } },
  { name: 'watches_active', description: 'Currently-active watches summary text.', inputSchema: { type: 'object', properties: {} } },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'convective_outlook': {
      const day = (args.day as number) ?? 1;
      if (![1, 2, 3].includes(day)) throw new Error('day must be 1 | 2 | 3.');
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const url = `${BASE}/products/outlook/day${day}otlk_cat.lyr.geojson`;
      return spcJson(url);
    }
    case 'mesoscale_discussions': {
      const res = await fetch(`${BASE}/products/md/`, { headers: { 'User-Agent': UA } });
      if (!res.ok) throw new Error(`SPC MD page: ${res.status}`);
      return { format: 'html', body: (await res.text()).slice(0, 30000) };
    }
    case 'storm_reports': {
      const date = (args.date as string | undefined) ?? new Date().toISOString().slice(2, 10).replace(/-/g, '');
      const kind = String(args.kind ?? 'filtered');
      const file = {
        tornado: 'today_torn.csv',
        wind: 'today_wind.csv',
        hail: 'today_hail.csv',
        filtered: 'today_filtered.csv',
      }[kind];
      if (!file) throw new Error('kind must be tornado | wind | hail | filtered.');
      const isToday = !(args.date);
      const url = isToday ? `${BASE}/climo/reports/${file}` : `${BASE}/climo/reports/${date}_rpts_filtered.csv`;
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!res.ok) throw new Error(`SPC storm reports: ${res.status}`);
      return { format: 'csv', body: await res.text() };
    }
    case 'watches_active': {
      const res = await fetch(`${BASE}/products/watch/`, { headers: { 'User-Agent': UA } });
      if (!res.ok) throw new Error(`SPC watches: ${res.status}`);
      return { format: 'html', body: (await res.text()).slice(0, 30000) };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function spcJson(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`SPC: ${res.status}`);
  return res.json();
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;

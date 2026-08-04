# @pipeworx/noaa-spc

NOAA [Storm Prediction Center](https://www.spc.noaa.gov) MCP — convective outlooks, tornado/hail/wind reports, mesoscale discussions. Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `convective_outlook(day?)` — day 1/2/3 convective outlook GeoJSON
- `mesoscale_discussions(limit?)` — recent mesoscale discussions list
- `storm_reports(date?, kind?)` — preliminary storm reports CSV (today by default; kind: tornado | wind | hail | filtered)
- `watches_active()` — currently active watches

## Data source

`https://www.spc.noaa.gov/products/`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "noaa-spc": {
      "url": "https://gateway.pipeworx.io/noaa-spc/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Noaa Spc data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT

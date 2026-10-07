# Project agent notes

## Stitch design integration
- Use the Stitch Design entry skill when applying Stitch canvas designs.
- Stitch MCP is configured in the user Codex config with endpoint https://stitch.googleapis.com/mcp.
- Authentication uses the STITCH_API_KEY environment variable through the X-Goog-Api-Key header. Never store API keys in repository files.
- Crop Management reference canvas: https://stitch.withgoogle.com/projects/8898422202104795737.
- Setup documentation: https://stitch.withgoogle.com/docs/mcp/setup.
- After MCP configuration or credential changes, restart Codex and verify that Stitch tools are available before reading the canvas.

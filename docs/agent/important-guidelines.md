Important guidelines before debugging and implementation

## Platform & Environment

- Primary OS: Windows (PowerShell). Do NOT assume Unix/macOS shell conventions, paths, or config file locations.
- When working with environment variables, PEM keys, or multi-line strings, use PowerShell-compatible syntax.
- Git authentication: Do not attempt interactive credential prompts. If push fails, stop and ask the user to authenticate manually.

## UI Implementation Guidelines

- When matching a reference design or wireframe, implement pixel-accurate details on the FIRST pass: icon sizes, column alignment, text area widths, spacing, and stacked layouts.
- Before presenting UI changes, self-review against the reference for: layout structure, element sizing, alignment, and visual hierarchy.
- Never attempt to use MCP servers (e.g., Figma) that haven't been explicitly configured. Ask the user for a screenshot reference instead.

## Documentation & Task Tracking

- This project uses structured markdown task lists with acceptance criteria checkboxes.
- When updating task status, check off ALL relevant acceptance criteria—don't leave partial updates.
- When creating implementation plans, organize into phases with dependency graphs and write to trackable markdown files.

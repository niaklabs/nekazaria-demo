# Session Context

## User Prompts

### Prompt 1

Work on Linear issue IAG-797:

<issue identifier="IAG-797">
<title>Develop new home screen</title>
<description>
Should develop this new pencil screen -> Node ID: Sfgrg

Should replace current home page (that one was redirected after login)

Ver estado de mi explotacion should redirect to "Mi Explotacion" `/dashboard`

Consultar censo actual should looks as disabled 

Revisar alertas pendientes to notifications page `/normativa`

Iniciar un tramite to Comunicar un nacimiento `nacimientos/crear`
...

### Prompt 2

Base directory for this skill: /Users/gastongraciani/projects/nekarzaria-demo/.claude/skills/agent-browser

# Browser Automation with agent-browser

The CLI uses Chrome/Chromium via CDP directly. Install via `npm i -g agent-browser`, `brew install agent-browser`, or `cargo install agent-browser`. Run `agent-browser install` to download Chrome. Run `agent-browser upgrade` to update to the latest version.

## Core Workflow

Every browser automation follows this pattern:

1. **Navigate**: `agent-br...


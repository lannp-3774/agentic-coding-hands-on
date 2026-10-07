# Agentic Coding Hands-on

[![Vietnamese](https://img.shields.io/badge/Vietnamese-green.svg)](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/blob/main/README.md) [![Japanese](https://img.shields.io/badge/Japanese-yellow.svg)](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/blob/main/README_ja.md) [![English](https://img.shields.io/badge/English-blue.svg)](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/blob/main/README_en.md)

Repository for the Sun\* internal **Agentic Coding** hands-on workshop. Participants will use **MoMorph + Claude Code** to generate code from Figma designs. Besides Claude Code, you can also use other AI coding agents such as **Copilot**, **Gemini**, **Windsurf**, etc. with similar steps and usage. In this hands-on, we assume you are using **Claude Code**.

## Branches

This repository has the following branches:

- [**`main`**](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/tree/main) — Documentation and Supabase configuration only. Participants clone this branch and initialize their own project (Next.js, Android, React Native, iOS, etc.).
- [**`web-sample`**](https://github.com/sun-asterisk-internal/agentic-coding-hands-on/tree/web-sample) — Sample reference for Web (Next.js). Contains pre-built `.claude`, `.vscode`, `.momorph` directories with sample specs and generated code for several screens. Use this to see what the input context and MoMorph-generated output look like.

## Prerequisites

- Git
- Docker (for running Supabase locally)
- [GitHub CLI](https://cli.github.com/)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- [VSCode](https://code.visualstudio.com/) + MoMorph Extension — for viewing Figma frame lists and quickly copying prompts. Especially useful for mobile developers whose primary IDE (Android Studio, Xcode) does not support the MoMorph Extension.

### Suggested Tech Stack

You are not limited to any specific tech stack — feel free to use any framework or language that suits you. However, we recommend the following stacks for the best experience with MoMorph:

- **Backend (common):** [Supabase](https://supabase.com/) — Backend-as-a-Service (BaaS) platform providing database, authentication, and real-time features
- **Web:** Next.js + Cloudflare Workers + TailwindCSS + Supabase
- **Android:** Kotlin + Jetpack Compose + Supabase
- **iOS:** Swift + SwiftUI + Supabase
- **React Native:** React Native + Expo + Supabase

## Hands-on Guide

### Step 0: Complete GitHub SSO

1. Visit https://github.com/orgs/sun-asterisk-internal/sso
2. Complete the SSO sign-in process so your GitHub account can join the `sun-asterisk-internal` organization

### Step 1: Initialize your project

Create a new project using the appropriate tool for your chosen platform:

```sh
# Web (Next.js):
npx create-next-app@latest my-app
cd my-app

# Android:
# Open Android Studio → New Project → create a new project

# React Native (Expo):
npx create-expo-app my-app
cd my-app

# iOS (Swift):
# Open Xcode → Create New Project → create a new project
```

After initialization, set up git remotes as follows:

```sh
git init    # if the project doesn't have git yet

# origin: your personal fork (replace <your-username> with your GitHub username)
git remote add origin git@github.com:<your-username>/agentic-coding-hands-on.git

# upstream: the original hands-on repository
git remote add upstream git@github.com:sun-asterisk-internal/agentic-coding-hands-on.git
```

Verify with `git remote -v` — the expected output should look like:

```
origin    git@github.com:<your-username>/agentic-coding-hands-on.git (fetch)
origin    git@github.com:<your-username>/agentic-coding-hands-on.git (push)
upstream  git@github.com:sun-asterisk-internal/agentic-coding-hands-on.git (fetch)
upstream  git@github.com:sun-asterisk-internal/agentic-coding-hands-on.git (push)
```

> **Why set the remotes?** The MoMorph VSCode Extension needs to identify the repository to display the linked Figma file. The `upstream` remote pointing to `sun-asterisk-internal/agentic-coding-hands-on` ensures MoMorph works correctly, while `origin` points to your personal fork so you can push your own code.

### Step 2: Sign in to MoMorph Web and connect your GitHub account

> **Note:** This MoMorph exercise is already linked to the `sun-asterisk-internal/agentic-coding-hands-on` repository. You only need to connect your GitHub account to MoMorph to get started. Never update the **Select Repository** field in step 4, even if it appears empty. Changing it will make the exercise inaccessible for everyone else.

1. Go to [MoMorph Web](https://momorph.ai/) and sign in with your Figma account (use your `*@sun-asterisk.com` email).
2. Enter the following Figma file link to continue: https://www.figma.com/design/9ypp4enmFmdK3YAFJLIu6C/SAA-2025---Internal-Live-Coding
3. Confirm your GitHub account is already a member of the `sun-asterisk-internal` organization (the outcome of [Step 0](#step-0-complete-github-sso)) before moving on. If not, ask Infra to add you to the organization.
4. In MoMorph, go to **Settings → GitHub → Connect** to link your GitHub account with MoMorph. **Never update the Select Repository field**.

> **Important:** Without being a member of the `sun-asterisk-internal` organization, you **cannot access the MoMorph MCP** to fetch spec/design data, and **cannot view Figma data on the MoMorph VSCode Extension** in the following steps. Make sure to complete this step before continuing.
>
> After connecting successfully, **refresh the Settings page** on MoMorph Web — you will see the **Select Repository** field showing `sun-asterisk-internal/agentic-coding-hands-on` and being **disabled**. This is the correct and expected state.

### Step 3: Install and sign in to GitHub CLI

Choose one of the following installation methods:

```sh
# macOS / Linux (Homebrew):
brew install gh

# Windows (winget):
winget install --id GitHub.cli

# Linux (Debian/Ubuntu):
sudo apt install gh

# Windows / macOS / Linux (Conda):
conda install gh --channel conda-forge
```

Verify the installation:

```sh
gh --version
```

Sign in to GitHub CLI:

```sh
gh auth login
```

Follow the CLI prompts: select `GitHub.com`, pick `HTTPS` or `SSH` protocol, and complete authentication in your browser.

Check the authentication status:

```sh
gh auth status
```

### Step 4: Install Takumi CLI

Install the Takumi CLI via npm:

```sh
npm install -g @sunasteriskrnd/takumi
```

Expected output:

```
Installed takumi@0.1.0
```

Initialize Takumi for the current project:

```sh
tkm init
```

Expected output:

```
Initialized — 16 agents, 75+ skills ready
```

Verify your environment:

```sh
tkm doctor
```

Expected output:

```
All checks passed
```

### Step 5: Register MCP Servers

Register 2 MCP servers for Claude Code: **MoMorph** (so Takumi can access specs and designs via MCP) and **Playwright** (for browser automation during visual validation / UI testing):

```sh
claude mcp add --transport http momorph https://mcp.momorph.ai/mcp --header "x-github-token: $(gh auth token)"
claude mcp add playwright npx @playwright/mcp@latest
```

> **Note:** The `momorph` MCP server command uses `gh auth token` to fetch the GitHub token from Step 3. If you haven't successfully signed in to GitHub CLI, this command will fail.

### Step 6: Install MoMorph VSCode Extension

Install the MoMorph VSCode Extension from the VSIX file included in the `resources/` directory:

```sh
code --install-extension resources/vscode-momorph-0.13.0.vsix
```

After installation, open the repo source code in VSCode → open the Command Palette (`Cmd+Shift+P` on macOS or `Ctrl+Shift+P` on Windows/Linux) → run **"MoMorph: Sign In"** → click on the MoMorph icon in the sidebar → you will see the frame list of the linked Figma file.

> Refer to the detailed guide here: https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F094K2LTV71?focus_section_id=temp:C:USe2e5a076e79fd458c9b713260c

### Step 7: Use the MoMorph VSCode Extension

The MoMorph VSCode Extension displays the Figma Tree of the linked Figma file, making it easy to look up and fetch frame information (link, ID, prompt, etc.) during development.

To keep the Figma Tree focused, filter it by the platform you are working on:

1. Open the Command Palette: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
2. Run: **MoMorph: Filter Screens**
3. Filter by: **Figma Pages**
   - For **Mobile** (Android / iOS / React Native): select **"Mobile"**
   - For **Web**: select **"Website"**
4. Filter by: **Spec Status** → Select **"Done"**

This filters the Figma Tree to show only screens for your platform with completed specifications, making your workflow faster and more focused.

> **Tip:** In the Figma Tree, you can select multiple screens at once by holding `Cmd` (macOS) / `Ctrl` (Windows/Linux) and left-clicking each screen. Then right-click → select **Copy Screen Information** to copy information for all selected screens at once — very handy when generating code for multiple screens in parallel.

### Step 8: Start generating code

Use the Figma project for practice:

**Figma file:** [SAA 2025 - Internal Live Coding](https://www.figma.com/design/9ypp4enmFmdK3YAFJLIu6C/SAA-2025---Internal-Live-Coding)

#### Preparing context: Writing Screen Specs on MoMorph Web

Normally, before starting code generation, you need to prepare complete *Screen Specifications* on MoMorph. Screen Specifications can be written manually, generated by AI through features on MoMorph Web, the MoMorph Figma Plugin (requires a Figma Account with Full Seat), or through Agent systems (GitHub Copilot, Claude Code) when connected to the MoMorph MCP Server.

Screen specs on the server are the source of truth for the entire code generation workflow.

> **Note for this hands-on session:** Screen specs for all screens have already been prepared on the MoMorph server, so you **do not need to create screen specs** and can **jump straight into the code generation workflow with Takumi Agent Kit**. However, you are still encouraged to explore the Screen Spec creation process with MoMorph in more depth.
> - Please refer to the [MoMorph Figma Plugin](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F07S87PSVUN) documentation to learn more about writing Screen Specs.

#### Code generation workflow with Takumi Agent Kit

Takumi Agent Kit provides slash commands and agent skills integrated with the MoMorph MCP to generate code from Figma design. Depending on your goal and feature complexity, pick one of the **4 scenarios** below.

##### Scenario 1: Simple or medium feature

*Clear scope, anywhere from a few minutes to 1–2 days of work, no need to review a plan before coding.*

Call `/tkm:takumi` with one or more MoMorph Screen URLs. Takumi reads specs and test cases through the MoMorph MCP, clarifies any gaps, then writes code matching your project patterns — UI aligned to Figma, backend running in parallel. Code reviewer activates automatically. **One command, one PR.**

```
/tkm:takumi <MoMorph Screen URLs>
```

Example:

```
/tkm:takumi Implement the login page (/login), use Supabase local project:
https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
```

##### Scenario 2: Complex feature

*New subsystem, multiple screens with complex interactions, business logic that touches core infrastructure — scope needs review before coding, multi-day work.*

Run `/tkm:create-plan` with MoMorph Screen URLs to break the feature down into phases with concrete acceptance criteria. Review the plan, adjust if needed, then `/tkm:takumi path/to/plan.md` executes each phase with checkpoints. Planning first helps align on scope and avoid going in the wrong direction mid-flight — especially needed when multiple people collaborate or the feature touches core infrastructure.

```
/tkm:create-plan <MoMorph Screen URLs>
/tkm:takumi [plan]
```

Example:

```
/tkm:create-plan Implement admin dashboard with RBAC, user management, and audit logs, use Supabase local project:
1. Dashboard: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/K3mF2nLpQ7
2. UsersList: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/RxV8aBcD2e
3. UserDetail: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/H4nMpL6vWq
```

```
/tkm:takumi plans/260512-1030-admin-dashboard/plan.md
```

##### Scenario 3: UI only from design

*You only need to turn Figma design into UI components — no backend, no business logic.*

Skip the full Takumi pipeline and call the `/momorph-implement-design` skill directly. The skill reads the screen through the MoMorph MCP, extracts exact visual values from the design (no guessing), generates UI components with mock data sourced from the design itself, and runs a visual validation loop against the Figma reference until the output matches. The fastest path when the goal is purely visual.

```
/momorph-implement-design <MoMorph Screen URLs>
```

Example:

```
/momorph-implement-design Build the login page UI from design:
https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
```

##### Scenario 4: Fix a bug on a screen

*The current code for a screen has a bug — wrong UI, faulty logic, missing validation, or the design/spec/test case on MoMorph has been updated but the code has not caught up.*

Call `/tkm:fix-bug` with a bug description and the MoMorph screen URL. The skill pulls the current code along with the design, spec, and test cases, then diffs them to identify exactly where the code drifted from the source-of-truth. The root cause surfaces with `file:line`, the fix is applied as a minimal patch, and the related spec and test cases are re-run to verify before committing.

```
/tkm:fix-bug <bug description> <MoMorph Screen URL>
```

Example:

```
/tkm:fix-bug The login button does not submit the form when Enter is pressed, and the validation message disappears after the user edits the input:
https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
```

## References

- [Takumi Agent Kit](https://takumi.sun-asterisk.ai/)
- [Takumi — Working with MoMorph](https://takumi.sun-asterisk.ai/docs/use-cases/momorph-codegen/)
- [GitHub CLI Installation](https://github.com/cli/cli#installation)
- [MoMorph MCP Server](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F0A9HULD5D0)
- [MoMorph VSCode Extension](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F094K2LTV71)
- [MoMorph Web](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F092SAQBXR8)
- [MoMorph Figma Plugin](https://sun-asterisk.enterprise.slack.com/docs/T02CQGZA7MK/F07S87PSVUN)

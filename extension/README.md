# CodeMentor AI Extension

CodeMentor AI is a lightweight VS Code sidebar extension that reviews code with your existing FastAPI backend and mirrors the design language of the React app.

## Features

- Analyze selected code
- Analyze the current file
- View bug detection, fix suggestions, complexity, validation, and AI explanation in a sidebar webview
- Copy improved code from the review results
- Works with a local FastAPI backend or a deployed backend URL

## Setup

1. Open the `extension/` folder in VS Code.
2. Press `F5` to launch the Extension Development Host.
3. In the new window, open the CodeMentor AI sidebar from the Activity Bar.
4. Start your FastAPI backend.

## Backend URL

Set the backend URL in VS Code settings:

- `codementorAI.backendBaseUrl`

Default:

```text
http://127.0.0.1:8000
```

## Commands

- `CodeMentor AI: Open Sidebar`
- `CodeMentor AI: Analyze with CodeMentor AI`
- `CodeMentor AI: Analyze Current File`

## Packaging

Install VSCE and package the extension:

```bash
npm install -g @vscode/vsce
cd extension
vsce package
```

Publish after you create and sign in to a VS Code Marketplace publisher:

```bash
vsce publish
```

## Notes

- The extension expects the FastAPI `/review-code` endpoint.
- The UI intentionally follows the same orange-and-white visual style as the React app.
- Use the same backend locally during development and swap the backend URL later for deployment.

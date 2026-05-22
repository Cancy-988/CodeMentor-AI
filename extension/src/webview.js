const fs = require('fs')
const path = require('path')

function createWebviewHtml(webview, extensionUri, initialState) {
  const nonce = getNonce()
  const stateJson = JSON.stringify(initialState || {}).replace(/<\//g, '<\\/')
  const clientScriptPath = path.join(extensionUri.fsPath, 'media', 'webview-client.js')
  const clientScript = fs.readFileSync(clientScriptPath, 'utf8').replace('__STATE_JSON__', stateJson)

  return /* html */ `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';" />
      <title>CodeMentor AI</title>
      <style>
        :root {
          color-scheme: light;
          --bg: #fffaf4;
          --surface: rgba(255, 255, 255, 0.94);
          --surface-soft: #fff5ea;
          --line: #fed7aa;
          --line-strong: #fb923c;
          --text: #1f2937;
          --muted: #6b7280;
          --accent: #f97316;
          --accent-deep: #ea580c;
          --accent-soft: #ffedd5;
          --shadow: 0 18px 60px rgba(234, 88, 12, 0.08);
          --shadow-soft: 0 10px 30px rgba(234, 88, 12, 0.06);
        }

        * { box-sizing: border-box; }
        html, body { height: 100%; margin: 0; }
        body {
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background:
            radial-gradient(circle at top left, rgba(251, 146, 60, 0.18), transparent 24%),
            radial-gradient(circle at top right, rgba(249, 115, 22, 0.12), transparent 26%),
            linear-gradient(180deg, #fffdf9 0%, #fff7ef 48%, #fffaf4 100%);
          color: var(--text);
        }

        body::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          background-image: linear-gradient(rgba(251, 146, 60, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(251, 146, 60, 0.05) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.2), transparent 90%);
        }

        ::selection { background: rgba(249, 115, 22, 0.24); color: #111827; }
        .app { height: 100%; display: flex; flex-direction: column; padding: 10px; gap: 10px; overflow: hidden; }
        .shell { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 10px; overflow: hidden; }
        .hero, .panel, .loading, .empty, .error, .card {
          border: 1px solid var(--line);
          background: var(--surface);
          border-radius: 24px;
          box-shadow: var(--shadow-soft);
          backdrop-filter: blur(18px);
        }
        .hero { padding: 14px; background: linear-gradient(135deg, rgba(255, 237, 213, 0.9), rgba(255, 255, 255, 0.98)); }
        .eyebrow { margin: 0; font-size: 11px; font-weight: 700; letter-spacing: 0.24em; text-transform: uppercase; color: var(--accent); }
        .title { margin: 6px 0 0; font-size: 17px; line-height: 1.25; color: var(--text); }
        .subtle { margin: 8px 0 0; color: var(--muted); font-size: 12px; line-height: 1.6; }
        .topbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }
        .actions, .pill-row, .button-row { display: flex; flex-wrap: wrap; gap: 8px; }
        .tag, .tab, .button, .pill {
          display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; border: 1px solid var(--line);
          text-decoration: none; white-space: nowrap; transition: transform 160ms ease, background-color 160ms ease, border-color 160ms ease, color 160ms ease;
        }
        .tag { padding: 8px 12px; background: white; color: var(--accent-deep); font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; box-shadow: 0 8px 20px rgba(234, 88, 12, 0.08); }
        .button { padding: 9px 12px; background: white; color: var(--text); font-size: 13px; font-weight: 700; cursor: pointer; }
        .button.primary { border-color: var(--accent); background: var(--accent); color: white; box-shadow: 0 12px 30px rgba(249, 115, 22, 0.18); }
        .button:hover, .tab:hover { transform: translateY(-1px); border-color: var(--line-strong); }
        .button.primary:hover { background: var(--accent-deep); border-color: var(--accent-deep); }
        .tab-bar { display: flex; align-items: end; gap: 6px; overflow-x: auto; padding: 8px 10px 0; border-bottom: 1px solid var(--line); background: #fff7ed; }
        .tab { padding: 9px 12px; background: #fff7ed; color: #6b7280; font-size: 12px; font-weight: 700; border-bottom-left-radius: 0; border-bottom-right-radius: 0; margin-bottom: -1px; }
        .tab.active { background: white; color: var(--accent-deep); border-color: var(--line); border-bottom-color: white; box-shadow: 0 -8px 20px rgba(249, 115, 22, 0.08); }
        .panel { min-height: 0; overflow: hidden; display: flex; flex-direction: column; }
        .panel-body { min-height: 0; overflow: auto; padding: 12px; display: grid; gap: 10px; }
        .card { padding: 14px; background: white; }
        .card.soft { background: linear-gradient(180deg, var(--surface-soft), white); }
        .card-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
        .card-title { margin: 0; font-size: 13px; font-weight: 800; color: var(--text); letter-spacing: 0.08em; text-transform: uppercase; }
        .card-note { margin: 6px 0 0; color: var(--muted); font-size: 12px; line-height: 1.6; }
        .grid { display: grid; gap: 10px; }
        .grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .grid.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        @media (max-width: 720px) { .grid.two, .grid.three { grid-template-columns: 1fr; } }
        .status { display: inline-flex; align-items: center; justify-content: center; padding: 7px 12px; border-radius: 999px; border: 1px solid var(--line); background: #fff7ed; color: var(--accent-deep); font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
        .status.good { background: #fff7ed; color: var(--accent-deep); }
        .status.warn { background: #fffbeb; color: #b45309; border-color: #fde68a; }
        .status.error { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
        .code-shell { overflow: hidden; border-radius: 18px; border: 1px solid var(--line); background: #fffaf4; }
        .code-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 9px 10px; border-bottom: 1px solid var(--line); background: #fff7ed; }
        .code-label { margin: 0; font-size: 11px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: #9a3412; }
        pre { margin: 0; padding: 12px; overflow: auto; font-family: Consolas, 'Liberation Mono', Menlo, monospace; font-size: 11px; line-height: 1.65; white-space: pre; color: #111827; }
        .tok-keyword { color: #c2410c; font-weight: 700; }
        .tok-string { color: #15803d; }
        .tok-comment { color: #6b7280; font-style: italic; }
        .tok-number { color: #b45309; }
        .tok-fn { color: #7c2d12; font-weight: 700; }
        .loading { padding: 14px; display: grid; gap: 10px; }
        .loader-row { display: flex; align-items: center; gap: 12px; }
        .spinner { width: 40px; height: 40px; border-radius: 14px; border: 1px solid var(--line); background: white; display: grid; place-items: center; }
        .spinner::after { content: ''; width: 18px; height: 18px; border-radius: 999px; border: 2px solid rgba(251, 146, 60, 0.25); border-top-color: var(--accent); animation: spin 0.8s linear infinite; }
        .bar { height: 6px; overflow: hidden; border-radius: 999px; background: white; border: 1px solid var(--line); }
        .bar > span { display: block; height: 100%; width: 50%; border-radius: inherit; background: linear-gradient(90deg, var(--accent), #fbbf24, var(--accent-deep)); animation: sweep 1.2s ease-in-out infinite; }
        .skeleton { position: relative; overflow: hidden; }
        .skeleton::after { content: ''; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, transparent, rgba(251, 146, 60, 0.09), transparent); animation: shimmer 1.4s ease-in-out infinite; }
        .error { padding: 14px; border-color: #fecaca; background: #fef2f2; color: #991b1b; font-size: 13px; line-height: 1.7; }
        .empty { padding: 14px; color: var(--muted); font-size: 12px; line-height: 1.6; background: #fffaf4; }
        .compact-meta { display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .compact-stack { display: grid; gap: 10px; }
        .section-actions { display: flex; flex-wrap: wrap; gap: 8px; }
        .section-actions .button { flex: 1 1 140px; }
        .sidebar-note { margin-top: 10px; padding: 10px 12px; border-radius: 16px; background: #fff7ed; border: 1px solid var(--line); color: var(--muted); font-size: 12px; line-height: 1.6; }
        @media (max-width: 460px) { .compact-meta { grid-template-columns: 1fr; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes sweep { 0% { transform: translateX(-45%); opacity: 0.65; } 50% { transform: translateX(55%); opacity: 1; } 100% { transform: translateX(145%); opacity: 0.65; } }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; } }
      </style>
    </head>
    <body>
      <div class="app">
        <div class="shell" id="app"></div>
      </div>
      <script nonce="${nonce}">
${clientScript}
      </script>
    </body>
    </html>
  `
}

function getNonce() {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let index = 0; index < 32; index += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return text
}

module.exports = {
  createWebviewHtml
}

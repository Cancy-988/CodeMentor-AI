const path = require('path')
const vscode = require('vscode')

const { getBackendBaseUrl, languageFromLanguageId, reviewCode } = require('./src/apiService')
const { createWebviewHtml } = require('./src/webview')

class CodeMentorSidebarProvider {
  constructor(extensionUri, apiClient) {
    this._extensionUri = extensionUri
    this._apiClient = apiClient
    this._view = null
    this._state = {
      loading: false,
      error: '',
      result: null,
      sourceCode: '',
      sourceLabel: 'Ready to analyze code from the editor.',
      language: 'javascript',
      fileName: 'No file open',
      activeTab: 'overview'
    }
  }

  resolveWebviewView(webviewView) {
    this._view = webviewView
    webviewView.webview.options = {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, 'media')]
    }

    webviewView.webview.html = createWebviewHtml(webviewView.webview, this._extensionUri, this._state)

    webviewView.webview.onDidReceiveMessage(async (message) => {
      if (!message || !message.type) {
        return
      }

      if (message.type === 'analyze-selected') {
        await this.analyzeActiveEditor({ selectedOnly: true })
        return
      }

      if (message.type === 'analyze-current-file') {
        await this.analyzeActiveEditor({ selectedOnly: false })
      }
    })

    this._postState()
  }

  async analyzeActiveEditor({ selectedOnly }) {
    const editor = vscode.window.activeTextEditor

    if (!editor) {
      this._setState({
        ...this._state,
        loading: false,
        error: 'Open a file in the editor first.',
        result: null,
        sourceCode: '',
        sourceLabel: 'No active editor found.'
      })
      return
    }

    const document = editor.document
    const code = selectedOnly ? document.getText(editor.selection) : document.getText()
    const fileName = path.basename(document.fileName)

    if (selectedOnly && editor.selection.isEmpty) {
      this._setState({
        ...this._state,
        loading: false,
        error: 'Select some code first, then run Analyze with CodeMentor AI.',
        result: null,
        fileName,
        sourceCode: '',
        sourceLabel: 'No selection detected.'
      })
      vscode.window.showInformationMessage('Select code first, then run Analyze with CodeMentor AI.')
      return
    }

    if (!code.trim()) {
      this._setState({
        ...this._state,
        loading: false,
        error: 'The current source is empty.',
        result: null,
        fileName,
        sourceCode: '',
        sourceLabel: 'Nothing to analyze.'
      })
      return
    }

    const language = languageFromLanguageId(document.languageId)
    const sourceLabel = selectedOnly ? 'Selected code' : 'Current file'

    this._setState({
      ...this._state,
      loading: true,
      error: '',
      result: null,
      fileName,
      language,
      sourceCode: code,
      sourceLabel,
      activeTab: 'overview'
    })

    try {
      const result = await this._apiClient.reviewCode({
        code,
        language
      })

      this._setState({
        ...this._state,
        loading: false,
        error: '',
        result,
        fileName,
        language,
        sourceCode: code,
        sourceLabel,
        activeTab: 'overview'
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The CodeMentor AI review request failed.'
      this._setState({
        ...this._state,
        loading: false,
        error: message,
        result: null,
        fileName,
        language,
        sourceCode: code,
        sourceLabel
      })
      vscode.window.showErrorMessage(message)
    }
  }

  _setState(nextState) {
    this._state = nextState
    this._postState()
  }

  _postState() {
    if (!this._view) {
      return
    }

    this._view.webview.postMessage({ type: 'state', state: this._state })
  }
}

function activate(context) {
  const backendBaseUrl = getBackendBaseUrl()
  const apiClient = {
    reviewCode: (payload) => reviewCode({ ...payload, baseUrl: backendBaseUrl })
  }
  const sidebarProvider = new CodeMentorSidebarProvider(context.extensionUri, apiClient)

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('codementorAI.sidebar', sidebarProvider),
    vscode.commands.registerCommand('codementorAI.openSidebar', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.codementorAI')
    }),
    vscode.commands.registerCommand('codementorAI.analyzeSelection', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.codementorAI')
      await sidebarProvider.analyzeActiveEditor({ selectedOnly: true })
    }),
    vscode.commands.registerCommand('codementorAI.analyzeCurrentFile', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.codementorAI')
      await sidebarProvider.analyzeActiveEditor({ selectedOnly: false })
    })
  )
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}

const pathSeparatorPattern = /[\\/]+/

const languageByExtension = {
  '.js': 'javascript',
  '.jsx': 'jsx',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.py': 'python',
  '.java': 'java',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.cxx': 'cpp'
}

const preferredEntryFiles = ['index.js', 'main.js', 'app.js', 'index.jsx', 'main.jsx', 'app.jsx', 'index.ts', 'main.ts', 'app.ts', 'index.tsx', 'main.tsx', 'app.tsx', 'index.py', 'main.py', 'app.py', 'main.cpp', 'main.java']

export function guessLanguageFromFileName(fileName = '') {
  const lowerName = fileName.toLowerCase()
  const dotIndex = lowerName.lastIndexOf('.')

  if (dotIndex === -1) {
    return 'javascript'
  }

  const extension = lowerName.slice(dotIndex)
  return languageByExtension[extension] || 'javascript'
}

export function pickPrimaryWorkspaceFile(files = []) {
  for (const preferredName of preferredEntryFiles) {
    const match = files.find((file) => (file.path || file.filename || '').toLowerCase().endsWith(preferredName))

    if (match) {
      return match
    }
  }

  return files[0] || null
}

export function buildFileTree(files = []) {
  const root = { name: 'root', type: 'folder', path: '', children: [] }

  for (const file of files) {
    const path = (file.path || file.filename || '').replace(pathSeparatorPattern, '/')

    if (!path) {
      continue
    }

    const segments = path.split('/').filter(Boolean)
    let currentNode = root

    segments.forEach((segment, index) => {
      const isLeaf = index === segments.length - 1
      let child = currentNode.children.find((candidate) => candidate.name === segment)

      if (!child) {
        child = {
          name: segment,
          type: isLeaf ? 'file' : 'folder',
          path: segments.slice(0, index + 1).join('/'),
          children: []
        }
        currentNode.children.push(child)
      }

      if (isLeaf) {
        child.type = 'file'
        child.content = file.content || ''
        child.language = file.language || guessLanguageFromFileName(segment)
        child.filename = file.filename || segment
        child.file_type = file.file_type || 'code'
        child.mime_type = file.mime_type || null
        child.extracted_text = file.extracted_text || null
      }

      currentNode = child
    })
  }

  return root.children
}

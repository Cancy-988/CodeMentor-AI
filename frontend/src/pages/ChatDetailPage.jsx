import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { authFetch } from '../lib/apiClient'

export function ChatDetailPage() {
  const { chatId } = useParams()
  const [chat, setChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const res = await authFetch(`/api/chats/${chatId}`)
      if (!mounted) return
      if (!res.ok) {
        setChat(null)
        setMessages([])
      } else {
        const data = await res.json()
        setChat(data)
        setMessages(data.messages || [])
      }
      setLoading(false)
    }
    load()
    return () => (mounted = false)
  }, [chatId])

  const sendMessage = async () => {
    if (!text.trim()) return
    const res = await authFetch(`/api/chats/${chatId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'user', content: text })
    })
    if (res.ok) {
      const m = await res.json()
      setMessages((cur) => [...cur, m])
      setText('')
    }
  }

  if (loading) return <div className="p-6">Loading...</div>

  if (!chat) return <div className="p-6">Chat not found.</div>

  return (
    <main className="min-h-screen bg-[#fffaf4] p-6">
      <h1 className="text-2xl font-semibold mb-2">{chat.title || 'Untitled'}</h1>
      <p className="text-sm text-slate-600 mb-4">{chat.summary}</p>

      <div className="space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`rounded-lg p-3 ${m.role === 'assistant' ? 'bg-white' : 'bg-orange-50'}`}>
            <div className="text-sm text-slate-800">{m.content}</div>
            <div className="text-xs text-slate-500 mt-1">{new Date(m.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-2">
        <input className="flex-1 rounded-lg border px-4 py-2" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="rounded-lg bg-orange-500 px-4 py-2 text-white" onClick={sendMessage}>Send</button>
      </div>
    </main>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { authFetch } from '../lib/apiClient'

export function ChatsPage() {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const res = await authFetch('/api/chats')
      if (!mounted) return
      if (!res.ok) {
        setChats([])
      } else {
        const data = await res.json()
        setChats(data)
      }
      setLoading(false)
    }
    load()
    return () => (mounted = false)
  }, [])

  return (
    <main className="min-h-screen bg-[#fffaf4] p-6">
      <h1 className="text-2xl font-semibold mb-4">Chats</h1>
      {loading ? <p>Loading...</p> : null}
      {!loading && chats.length === 0 ? <p>No chats yet.</p> : null}
      <ul className="space-y-3">
        {chats.map((c) => (
          <li key={c.id} className="rounded-lg border bg-white p-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{c.title || 'Untitled'}</h3>
                <p className="text-sm text-slate-600">{c.summary}</p>
              </div>
              <div className="text-sm text-slate-500">{new Date(c.updated_at).toLocaleString()}</div>
            </div>
            <div className="mt-3 text-right">
              <Link to={`/chats/${c.id}`} className="text-sm font-semibold text-orange-600">Open</Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}

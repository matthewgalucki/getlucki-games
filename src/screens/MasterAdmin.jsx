import { useState, useEffect } from 'react'
import { supabase } from '../supabase.js'
import { DEFAULT_ORDER } from '../data.js'
import { Btn, Toast } from '../components.jsx'
import RankingEditor from '../RankingEditor.jsx'

// Master admin page to maintain Getlucki's official default power rankings.
// These become the starting point for every NEW league created.
// Existing leagues keep their frozen snapshot and are unaffected.

const MASTER_PW = 'getlucki-master-2025'  // change this to your own secret

export default function MasterAdmin({ onNavigate }) {
  const [auth, setAuth]     = useState(false)
  const [pw, setPw]         = useState('')
  const [pwErr, setPwErr]   = useState('')
  const [order, setOrder]   = useState(DEFAULT_ORDER)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [toast, setToast]     = useState('')
  const [dirty, setDirty]     = useState(false)

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('default_rankings').select('abbr,rank').order('rank')
      if (data?.length === 32) setOrder(data.map(r => r.abbr))
      setLoading(false)
    })()
  }, [])

  async function save() {
    setSaving(true)
    const rows = order.map((abbr, i) => ({ abbr, rank: i + 1, updated_at: new Date().toISOString() }))
    const { error } = await supabase.from('default_rankings').upsert(rows, { onConflict: 'abbr' })
    if (!error) { setToast('Default rankings saved ✓'); setDirty(false) }
    else setToast('Save failed: ' + error.message)
    setSaving(false)
  }

  if (!auth) return (
    <div style={{ minHeight:'100vh', background:'#060d16', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ maxWidth:360, width:'100%', padding:24, textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🔒</div>
        <h2 style={{ color:'#f1f5f9', marginBottom:6, fontWeight:900 }}>Master Admin</h2>
        <p style={{ color:'#94a3b8', fontSize:13, marginBottom:24 }}>Getlucki default power rankings.</p>
        <input
          type="password" value={pw} onChange={e => setPw(e.target.value)}
          placeholder="Master password" onKeyDown={e => e.key==='Enter' && (pw===MASTER_PW ? setAuth(true) : setPwErr('Wrong password.'))}
          style={{ width:'100%', background:'#0c1421', border:'1px solid #1a2332', borderRadius:10, padding:'11px 14px', color:'#f1f5f9', fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:10, fontFamily:'inherit' }}
        />
        {pwErr && <p style={{ color:'#f87171', fontSize:13, marginBottom:10 }}>{pwErr}</p>}
        <Btn onClick={() => pw===MASTER_PW ? setAuth(true) : setPwErr('Wrong password.')} style={{ width:'100%', borderRadius:10 }}>Unlock</Btn>
        <button onClick={() => onNavigate('home')} style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer', fontSize:13, marginTop:16, fontFamily:'inherit' }}>← Back to Getlucki Games</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#060d16' }}>
      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
      <nav style={{ padding:'18px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #0d1f0f' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={() => onNavigate('home')} style={{ background:'none', border:'none', color:'#94a3b8', cursor:'pointer', fontSize:22, lineHeight:1 }}>←</button>
          <div>
            <div style={{ fontWeight:800, fontSize:17, color:'#f1f5f9' }}>Master Power Rankings</div>
            <div style={{ fontSize:11, color:'#94a3b8' }}>The default starting values for all new leagues</div>
          </div>
        </div>
        <Btn onClick={save} disabled={saving || !dirty}>
          {saving ? 'Saving…' : dirty ? '💾 Save Rankings' : '✓ Saved'}
        </Btn>
      </nav>

      <div style={{ maxWidth:600, margin:'32px auto', padding:'0 24px 100px' }}>
        <div style={{ background:'#0d2818', border:'1px solid #16a34a', borderRadius:12, padding:'14px 18px', marginBottom:20 }}>
          <div style={{ fontSize:13, color:'#4ade80', fontWeight:700, marginBottom:4 }}>ℹ️ How this works</div>
          <p style={{ fontSize:12, color:'#86efac', margin:0, lineHeight:1.6 }}>
            Editing here changes the defaults for <strong>newly created leagues only</strong>. Leagues that already launched keep their frozen prices. Update these weekly as your power rankings shift (injuries, trades, preseason form).
          </p>
        </div>

        {loading
          ? <p style={{ color:'#94a3b8', textAlign:'center', padding:'40px 0' }}>Loading current rankings…</p>
          : <RankingEditor order={order} onChange={(o) => { setOrder(o); setDirty(true) }} />
        }
      </div>
    </div>
  )
}

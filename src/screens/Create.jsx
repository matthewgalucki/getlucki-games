import { useState } from 'react'
import { supabase } from '../supabase.js'
import { slugify, randCode } from '../data.js'
import { Btn, Input, Toggle, Card } from '../components.jsx'

export default function Create({ onNavigate }) {
  const [form, setForm] = useState({
    name:'', organizer:'', password:'', confirmPassword:'',
    is_public:true, budget:120, picks_min:6, picks_max:7,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function create() {
    if (!form.name.trim())           return setError('League name is required.')
    if (!form.organizer.trim())      return setError('Your name is required.')
    if (!form.password.trim())       return setError('Password is required.')
    if (form.password !== form.confirmPassword) return setError("Passwords don't match.")
    if (form.picks_min > form.picks_max) return setError('Min picks cannot exceed max picks.')

    setLoading(true); setError('')
    const id        = slugify(form.name) + '-' + Date.now().toString(36)
    const join_code = randCode()

    const { error: err } = await supabase.from('leagues').insert({
      id, name:form.name.trim(), join_code,
      organizer_name:form.organizer.trim(),
      organizer_password:form.password,
      is_public:form.is_public,
      budget:form.budget,
      picks_min:form.picks_min,
      picks_max:form.picks_max,
      season:2025,
    })

    if (err) { setError('Failed to create league: ' + err.message); setLoading(false); return }
    onNavigate('league', id, { isOrganizer:true })
  }

  return (
    <div style={{ minHeight:'100vh', background:'#060d16' }}>
      <nav style={{ padding:'18px 28px', display:'flex', alignItems:'center', gap:14, borderBottom:'1px solid #0d1f0f' }}>
        <button onClick={() => onNavigate('home')} style={{ background:'none', border:'none', color:'#475569', cursor:'pointer', fontSize:22, lineHeight:1 }}>←</button>
        <div style={{ fontWeight:800, fontSize:17, color:'#f1f5f9' }}>Create a BankRoll League</div>
      </nav>

      <div style={{ maxWidth:540, margin:'40px auto', padding:'0 24px 100px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:36 }}>
          <span style={{ fontSize:40 }}>💰</span>
          <div>
            <div style={{ fontWeight:900, fontSize:22, color:'#f1f5f9' }}>BankRoll</div>
            <div style={{ fontSize:13, color:'#475569' }}>NFL season-long budget draft</div>
          </div>
        </div>

        <Input label="LEAGUE NAME" value={form.name} placeholder='e.g. "Vietri Pick 6"' onChange={e => set('name', e.target.value)} />
        <Input label="YOUR NAME (ORGANIZER)" value={form.organizer} placeholder="e.g. Ben Vietri" onChange={e => set('organizer', e.target.value)} />
        <Input label="ORGANIZER PASSWORD" type="password" value={form.password} placeholder="Only you need this to manage the league" onChange={e => set('password', e.target.value)} />
        <Input label="CONFIRM PASSWORD" type="password" value={form.confirmPassword} placeholder="Re-enter password" onChange={e => set('confirmPassword', e.target.value)} />

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:20 }}>
          {[
            { label:'BUDGET ($)', key:'budget', min:50, max:500 },
            { label:'MIN PICKS', key:'picks_min', min:1, max:10 },
            { label:'MAX PICKS', key:'picks_max', min:1, max:10 },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#475569', letterSpacing:1, marginBottom:6 }}>{f.label}</label>
              <input
                type="number" min={f.min} max={f.max} value={form[f.key]}
                onChange={e => set(f.key, parseInt(e.target.value) || f.min)}
                style={{ width:'100%', background:'#0c1421', border:'1px solid #1e2d3d', borderRadius:10, padding:'11px 14px', color:'#f1f5f9', fontSize:15, outline:'none', boxSizing:'border-box' }}
              />
            </div>
          ))}
        </div>

        <Card style={{ marginBottom:24, display:'flex', justifyContent:'space-between', alignItems:'center', gap:16 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:'#e2e8f0', marginBottom:3 }}>Public leaderboard</div>
            <div style={{ fontSize:12, color:'#475569' }}>Anyone with the link can view standings</div>
          </div>
          <Toggle value={form.is_public} onChange={v => set('is_public', v)} />
        </Card>

        {error && <p style={{ color:'#f87171', fontSize:13, marginBottom:16 }}>{error}</p>}

        <Btn onClick={create} disabled={loading} size='lg' style={{ width:'100%', borderRadius:12 }}>
          {loading ? 'Creating…' : '🚀 Launch League'}
        </Btn>
      </div>
    </div>
  )
}

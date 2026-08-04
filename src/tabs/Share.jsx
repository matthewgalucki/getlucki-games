import { useState } from 'react'
import { QRCode, Card, Btn } from '../components.jsx'

export default function ShareTab({ league }) {
  const joinUrl = `${window.location.origin}?join=${league.join_code}`
  const [copied, setCopied] = useState('')

  function copy(text, label) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label)
      setTimeout(() => setCopied(''), 2200)
    })
  }

  return (
    <div>
      <h2 style={{ color:'#f1f5f9', fontSize:22, fontWeight:900, marginBottom:6 }}>📣 Share Your League</h2>
      <p style={{ color:'#475569', fontSize:13, marginBottom:28, lineHeight:1.6 }}>
        Send players the join code or link. For bars — print the QR code and stick it on the table or the TV!
      </p>

      {/* Big join code */}
      <div style={{
        background:'linear-gradient(135deg,#0d2818,#0c1421)', border:'1px solid #16a34a',
        borderRadius:18, padding:'32px 24px', textAlign:'center', marginBottom:16,
      }}>
        <div style={{ fontSize:11, color:'#4ade80', fontWeight:700, letterSpacing:3, marginBottom:14 }}>JOIN CODE</div>
        <div style={{ fontFamily:'monospace', fontWeight:900, fontSize:'clamp(42px,10vw,64px)', color:'#f1f5f9', letterSpacing:12, marginBottom:20 }}>
          {league.join_code}
        </div>
        <Btn onClick={() => copy(league.join_code, 'code')} size='lg' style={{ borderRadius:99 }}>
          {copied==='code' ? '✓ Copied!' : 'Copy Code'}
        </Btn>
      </div>

      {/* QR code */}
      <Card style={{ textAlign:'center', marginBottom:16 }}>
        <div style={{ fontSize:11, color:'#475569', fontWeight:700, letterSpacing:2, marginBottom:16 }}>QR CODE — SCAN TO JOIN</div>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:14 }}>
          <QRCode url={joinUrl} size={200} />
        </div>
        <p style={{ color:'#334155', fontSize:12 }}>
          Print this for bars, restaurants, or your group chat
        </p>
      </Card>

      {/* Direct link */}
      <Card style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap', marginBottom:16 }}>
        <div>
          <div style={{ fontSize:11, color:'#334155', fontWeight:700, letterSpacing:1, marginBottom:5 }}>DIRECT LINK</div>
          <div style={{ fontFamily:'monospace', fontSize:13, color:'#4ade80', wordBreak:'break-all' }}>{joinUrl}</div>
        </div>
        <Btn variant='secondary' size='sm' onClick={() => copy(joinUrl, 'link')}>
          {copied==='link' ? '✓ Copied!' : 'Copy Link'}
        </Btn>
      </Card>

      {/* League info */}
      <Card>
        <div style={{ fontSize:11, color:'#334155', fontWeight:700, letterSpacing:1, marginBottom:12 }}>LEAGUE INFO</div>
        {[
          ['League',      league.name],
          ['Organizer',   league.organizer_name],
          ['Budget',      `$${league.budget}`],
          ['Picks',       `${league.picks_min}–${league.picks_max} teams`],
          ['Leaderboard', league.is_public ? '🟢 Public' : '🔴 Private'],
        ].map(([label, val]) => (
          <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid #111827' }}>
            <span style={{ fontSize:13, color:'#475569' }}>{label}</span>
            <span style={{ fontSize:13, color:'#94a3b8', fontWeight:600 }}>{val}</span>
          </div>
        ))}
      </Card>
    </div>
  )
}

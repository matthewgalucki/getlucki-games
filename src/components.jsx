import { useEffect } from 'react'
import { priceColor } from './data.js'

export function Toast({ msg, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [])
  return (
    <div style={{
      position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)',
      background:'#16a34a', color:'#fff', padding:'10px 24px', borderRadius:99,
      fontWeight:700, fontSize:14, zIndex:9999,
      boxShadow:'0 4px 24px rgba(0,0,0,0.5)',
      animation:'fadeUp 0.25s ease',
    }}>{msg}</div>
  )
}

export function Medal({ rank }) {
  if (rank === 1) return <span style={{ fontSize:18 }}>🥇</span>
  if (rank === 2) return <span style={{ fontSize:18 }}>🥈</span>
  if (rank === 3) return <span style={{ fontSize:18 }}>🥉</span>
  return <span style={{ color:'#475569', fontWeight:700, fontSize:13, width:20, textAlign:'center', display:'inline-block' }}>{rank}</span>
}

export function TeamChip({ abbr, wins }) {
  const w = wins?.[abbr] ?? 0
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:4,
      background:'#0c1421', border:'1px solid #1a2332',
      borderRadius:5, padding:'2px 8px', fontSize:11,
      fontFamily:'monospace', fontWeight:700, color:'#94a3b8',
    }}>
      {abbr}
      <span style={{
        background: w > 0 ? '#15803d' : '#1e293b',
        color: w > 0 ? '#86efac' : '#475569',
        borderRadius:3, padding:'0 4px', fontSize:10,
      }}>{w}W</span>
    </span>
  )
}

export function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        background: value ? '#16a34a' : '#1e293b',
        border:'none', borderRadius:99, width:44, height:24,
        cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0,
      }}
    >
      <span style={{
        position:'absolute', top:3,
        left: value ? 22 : 3,
        width:18, height:18, background:'#fff',
        borderRadius:'50%', transition:'left 0.2s', display:'block',
      }} />
    </button>
  )
}

export function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#475569', letterSpacing:1, marginBottom:6 }}>{label}</label>}
      <input
        {...props}
        style={{
          width:'100%', background:'#0c1421', border:'1px solid #1e2d3d',
          borderRadius:10, padding:'11px 14px', color:'#f1f5f9', fontSize:14,
          outline:'none', boxSizing:'border-box', fontFamily:'inherit',
          ...props.style,
        }}
      />
    </div>
  )
}

export function Btn({ children, variant='primary', size='md', disabled, ...props }) {
  const bg = variant==='primary' ? (disabled?'#1e293b':'#16a34a')
           : variant==='danger'  ? '#450a0a'
           : '#0c1421'
  const color = variant==='primary' ? (disabled?'#334155':'#fff')
              : variant==='danger'  ? '#fca5a5'
              : '#94a3b8'
  const pad = size==='sm' ? '6px 14px' : size==='lg' ? '14px 28px' : '9px 20px'
  return (
    <button
      disabled={disabled}
      {...props}
      style={{
        background:bg, color, border:variant==='secondary'?'1px solid #334155':'none',
        borderRadius:99, padding:pad, fontWeight:700,
        cursor:disabled?'not-allowed':'pointer', fontSize:size==='sm'?12:14,
        transition:'background 0.15s', fontFamily:'inherit',
        ...props.style,
      }}
    >{children}</button>
  )
}

export function Card({ children, highlight, style={} }) {
  return (
    <div style={{
      background: highlight ? 'linear-gradient(135deg,#0d2818,#0c1421)' : '#0a0f18',
      border: `1px solid ${highlight ? '#16a34a' : '#111827'}`,
      borderRadius:12, padding:20,
      ...style,
    }}>{children}</div>
  )
}

export function QRCode({ url, size=200 }) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=060d16&color=4ade80&format=png&margin=10`
  return (
    <img
      src={src}
      alt="QR Code"
      style={{ width:size, height:size, borderRadius:12, border:'2px solid #16a34a', display:'block' }}
    />
  )
}

export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #060d16; color: #e2e8f0; font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
  input[type=number]::-webkit-inner-spin-button { opacity: 1; }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0a0f18; } ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
  @keyframes fadeUp { from { opacity:0; transform:translate(-50%,8px); } to { opacity:1; transform:translate(-50%,0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
`

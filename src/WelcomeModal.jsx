import { useState, useEffect } from 'react'

// Shows a one-time welcome/instructions popup, remembered per browser.
// storageKey keeps home vs league popups independent.
export default function WelcomeModal({ storageKey, title, steps, footer }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(storageKey)) setOpen(true)
    } catch { setOpen(true) }
  }, [storageKey])

  function dismiss() {
    try { localStorage.setItem(storageKey, '1') } catch {}
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      onClick={dismiss}
      style={{
        position:'fixed', inset:0, background:'rgba(3,8,15,0.8)',
        display:'flex', alignItems:'center', justifyContent:'center',
        zIndex:10000, padding:20, backdropFilter:'blur(3px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:'linear-gradient(135deg,#0d2818,#0a0f18)',
          border:'1px solid #16a34a', borderRadius:18,
          maxWidth:440, width:'100%', padding:28,
          boxShadow:'0 20px 60px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ fontSize:40, marginBottom:14, textAlign:'center' }}>🏈</div>
        <h2 style={{ color:'#f1f5f9', fontSize:22, fontWeight:900, textAlign:'center', marginBottom:20 }}>{title}</h2>

        <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:24 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
              <div style={{
                flexShrink:0, width:26, height:26, borderRadius:'50%',
                background:'#16a34a', color:'#fff', fontWeight:900, fontSize:13,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>{i + 1}</div>
              <div style={{ color:'#cbd5e1', fontSize:14, lineHeight:1.5, paddingTop:2 }}>{step}</div>
            </div>
          ))}
        </div>

        {footer && <p style={{ color:'#64748b', fontSize:12, textAlign:'center', marginBottom:20, lineHeight:1.5 }}>{footer}</p>}

        <button
          onClick={dismiss}
          style={{
            width:'100%', background:'#16a34a', color:'#fff', border:'none',
            borderRadius:12, padding:'13px', fontSize:15, fontWeight:800,
            cursor:'pointer', fontFamily:'inherit',
          }}
        >
          Got it — let's play!
        </button>
      </div>
    </div>
  )
}
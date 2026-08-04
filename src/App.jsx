import { useState, useEffect } from 'react'
import { globalStyles } from './components.jsx'
import Home        from './screens/Home.jsx'
import Create      from './screens/Create.jsx'
import League      from './screens/League.jsx'
import MasterAdmin from './screens/MasterAdmin.jsx'

export default function App() {
  const [screen, setScreen]       = useState('home')
  const [leagueId, setLeagueId]   = useState(null)
  const [leagueMeta, setLeagueMeta] = useState({})

  // Handle ?join=CODE and ?admin=rankings deep links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const joinCode = params.get('join')
    const admin = params.get('admin')
    if (admin === 'rankings') {
      setScreen('master')
    } else if (joinCode) {
      setScreen('join')
      setLeagueId(joinCode.toUpperCase())
    }
  }, [])

  // If deep-linked with a join code, auto-resolve it
  useEffect(() => {
    if (screen === 'join' && leagueId) {
      resolveJoinCode(leagueId)
    }
  }, [screen, leagueId])

  async function resolveJoinCode(code) {
    const { supabase } = await import('./supabase.js')
    const { data } = await supabase.from('leagues').select('id').eq('join_code', code).limit(1)
    if (data?.[0]) {
      navigate('league', data[0].id)
    } else {
      navigate('home')
    }
  }

  function navigate(s, id = null, meta = {}) {
    setScreen(s)
    if (id)   setLeagueId(id)
    if (meta) setLeagueMeta(meta)
    // Clean up URL
    if (s !== 'join') window.history.replaceState({}, '', window.location.pathname)
  }

  return (
    <>
      <style>{globalStyles}</style>
      {screen === 'home'   && <Home   onNavigate={navigate} />}
      {screen === 'join'   && (
        <div style={{ minHeight:'100vh', background:'#060d16', display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8', fontSize:14 }}>
          Joining league…
        </div>
      )}
      {screen === 'create' && <Create onNavigate={navigate} />}
      {screen === 'master' && <MasterAdmin onNavigate={navigate} />}
      {screen === 'league' && <League leagueId={leagueId} initMeta={leagueMeta} onNavigate={navigate} />}
    </>
  )
}

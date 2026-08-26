import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase.js'
import { TEAMS, VIETRI_ENTRIES, calcScore, calcSpent, priceColor, pctTaken, fetchNFLWins, fetchLastResults, leaguePrices, teamsWithPrices } from '../data.js'
import { Toast, Medal, QRCode, Btn, Card, Input } from '../components.jsx'
import Leaderboard from '../tabs/Leaderboard.jsx'
import TeamsTab    from '../tabs/Teams.jsx'
import DraftTab    from '../tabs/Draft.jsx'
import ShareTab    from '../tabs/Share.jsx'
import AdminTab    from '../tabs/Admin.jsx'
import WelcomeModal from '../WelcomeModal.jsx'

const DEMO_ID = 'vietri-pick-6-demo'

export default function League({ leagueId, initMeta = {}, onNavigate }) {
  const [league, setLeague]       = useState(null)
  const [entries, setEntries]     = useState([])
  const [wins, setWins]           = useState({})
  const [played, setPlayed]       = useState({})
  const [lastResults, setLastResults] = useState({})
  const [tab, setTab]             = useState('Leaderboard')
  const [isOrganizer, setIsOrg]   = useState(initMeta.isOrganizer || false)
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [toast, setToast]         = useState('')
  const [lastSynced, setLastSynced] = useState(null)
  const [orgPw, setOrgPw]         = useState('')
  const [orgPwErr, setOrgPwErr]   = useState('')

  useEffect(() => { load() }, [leagueId])

  async function load() {
    setLoading(true)

    // Seed demo league if needed
    if (leagueId === DEMO_ID) await seedDemoIfNeeded()

    const [{ data: leagueData }, { data: entryData }, { data: winData }] = await Promise.all([
      supabase.from('leagues').select('*').eq('id', leagueId).limit(1),
      supabase.from('entries').select('*').eq('league_id', leagueId).order('submitted_at'),
      supabase.from('team_wins').select('*'),
    ])

    if (leagueData?.[0]) setLeague(leagueData[0])
    if (entryData) setEntries(entryData.map(e => ({ ...e, picks: Array.isArray(e.picks) ? e.picks : JSON.parse(e.picks) })))
    if (winData) {
      const w = {}
      const p = {}
      const r = {}
      winData.forEach(row => { w[row.abbr] = row.wins; p[row.abbr] = row.games_played || 0; if (row.last_result) r[row.abbr] = row.last_result })
      setWins(w)
      setPlayed(p)
      setLastResults(r)
    }
    setLoading(false)
  }

  async function seedDemoIfNeeded() {
    const { data } = await supabase.from('leagues').select('id').eq('id', DEMO_ID).limit(1)
    if (data?.length) return // already seeded

    await supabase.from('leagues').insert({
      id: DEMO_ID, name:'Vietri Pick 6 — Demo', join_code:'VIETRI',
      organizer_name:'Ben Vietri', organizer_password:'vietri2025',
      is_public:true, budget:120, picks_min:6, picks_max:7, season:2026,
    })
    for (let i = 0; i < VIETRI_ENTRIES.length; i += 10) {
      await supabase.from('entries').upsert(
        VIETRI_ENTRIES.slice(i, i + 10).map(e => ({ league_id:DEMO_ID, player_name:e.player_name, picks:e.picks })),
        { onConflict:'league_id,player_name', ignoreDuplicates:true }
      )
    }
  }

  const refreshWins = useCallback(async () => {
    setRefreshing(true)
    const [live, results] = await Promise.all([fetchNFLWins(), fetchLastResults()])
    if (live) {
      const { wins: liveWins, played: livePlayed } = live
      const rows = Object.keys(liveWins).map(abbr => ({
        abbr,
        wins: liveWins[abbr],
        games_played: livePlayed[abbr] || 0,
        last_result: results?.[abbr] || null,
        last_synced: new Date().toISOString(),
      }))
      const { error } = await supabase.from('team_wins').upsert(rows, { onConflict:'abbr' })
      if (!error) {
        setWins(liveWins)
        setPlayed(livePlayed)
        if (results) setLastResults(results)
        setLastSynced(new Date().toLocaleString())
        setToast('Wins synced from ESPN ✓')
      } else {
        setToast('Sync error — check console')
      }
    } else {
      setToast('ESPN unavailable — season may not have started yet')
    }
    setRefreshing(false)
  }, [])

  async function submitEntry(playerInfo, picks) {
    const { data, error } = await supabase
      .from('entries')
      .insert({
        league_id: leagueId,
        player_name: playerInfo.player_name,
        email: playerInfo.email,
        real_name: playerInfo.real_name,
        cell: playerInfo.cell,
        picks,
      })
      .select()
    if (error) return error.message
    setEntries(prev => [...prev, { ...data[0], picks }])
    return null
  }

  async function deleteEntry(id) {
    const { error } = await supabase.from('entries').delete().eq('id', id)
    if (!error) { setEntries(prev => prev.filter(e => e.id !== id)); setToast('Entry removed') }
    else setToast('Delete failed')
  }

  async function togglePaid(id, paid) {
    const { error } = await supabase.from('entries').update({ paid }).eq('id', id)
    if (!error) setEntries(prev => prev.map(e => e.id === id ? { ...e, paid } : e))
    else setToast('Update failed')
  }

  async function manualWinUpdate(updates) {
    const rows = Object.entries(updates).map(([abbr, w]) => ({ abbr, wins:w, last_synced:new Date().toISOString() }))
    const { error } = await supabase.from('team_wins').upsert(rows, { onConflict:'abbr' })
    if (!error) {
      setWins(prev => ({ ...prev, ...updates }))
      setLastSynced(new Date().toLocaleString() + ' (manual)')
      setToast('Wins updated ✓')
    } else setToast('Update failed')
  }

  function tryOrgAuth() {
    if (orgPw === league?.organizer_password) { setIsOrg(true); setOrgPwErr('') }
    else setOrgPwErr('Wrong password.')
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#060d16', display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8', fontSize:14 }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:40, marginBottom:12, animation:'spin 1s linear infinite', display:'inline-block' }}>⟳</div>
        <div>Loading league…</div>
      </div>
    </div>
  )

  if (!league) return (
    <div style={{ minHeight:'100vh', background:'#060d16', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <div style={{ fontSize:48 }}>🏈</div>
      <p style={{ color:'#f1f5f9' }}>League not found.</p>
      <Btn onClick={() => onNavigate('home')}>Back to Home</Btn>
    </div>
  )

  const prices = leaguePrices(league)
  const TABS = ['Leaderboard','Teams','Pick Teams','Share','Admin']

  return (
    <div style={{ minHeight:'100vh', background:'#060d16' }}>
      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
              <WelcomeModal
        storageKey="getlucki-welcome-league"
        title="How to Play BankRoll"
        steps={[
          "Go to the Pick Teams tab and choose 6–7 NFL teams.",
          "You have a $120 budget. Stronger teams cost more — balance stars with sleepers.",
          "Enter your name and email so the organizer can reach you if you win.",
          "Your teams are locked once they play. Then just watch the Leaderboard all season!",
        ]}
        footer="No weekly picks needed — set your roster once and let it ride."
      />

      {/* LEAGUE NAV */}
      <nav style={{ background:'linear-gradient(135deg,#031a0a,#060d16)', borderBottom:'1px solid #0d1f0f', padding:'16px 24px 0' }}>
        <div style={{ maxWidth:960, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14, flexWrap:'wrap', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <button onClick={() => onNavigate('home')} style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer', fontSize:20, padding:0, lineHeight:1 }}>←</button>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                  <span style={{ fontSize:13 }}>💰</span>
                  <span style={{ fontSize:10, color:'#4ade80', fontWeight:700, letterSpacing:1.5 }}>BANKROLL</span>
                </div>
                <div style={{ fontWeight:900, fontSize:20, color:'#f1f5f9', letterSpacing:'-0.3px' }}>{league.name}</div>
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:10, color:'#64748b', fontWeight:700, letterSpacing:1 }}>JOIN CODE</div>
              <div style={{ fontFamily:'monospace', fontWeight:900, fontSize:22, color:'#4ade80', letterSpacing:4 }}>{league.join_code}</div>
            </div>
          </div>

          <div style={{ display:'flex', overflowX:'auto', gap:0, paddingBottom:0 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background:tab===t?'#060d16':'transparent',
                border:'none', borderBottom:tab===t?'2px solid #16a34a':'2px solid transparent',
                color:tab===t?'#f1f5f9':'#94a3b8',
                padding:'9px 18px', cursor:'pointer', fontWeight:700, fontSize:13,
                borderRadius:'6px 6px 0 0', whiteSpace:'nowrap', transition:'color 0.1s',
              }}>
                {t}
                {t==='Leaderboard' && (
                  <span style={{ marginLeft:5, background:'#0d2818', color:'#4ade80', borderRadius:99, padding:'0 7px', fontSize:10 }}>{entries.length}</span>
                )}
                {t==='Admin' && !isOrganizer && (
                  <span style={{ marginLeft:4, fontSize:10 }}>🔒</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <div style={{ maxWidth:960, margin:'0 auto', padding:'28px 20px 80px' }}>
        {tab==='Leaderboard' && <Leaderboard entries={entries} wins={wins} prices={prices} lastResults={lastResults} lastSynced={lastSynced} onRefresh={refreshWins} refreshing={refreshing} />}
        {tab==='Teams'       && <TeamsTab wins={wins} entries={entries} prices={prices} />}
        {tab==='Pick Teams' && <DraftTab league={league} entries={entries} prices={prices} played={played} onSubmit={submitEntry} onToast={setToast} />}
        {tab==='Share'       && <ShareTab league={league} />}
        {tab==='Admin'       && (
          isOrganizer
            ? <AdminTab entries={entries} wins={wins} prices={prices} league={league} onDelete={deleteEntry} onTogglePaid={togglePaid} onWinUpdate={manualWinUpdate} onRefresh={refreshWins} refreshing={refreshing} onToast={setToast} />
            : (
              <div style={{ maxWidth:360, margin:'60px auto', textAlign:'center' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>🔐</div>
                <h2 style={{ color:'#f1f5f9', marginBottom:8, fontWeight:900 }}>Organizer Access</h2>
                <p style={{ color:'#94a3b8', fontSize:13, marginBottom:24 }}>Enter your organizer password to manage this league.</p>
                <input type="password" value={orgPw} onChange={e => setOrgPw(e.target.value)}
                  placeholder="Password" onKeyDown={e => e.key==='Enter' && tryOrgAuth()}
                  style={{ width:'100%', background:'#0c1421', border:'1px solid #1a2332', borderRadius:10, padding:'11px 14px', color:'#f1f5f9', fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:10, fontFamily:'inherit' }}
                />
                {orgPwErr && <p style={{ color:'#f87171', fontSize:13, marginBottom:10 }}>{orgPwErr}</p>}
                <Btn onClick={tryOrgAuth} style={{ width:'100%', borderRadius:10 }}>Unlock</Btn>
              </div>
            )
        )}
      </div>
    </div>
  )
}

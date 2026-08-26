// The current NFL season year. Update this once each year.
export const SEASON = 2026

export const TEAMS = [
  { abbr:'LAR', name:'Los Angeles Rams',       price:32, conf:'NFC' },
  { abbr:'SEA', name:'Seattle Seahawks',       price:31, conf:'NFC' },
  { abbr:'BAL', name:'Baltimore Ravens',       price:30, conf:'AFC' },
  { abbr:'BUF', name:'Buffalo Bills',          price:29, conf:'AFC' },
  { abbr:'PHI', name:'Philadelphia Eagles',    price:28, conf:'NFC' },
  { abbr:'DEN', name:'Denver Broncos',         price:27, conf:'AFC' },
  { abbr:'NE',  name:'New England Patriots',   price:26, conf:'AFC' },
  { abbr:'KC',  name:'Kansas City Chiefs',     price:25, conf:'AFC' },
  { abbr:'DET', name:'Detroit Lions',          price:24, conf:'NFC' },
  { abbr:'GB',  name:'Green Bay Packers',      price:23, conf:'NFC' },
  { abbr:'SF',  name:'San Francisco 49ers',    price:22, conf:'NFC' },
  { abbr:'JAX', name:'Jacksonville Jaguars',   price:21, conf:'AFC' },
  { abbr:'HOU', name:'Houston Texans',         price:20, conf:'AFC' },
  { abbr:'LAC', name:'Los Angeles Chargers',   price:19, conf:'AFC' },
  { abbr:'CHI', name:'Chicago Bears',          price:18, conf:'NFC' },
  { abbr:'CIN', name:'Cincinnati Bengals',     price:17, conf:'AFC' },
  { abbr:'DAL', name:'Dallas Cowboys',         price:16, conf:'NFC' },
  { abbr:'MIN', name:'Minnesota Vikings',      price:15, conf:'NFC' },
  { abbr:'TB',  name:'Tampa Bay Buccaneers',   price:14, conf:'NFC' },
  { abbr:'IND', name:'Indianapolis Colts',     price:13, conf:'AFC' },
  { abbr:'PIT', name:'Pittsburgh Steelers',    price:12, conf:'AFC' },
  { abbr:'CAR', name:'Carolina Panthers',      price:11, conf:'NFC' },
  { abbr:'NO',  name:'New Orleans Saints',     price:10, conf:'NFC' },
  { abbr:'WAS', name:'Washington Commanders',  price:9,  conf:'NFC' },
  { abbr:'NYG', name:'New York Giants',        price:8,  conf:'NFC' },
  { abbr:'ATL', name:'Atlanta Falcons',        price:7,  conf:'NFC' },
  { abbr:'TEN', name:'Tennessee Titans',       price:6,  conf:'AFC' },
  { abbr:'NYJ', name:'New York Jets',          price:5,  conf:'AFC' },
  { abbr:'LV',  name:'Las Vegas Raiders',      price:4,  conf:'AFC' },
  { abbr:'CLE', name:'Cleveland Browns',       price:3,  conf:'AFC' },
  { abbr:'MIA', name:'Miami Dolphins',         price:2,  conf:'AFC' },
  { abbr:'ARI', name:'Arizona Cardinals',      price:1,  conf:'NFC' },
]

export const VIETRI_ENTRIES = [
  { player_name:'Andrew Markey',        picks:['BAL','DET','SF','DAL','ARI','NE','JAX'] },
  { player_name:'Andy Vargas',          picks:['KC','DET','TB','SEA','ATL','IND','NYG'] },
  { player_name:'Anthony DiNardo',      picks:['DET','HOU','LAC','SF','PIT','ATL','CLE'] },
  { player_name:'Anthony Monico',       picks:['BUF','GB','LAC','SF','NE','JAX','CAR'] },
  { player_name:'Anthony Trani',        picks:['PHI','WAS','CIN','PIT','JAX','LV','CLE'] },
  { player_name:'Ben Vietri',           picks:['BUF','DEN','TB','SF','CHI','ARI','CAR'] },
  { player_name:'Bill Ritsch',          picks:['KC','GB','HOU','PIT','CHI','NYJ','NYG'] },
  { player_name:'Billy Courtney',       picks:['PHI','BUF','WAS','MIA','NE','IND','TEN'] },
  { player_name:'Blake Eaton',          picks:['KC','BUF','TB','MIA','ARI','JAX','CAR'] },
  { player_name:'Blake Sullivan',       picks:['KC','GB','HOU','TB','SF','NYG'] },
  { player_name:"Brendan O'Donnoghue", picks:['BUF','DEN','LAC','SF','DAL','CHI','NYG'] },
  { player_name:'Brooks Villar',        picks:['BUF','WAS','SF','PIT','ATL','JAX','NYG'] },
  { player_name:'Chris Zowine',         picks:['BUF','BAL','TB','SF','NE','JAX','NYG'] },
  { player_name:'Chris Hartnett',       picks:['BUF','BAL','TB','SF','ARI','NE','TEN'] },
  { player_name:'Corey Alison',         picks:['BUF','BAL','DEN','SF','ATL','CAR','TEN'] },
  { player_name:'Craig Pittman',        picks:['BUF','TB','SF','DAL','ATL','CHI','ARI'] },
  { player_name:'Craig Nettles',        picks:['PHI','GB','CIN','ATL','NE','LV','NYG'] },
  { player_name:'Dan Wheelin',          picks:['WAS','CIN','DEN','ATL','MIA','ARI','LV'] },
  { player_name:'Doug McDonald',        picks:['BAL','DET','WAS','TB','NE','NYG','NO'] },
  { player_name:'Doug Anania',          picks:['BUF','BAL','HOU','LAC','NE','CAR','NYG'] },
  { player_name:'Eric Neiley',          picks:['PHI','GB','DEN','ATL','CHI','LV','CAR'] },
  { player_name:'Jack Napoli',          picks:['BUF','BAL','HOU','LAC','ARI','IND','CLE'] },
  { player_name:'Jaclyn Osterloh',      picks:['PHI','KC','BUF','SEA','NYJ','NYG','NO'] },
  { player_name:'Jeff Hartnett',        picks:['BAL','GB','LAC','SF','SEA','NE','TEN'] },
  { player_name:'Joel Keller',          picks:['PHI','BUF','DEN','TB','IND','CAR','NO'] },
  { player_name:'Jordan Lalor',         picks:['BAL','CIN','HOU','SF','DAL','JAX','CLE'] },
  { player_name:'Juan Cueto',           picks:['PHI','BUF','BAL','MIA','JAX','CAR','TEN'] },
  { player_name:'Justyn Alioto',        picks:['GB','DEN','TB','LAC','SF','ARI','NYG'] },
  { player_name:'Kenny Hosp',           picks:['BUF','CIN','HOU','TB','SEA','TEN'] },
  { player_name:'Kevin Hathway',        picks:['BUF','BAL','TB','PIT','ARI','JAX','NYG'] },
  { player_name:'Kyle Zurak',           picks:['BUF','CIN','TB','LAC','NE','JAX','CAR'] },
  { player_name:'Luke Beatty',          picks:['BUF','BAL','LAC','SF','ARI','JAX','TEN'] },
  { player_name:'Matthew Galucki',      picks:['BUF','GB','DEN','TB','ARI','NE','TEN'] },
  { player_name:'Michael McGuire',      picks:['BUF','DET','TB','SF','CHI','LV','NYG'] },
  { player_name:'Michael Zowine',       picks:['BUF','CIN','DEN','SF','HOU','NYG','TEN'] },
  { player_name:'Mike Bernard',         picks:['DET','GB','MIN','SF','NE','LV','IND'] },
  { player_name:'Rando Maq',            picks:['PHI','BUF','LAC','CHI','NE','JAX','IND'] },
  { player_name:'RJ Zurak',             picks:['BUF','BAL','HOU','SF','CHI','JAX','TEN'] },
  { player_name:'Ryno Nurseman',        picks:['BUF','BAL','SEA','ATL','ARI','NE','JAX'] },
  { player_name:'Steve Nutty',          picks:['BUF','HOU','TB','LAC','SF','JAX','CLE'] },
  { player_name:'Tim McNamara',         picks:['BUF','DET','CIN','ATL','CHI','IND','CLE'] },
  { player_name:'Wade Weldon',          picks:['PHI','WAS','CIN','MIN','ATL'] },
  { player_name:'Weston Galucki',       picks:['BUF','GB','ARI','ATL','SF','MIA','IND'] },
  { player_name:'William Galucki',      picks:['BUF','GB','DEN','SF','ATL','JAX','TEN'] },
  { player_name:'Zach Carey',           picks:['WAS','MIN','DEN','DAL','CHI','ARI','NE'] },
  { player_name:'Zach Vietri',          picks:['BUF','BAL','TB','SF','NE','JAX','NYG'] },
  { player_name:'Andrew Galucki',       picks:['BAL','DEN','HOU','TB','PIT','JAX','NO'] },
  { player_name:'Ben Bailey',           picks:['BUF','DET','HOU','LAC','JAX','LV','NYG'] },
  { player_name:'Michael Zowine (2)',   picks:['PHI','BUF','BAL','SF','CAR','NYG','TEN'] },
]

// Convert a ranking order (array of abbrs, best first) into a price map.
// Rank 1 (index 0) = $32, rank 32 (index 31) = $1.
export function ranksToPrice(orderedAbbrs) {
  const n = orderedAbbrs.length
  const prices = {}
  orderedAbbrs.forEach((abbr, i) => { prices[abbr] = n - i })
  return prices
}

// The hardcoded fallback price map (used if a league has no snapshot).
export const DEFAULT_PRICES = TEAMS.reduce((acc, t) => { acc[t.abbr] = t.price; return acc }, {})

// Hardcoded fallback ranking order (best first), derived from TEAMS prices.
export const DEFAULT_ORDER = [...TEAMS].sort((a, b) => b.price - a.price).map(t => t.abbr)

// Resolve the active price map for a league: its frozen snapshot, or the default.
export function leaguePrices(league) {
  if (league?.team_prices && Object.keys(league.team_prices).length === 32) {
    return league.team_prices
  }
  return DEFAULT_PRICES
}

// Build a teams array (with names/conf) using a given price map, sorted high→low.
export function teamsWithPrices(priceMap) {
  return TEAMS
    .map(t => ({ ...t, price: priceMap[t.abbr] ?? t.price }))
    .sort((a, b) => b.price - a.price)
}

export function calcScore(picks, wins) {
  return picks.reduce((s, a) => s + (wins[a] || 0), 0)
}

// calcSpent now takes an optional price map; falls back to hardcoded TEAMS prices.
export function calcSpent(picks, priceMap = null) {
  return picks.reduce((s, a) => {
    if (priceMap) return s + (priceMap[a] || 0)
    const t = TEAMS.find(x => x.abbr === a)
    return s + (t ? t.price : 0)
  }, 0)
}

export function priceColor(p) {
  if (p >= 27) return '#f87171'
  if (p >= 21) return '#fb923c'
  if (p >= 15) return '#fbbf24'
  if (p >= 9)  return '#a3e635'
  return '#60a5fa'
}

export function pctTaken(abbr, entries) {
  if (!entries.length) return 0
  return Math.round(entries.filter(e => e.picks.includes(abbr)).length / entries.length * 100)
}

export function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function randCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export async function fetchNFLWins() {
  try {
    const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/standings?season=${SEASON}`)
    if (!res.ok) throw new Error()
    const data = await res.json()
    const wins = {}
    const played = {}
    ;(data.children || []).forEach(conf => {
      ;(conf.standings?.entries || []).forEach(entry => {
        const abbr = entry.team?.abbreviation
        const stats = entry.stats || []
        const w = stats.find(s => s.name === 'wins')
        const l = stats.find(s => s.name === 'losses')
        const t = stats.find(s => s.name === 'ties')
        if (abbr) {
          if (w) wins[abbr] = parseInt(w.value, 10) || 0
          const gp = (parseInt(w?.value,10)||0) + (parseInt(l?.value,10)||0) + (parseInt(t?.value,10)||0)
          played[abbr] = gp
        }
      })
    })
    return Object.keys(wins).length > 0 ? { wins, played } : null
  } catch {
    return null
  }
}

// Fetch each team's most-recent completed game result.
// Returns { KC: 'W', BUF: 'L', ... } — the outcome of that team's latest finished game.
// Used for the "perfect week" shoutout on the leaderboard.
export async function fetchLastResults() {
  try {
    const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard`)
    if (!res.ok) throw new Error()
    const data = await res.json()
    const results = {}
    ;(data.events || []).forEach(event => {
      const comp = event.competitions?.[0]
      if (!comp || comp.status?.type?.completed !== true) return
      ;(comp.competitors || []).forEach(c => {
        const abbr = c.team?.abbreviation
        if (!abbr) return
        // 'winner' boolean is provided on completed games
        if (c.winner === true) results[abbr] = 'W'
        else if (c.winner === false) results[abbr] = 'L'
      })
    })
    return Object.keys(results).length > 0 ? results : null
  } catch {
    return null
  }
}

const KEY_DIGITSPAN = 'best_digitspan'
const KEY_DIGITSPAN_REV = 'best_digitspan_rev'
const KEY_NBACK = 'best_nback'
const KEY_SIMON = 'best_simon'
const KEY_SPATIAL = 'best_spatial'

const KEY_SETTINGS = 'settings'

const KEY_HISTORY_DIGITSPAN = 'history_digitspan'
const KEY_HISTORY_NBACK = 'history_nback'
const KEY_HISTORY_SIMON = 'history_simon'
const KEY_HISTORY_SPATIAL = 'history_spatial'

const KEY_ACHIEVEMENTS = 'achievements' // [{code, ts}]
const KEY_STREAK = 'streak' // {current, best, lastDate}
const KEY_LAST_REVIEW = 'last_review' // {game, payload}

function get(key, defVal) {
  try {
    const v = wx.getStorageSync(key)
    if (v === '' || v === undefined || v === null) return defVal
    return v
  } catch (e) { return defVal }
}

function set(key, value) {
  try { wx.setStorageSync(key, value) } catch (e) {}
}

function getBestDigitspan() { return get(KEY_DIGITSPAN, 0) }
function setBestDigitspan(v) { set(KEY_DIGITSPAN, v) }

function getBestDigitspanRev() { return get(KEY_DIGITSPAN_REV, 0) }
function setBestDigitspanRev(v) { set(KEY_DIGITSPAN_REV, v) }

function getBestNBack() { return get(KEY_NBACK, 0) }
function setBestNBack(v) { set(KEY_NBACK, v) }

function getBestSimon() { return get(KEY_SIMON, 0) }
function setBestSimon(v) { set(KEY_SIMON, v) }

function getBestSpatial() { return get(KEY_SPATIAL, 0) }
function setBestSpatial(v) { set(KEY_SPATIAL, v) }

const DEFAULT_SETTINGS = {
  digitspan: { showMs: 800, gapMs: 300, startLen: 3 },
  nback: { stepMs: 1500, seqLen: 20, mode: '视觉', audioTokens: 4 },
  simon: { showMs: 700, gapMs: 300, startLen: 1 },
  spatial: { grid: 4, showMs: 800, gapMs: 300, startLen: 3 },
  global: { cloudEnabled: false, cloudEnvId: '' }
}

function getSettings() {
  const s = get(KEY_SETTINGS, null) || {}
  const ds = s.digitspan || {}
  const nb = s.nback || {}
  const sm = s.simon || {}
  const sp = s.spatial || {}
  const gl = s.global || {}
  return {
    digitspan: {
      showMs: Math.max(200, Number(ds.showMs || DEFAULT_SETTINGS.digitspan.showMs)),
      gapMs: Math.max(0, Number(ds.gapMs || DEFAULT_SETTINGS.digitspan.gapMs)),
      startLen: Math.max(3, Number(ds.startLen || DEFAULT_SETTINGS.digitspan.startLen))
    },
    nback: {
      stepMs: Math.max(500, Number(nb.stepMs || DEFAULT_SETTINGS.nback.stepMs)),
      seqLen: Math.max(10, Number(nb.seqLen || DEFAULT_SETTINGS.nback.seqLen)),
      mode: (nb.mode || DEFAULT_SETTINGS.nback.mode),
      audioTokens: Math.min(8, Math.max(2, Number(nb.audioTokens || DEFAULT_SETTINGS.nback.audioTokens)))
    },
    simon: {
      showMs: Math.max(200, Number(sm.showMs || DEFAULT_SETTINGS.simon.showMs)),
      gapMs: Math.max(0, Number(sm.gapMs || DEFAULT_SETTINGS.simon.gapMs)),
      startLen: Math.max(1, Number(sm.startLen || DEFAULT_SETTINGS.simon.startLen))
    },
    spatial: {
      grid: Math.min(6, Math.max(2, Number(sp.grid || DEFAULT_SETTINGS.spatial.grid))),
      showMs: Math.max(200, Number(sp.showMs || DEFAULT_SETTINGS.spatial.showMs)),
      gapMs: Math.max(0, Number(sp.gapMs || DEFAULT_SETTINGS.spatial.gapMs)),
      startLen: Math.max(2, Number(sp.startLen || DEFAULT_SETTINGS.spatial.startLen))
    },
    global: {
      cloudEnabled: !!(gl.cloudEnabled ?? DEFAULT_SETTINGS.global.cloudEnabled),
      cloudEnvId: String(gl.cloudEnvId || DEFAULT_SETTINGS.global.cloudEnvId)
    }
  }
}

function setSettings(s) {
  const cur = getSettings()
  const out = { digitspan: { ...cur.digitspan }, nback: { ...cur.nback }, simon: { ...cur.simon }, spatial: { ...cur.spatial }, global: { ...cur.global } }
  if (s && s.digitspan) {
    if (s.digitspan.showMs != null) out.digitspan.showMs = Math.max(200, Number(s.digitspan.showMs))
    if (s.digitspan.gapMs != null) out.digitspan.gapMs = Math.max(0, Number(s.digitspan.gapMs))
    if (s.digitspan.startLen != null) out.digitspan.startLen = Math.max(3, Number(s.digitspan.startLen))
  }
  if (s && s.nback) {
    if (s.nback.stepMs != null) out.nback.stepMs = Math.max(500, Number(s.nback.stepMs))
    if (s.nback.seqLen != null) out.nback.seqLen = Math.max(10, Number(s.nback.seqLen))
    if (s.nback.mode != null) out.nback.mode = String(s.nback.mode)
    if (s.nback.audioTokens != null) out.nback.audioTokens = Math.min(8, Math.max(2, Number(s.nback.audioTokens)))
  }
  if (s && s.simon) {
    if (s.simon.showMs != null) out.simon.showMs = Math.max(200, Number(s.simon.showMs))
    if (s.simon.gapMs != null) out.simon.gapMs = Math.max(0, Number(s.simon.gapMs))
    if (s.simon.startLen != null) out.simon.startLen = Math.max(1, Number(s.simon.startLen))
  }
  if (s && s.spatial) {
    if (s.spatial.grid != null) out.spatial.grid = Math.min(6, Math.max(2, Number(s.spatial.grid)))
    if (s.spatial.showMs != null) out.spatial.showMs = Math.max(200, Number(s.spatial.showMs))
    if (s.spatial.gapMs != null) out.spatial.gapMs = Math.max(0, Number(s.spatial.gapMs))
    if (s.spatial.startLen != null) out.spatial.startLen = Math.max(2, Number(s.spatial.startLen))
  }
  if (s && s.global) {
    if (s.global.cloudEnabled != null) out.global.cloudEnabled = !!s.global.cloudEnabled
    if (s.global.cloudEnvId != null) out.global.cloudEnvId = String(s.global.cloudEnvId)
  }
  set(KEY_SETTINGS, out)
}

function resetSettingsDefaults(){ set(KEY_SETTINGS, DEFAULT_SETTINGS) }

function pushHistory(key, item, max=5) {
  const arr = Array.isArray(get(key, [])) ? get(key, []) : []
  arr.unshift(item)
  if (arr.length > max) arr.length = max
  set(key, arr)
}

function addDigitspanHistory(item) { pushHistory(KEY_HISTORY_DIGITSPAN, item) }
function getDigitspanHistory() { return Array.isArray(get(KEY_HISTORY_DIGITSPAN, [])) ? get(KEY_HISTORY_DIGITSPAN, []) : [] }

function addNbackHistory(item) { pushHistory(KEY_HISTORY_NBACK, item) }
function getNbackHistory() { return Array.isArray(get(KEY_HISTORY_NBACK, [])) ? get(KEY_HISTORY_NBACK, []) : [] }

function addSimonHistory(item) { pushHistory(KEY_HISTORY_SIMON, item) }
function getSimonHistory() { return Array.isArray(get(KEY_HISTORY_SIMON, [])) ? get(KEY_HISTORY_SIMON, []) : [] }

function addSpatialHistory(item) { pushHistory(KEY_HISTORY_SPATIAL, item) }
function getSpatialHistory() { return Array.isArray(get(KEY_HISTORY_SPATIAL, [])) ? get(KEY_HISTORY_SPATIAL, []) : [] }

function clearScores(){ set(KEY_DIGITSPAN,0); set(KEY_DIGITSPAN_REV,0); set(KEY_NBACK,0); set(KEY_SIMON,0); set(KEY_SPATIAL,0) }
function clearHistories(){ set(KEY_HISTORY_DIGITSPAN,[]); set(KEY_HISTORY_NBACK,[]); set(KEY_HISTORY_SIMON,[]); set(KEY_HISTORY_SPATIAL,[]) }
function clearAll(){ clearScores(); resetSettingsDefaults(); clearHistories(); set(KEY_ACHIEVEMENTS, []); set(KEY_STREAK, null); set(KEY_LAST_REVIEW, null) }

// Achievements
function getAchievements(){ const arr=get(KEY_ACHIEVEMENTS, []); return Array.isArray(arr)?arr:[] }
function hasAchievement(code){ return getAchievements().some(x=>x.code===code) }
function addAchievement(code){ if(!code) return; const arr=getAchievements(); if(arr.some(x=>x.code===code)) return; arr.push({code, ts:Date.now()}); set(KEY_ACHIEVEMENTS, arr) }

// Streak
function formatDate(ts){ const d=ts?new Date(ts):new Date(); const y=d.getFullYear(); const m=('0'+(d.getMonth()+1)).slice(-2); const da=('0'+d.getDate()).slice(-2); return `${y}-${m}-${da}` }
function daysBetween(d1,d2){ const t1=new Date(d1+'T00:00:00Z').getTime(); const t2=new Date(d2+'T00:00:00Z').getTime(); return Math.round((t2-t1)/86400000) }
function getStreak(){ const s=get(KEY_STREAK, null); if(!s) return {current:0,best:0,lastDate:''}; return s }
function updateStreakOnTraining(){ const today=formatDate(); const st=getStreak(); if(st.lastDate===today){ return st } const gap=st.lastDate?daysBetween(st.lastDate,today):null; let current=1; if(gap===1) current=st.current+1; else current=1; const best=Math.max(st.best||0, current); const out={current,best,lastDate:today}; set(KEY_STREAK,out); return out }

// Review
function setLastReview(obj){ set(KEY_LAST_REVIEW, obj) }
function getLastReview(){ return get(KEY_LAST_REVIEW, null) }

module.exports = {
  getBestDigitspan,
  setBestDigitspan,
  getBestDigitspanRev,
  setBestDigitspanRev,
  getBestNBack,
  setBestNBack,
  getBestSimon,
  setBestSimon,
  getBestSpatial,
  setBestSpatial,
  getSettings,
  setSettings,
  resetSettingsDefaults,
  addDigitspanHistory,
  getDigitspanHistory,
  addNbackHistory,
  getNbackHistory,
  addSimonHistory,
  getSimonHistory,
  addSpatialHistory,
  getSpatialHistory,
  clearScores,
  clearHistories,
  clearAll,
  DEFAULT_SETTINGS,
  // Achievements & streak & review
  getAchievements,
  hasAchievement,
  addAchievement,
  getStreak,
  updateStreakOnTraining,
  setLastReview,
  getLastReview
}

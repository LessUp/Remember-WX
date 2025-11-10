const storage = require('../../utils/storage.js')

function pad(n){ return n<10?('0'+n):String(n) }
function fmt(ts){ const d=new Date(ts); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}` }
function dayStr(ts){ const d=new Date(ts); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}` }

const GAME_LABEL_MAP={ digitspan:'数字序列', nback:'N-Back', simon:'Simon', spatial:'空间序列' }

function buildSummary(digitRaw, nbackRaw, simonRaw, spatialRaw){
  const allEntries=[
    ...digitRaw.map(x=>({ ...x, game:'digitspan' })),
    ...nbackRaw.map(x=>({ ...x, game:'nback' })),
    ...simonRaw.map(x=>({ ...x, game:'simon' })),
    ...spatialRaw.map(x=>({ ...x, game:'spatial' }))
  ]

  let lastEntry=null
  const daySet=new Set()
  allEntries.forEach(item=>{
    if(!item || !item.ts) return
    daySet.add(dayStr(item.ts))
    if(!lastEntry || item.ts>lastEntry.ts){ lastEntry=item }
  })

  const summary={
    totalSessions: allEntries.length,
    trainingDays: daySet.size,
    lastTraining: lastEntry ? `${fmt(lastEntry.ts)} · ${GAME_LABEL_MAP[lastEntry.game]||''}` : '',
    streak: storage.getStreak(),
    games: []
  }

  const digitTotal=digitRaw.length
  const digitSuccess=digitRaw.filter(x=>x && x.success).length
  const digitLast=digitRaw[0]
  summary.games.push({
    key:'digitspan',
    label:'数字序列',
    summaryText: digitTotal?`记录 ${digitTotal} 次`:'暂无记录',
    metricText: digitTotal?`成功率 ${Math.round(digitSuccess/digitTotal*100)}%（${digitSuccess}/${digitTotal}）`:'成功率暂无数据',
    highlightText:`最佳 正向 ${storage.getBestDigitspan()} · 反向 ${storage.getBestDigitspanRev()}`,
    extraText:'',
    detailText: digitLast?`${fmt(digitLast.ts)} · ${digitLast.mode} · 长度 ${digitLast.length} · ${digitLast.success?'成功':'失败'}`:'尚未开始训练'
  })

  const nbackTotal=nbackRaw.length
  const nbackLast=nbackRaw[0]
  const sumAcc=nbackRaw.reduce((sum,item)=>sum+(Number(item&&item.acc)||0),0)
  const avgAcc=nbackTotal?Math.round(sumAcc/nbackTotal):0
  const highAccCount=nbackRaw.filter(item=>(Number(item&&item.acc)||0)>=80).length
  summary.games.push({
    key:'nback',
    label:'N-Back',
    summaryText: nbackTotal?`记录 ${nbackTotal} 次`:'暂无记录',
    metricText: nbackTotal?`平均准确率 ${avgAcc}%`:'平均准确率暂无数据',
    highlightText:`最佳准确率 ${storage.getBestNBack()}%`,
    extraText: nbackTotal?`≥80% 次数 ${highAccCount} 次`:'',
    detailText: nbackLast?`${fmt(nbackLast.ts)} · N=${nbackLast.n} · ${nbackLast.mode} · ${nbackLast.acc}%`:'尚未开始训练'
  })

  const simonTotal=simonRaw.length
  const simonSuccess=simonRaw.filter(x=>x && x.success).length
  const simonLast=simonRaw[0]
  summary.games.push({
    key:'simon',
    label:'Simon',
    summaryText: simonTotal?`记录 ${simonTotal} 次`:'暂无记录',
    metricText: simonTotal?`成功率 ${Math.round(simonSuccess/simonTotal*100)}%（${simonSuccess}/${simonTotal}）`:'成功率暂无数据',
    highlightText:`最佳长度 ${storage.getBestSimon()}`,
    extraText:'',
    detailText: simonLast?`${fmt(simonLast.ts)} · 长度 ${simonLast.length} · ${simonLast.success?'成功':'失败'}`:'尚未开始训练'
  })

  const spatialTotal=spatialRaw.length
  const spatialSuccess=spatialRaw.filter(x=>x && x.success).length
  const spatialLast=spatialRaw[0]
  summary.games.push({
    key:'spatial',
    label:'空间序列',
    summaryText: spatialTotal?`记录 ${spatialTotal} 次`:'暂无记录',
    metricText: spatialTotal?`成功率 ${Math.round(spatialSuccess/spatialTotal*100)}%（${spatialSuccess}/${spatialTotal}）`:'成功率暂无数据',
    highlightText:`最佳长度 ${storage.getBestSpatial()}`,
    extraText:'',
    detailText: spatialLast?`${fmt(spatialLast.ts)} · ${spatialLast.grid}×${spatialLast.grid} · 长度 ${spatialLast.length} · ${spatialLast.success?'成功':'失败'}`:'尚未开始训练'
  })

  return summary
}

Page({
  data:{
    digitHistory:[],
    nbackHistory:[],
    simonHistory:[],
    spatialHistory:[],
    summary:{
      totalSessions:0,
      trainingDays:0,
      lastTraining:'',
      streak:{ current:0, best:0, lastDate:'' },
      games:[]
    }
  },
  onShow(){
    const digitRaw=storage.getDigitspanHistory()||[]
    const nbackRaw=storage.getNbackHistory()||[]
    const simonRaw=storage.getSimonHistory()||[]
    const spatialRaw=storage.getSpatialHistory()||[]

    const summary=buildSummary(digitRaw, nbackRaw, simonRaw, spatialRaw)

    const dh=digitRaw.map(x=>({ ts:x.ts, time:fmt(x.ts), mode:x.mode, length:x.length, success:!!x.success }))
    const nh=nbackRaw.map(x=>({ ts:x.ts, time:fmt(x.ts), n:x.n, mode:x.mode, acc:x.acc, correct:x.correct, total:x.total }))
    const sh=simonRaw.map(x=>({ ts:x.ts, time:fmt(x.ts), length:x.length, success:!!x.success }))
    const sph=spatialRaw.map(x=>({ ts:x.ts, time:fmt(x.ts), grid:x.grid, length:x.length, success:!!x.success }))

    this.setData({
      digitHistory:dh,
      nbackHistory:nh,
      simonHistory:sh,
      spatialHistory:sph,
      summary
    })
  }
})

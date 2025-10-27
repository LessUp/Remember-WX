const storage = require('../../utils/storage.js')

function pad(n){ return n<10?('0'+n):String(n) }
function fmt(ts){ const d=new Date(ts); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}` }

Page({
  data:{
    digitBest:0,
    digitBestRev:0,
    nbackBest:0,
    simonBest:0,
    spatialBest:0,
    digitHistory:[],
    nbackHistory:[],
    simonHistory:[],
    spatialHistory:[]
  },
  onShow(){
    const dh = (storage.getDigitspanHistory()||[]).map(x=>({ ts:x.ts, time:fmt(x.ts), mode:x.mode, length:x.length, success:!!x.success }))
    const nh = (storage.getNbackHistory()||[]).map(x=>({ ts:x.ts, time:fmt(x.ts), n:x.n, mode:x.mode, acc:x.acc, correct:x.correct, total:x.total }))
    const sh = (storage.getSimonHistory()||[]).map(x=>({ ts:x.ts, time:fmt(x.ts), length:x.length, success:!!x.success }))
    const sph = (storage.getSpatialHistory()||[]).map(x=>({ ts:x.ts, time:fmt(x.ts), grid:x.grid, length:x.length, success:!!x.success }))
    this.setData({
      digitBest:storage.getBestDigitspan(),
      digitBestRev:storage.getBestDigitspanRev(),
      nbackBest:storage.getBestNBack(),
      simonBest:storage.getBestSimon(),
      spatialBest:storage.getBestSpatial(),
      digitHistory:dh,
      nbackHistory:nh,
      simonHistory:sh,
      spatialHistory:sph
    })
  }
})

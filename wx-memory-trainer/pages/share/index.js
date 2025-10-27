const storage = require('../../utils/storage.js')

const GAME_KEYS = ['digitspan','nback','simon','spatial']
const GAME_LABELS = ['数字序列','N-Back','Simon','空间序列']

function pad(n){ return n<10?('0'+n):String(n) }
function nowStr(){ const d=new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}` }

function bestText(key){
  if(key==='digitspan') return `正向 ${storage.getBestDigitspan()} · 反向 ${storage.getBestDigitspanRev()}`
  if(key==='nback') return `最佳准确率 ${storage.getBestNBack()}%`
  if(key==='simon') return `最佳长度 ${storage.getBestSimon()}`
  if(key==='spatial') return `最佳长度 ${storage.getBestSpatial()}`
  return ''
}

Page({
  data:{
    gameOptions: GAME_LABELS,
    gameIndex: 0,
    gameLabel: GAME_LABELS[0],
    hasImage:false,
    tempPath:''
  },
  onShow(){},
  onGameChange(e){ const i=Number(e.detail.value); this.setData({ gameIndex:i, gameLabel: GAME_LABELS[i] }) },

  draw(){
    const key = GAME_KEYS[this.data.gameIndex]
    const ctx = wx.createCanvasContext('poster', this)
    const W=300, H=480

    // bg gradient
    const grd = ctx.createLinearGradient(0,0,0,H)
    grd.addColorStop(0,'#1d4ed8')
    grd.addColorStop(1,'#9333ea')
    ctx.setFillStyle(grd)
    ctx.fillRect(0,0,W,H)

    // card
    ctx.setFillStyle('#ffffff')
    ctx.setShadow(0,6,14,'rgba(0,0,0,0.18)')
    const r=16
    ctx.beginPath();
    ctx.moveTo(16+r,80)
    ctx.arcTo(W-16,80,W-16,80+r,r)
    ctx.arcTo(W-16,300,W-16-r,300,r)
    ctx.arcTo(16,300,16,300-r,r)
    ctx.arcTo(16,80,16+r,80,r)
    ctx.closePath();
    ctx.fill()
    ctx.setShadow(0,0,0,'transparent')

    // texts
    ctx.setFillStyle('#ffffff')
    ctx.setFontSize(18)
    ctx.fillText('记忆力训练', 16, 36)

    ctx.setFontSize(12)
    ctx.setFillStyle('rgba(255,255,255,0.9)')
    ctx.fillText(nowStr(), 16, 56)

    ctx.setFillStyle('#111827')
    ctx.setFontSize(20)
    ctx.fillText(this.data.gameLabel, 32, 120)

    ctx.setFillStyle('#6b7280')
    ctx.setFontSize(12)
    ctx.fillText('本地最佳', 32, 148)

    ctx.setFillStyle('#111827')
    ctx.setFontSize(28)
    ctx.fillText(bestText(key), 32, 184)

    // footer
    ctx.setFillStyle('#6b7280')
    ctx.setFontSize(12)
    ctx.fillText('微信小程序 · 记忆力训练', 32, 276)

    ctx.draw(false, ()=>{
      wx.canvasToTempFilePath({
        canvasId:'poster',
        width:W,
        height:H,
        destWidth:W*2,
        destHeight:H*2,
        success: (res)=>{ this.setData({ hasImage:true, tempPath:res.tempFilePath }); wx.showToast({title:'已生成',icon:'success'}) },
        fail: ()=>{ wx.showToast({title:'生成失败', icon:'none'}) }
      }, this)
    })
  },

  save(){
    if(!this.data.hasImage) return
    wx.saveImageToPhotosAlbum({
      filePath: this.data.tempPath,
      success: ()=>wx.showToast({title:'已保存',icon:'success'}),
      fail: ()=>wx.showToast({title:'保存失败',icon:'none'})
    })
  },

  onShareAppMessage(){ return { title:'我的训练成绩', path:'/pages/share/index' } }
})

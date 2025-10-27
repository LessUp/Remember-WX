const storage = require('../../utils/storage.js')
Page({
  data: {
    digitBest: 0,
    digitBestRev: 0,
    nbackBest: 0,
    simonBest: 0,
    spatialBest: 0
  },
  onShow() {
    this.setData({
      digitBest: storage.getBestDigitspan(),
      digitBestRev: storage.getBestDigitspanRev(),
      nbackBest: storage.getBestNBack(),
      simonBest: storage.getBestSimon(),
      spatialBest: storage.getBestSpatial()
    })
  },
  onShareAppMessage(){
    return { title:'记忆力训练 - 多题型合集', path:'/pages/index/index' }
  }
})

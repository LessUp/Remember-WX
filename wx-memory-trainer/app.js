const cloud = require('./utils/cloud.js')

App({
  onLaunch() {
    try { cloud.init() } catch(e) {}
  }
})

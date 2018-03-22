// pages/h5Page/h5Page.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerUrl: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var url = options.h5Url;
    this.setData({
      bannerUrl: url
    })
  },


})
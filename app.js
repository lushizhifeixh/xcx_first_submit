// banner接口
var basic_fontAPI = "http://172.16.1.110:8060/v1.0/environment";

App({
  globalData: {
    basicFontAPI: '',
    // 获取当前位置的经纬度
    jd: '',
    wd: '',
    token: '',
    userInfo: null
  },
  onLaunch: function () {
    var that = this;
    // 调用获取当前位置的方法
    that.getCurentLocatin();
    //获取token值
    var _token = wx.getStorageSync('sessionId');
    if (!!_token) {
      that.globalData.token = _token;
    };
    wx.setStorageSync('rebuy', '');
    wx.getUserInfo({
      success: function (res) {
        var userInfo = res.userInfo
        that.globalData.userInfo = userInfo;
      }
    });
    
    wx.request({
      url: basic_fontAPI,
      data: {},
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        that.globalData.basicFontAPI = res.data.data.pictureUrl;
      }
    });
    
  },
  // 获取当前位置的经纬度
  getCurentLocatin: function () {
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        that.globalData.jd = longitude;
        that.globalData.wd = latitude;
      }
    })
  },
  //加载中的方法封装.......
  showLoading: function () {
    wx.showToast({
      title: '加载中...',
      icon: "loading",
      duration: 900000
    });
  },
  showRemindNone:function(remindContent,time){
    wx.showToast({
      title: remindContent,
      icon: "none",
      duration: time
    });
  }
})
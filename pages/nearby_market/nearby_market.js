// 市场-市场搜索接口_全部 -----------------------------------------------------------------
var markAll_API = "http://172.16.1.110:8060/v1.0/market/search";
var app = new getApp();
Page({
  data: {
    marketSiftArray: [],//更多的全部市场
    mark_inputValue: '',//input输入框的值
    markInputValue: false,//输入框没值的时候×不显示
    winHeight: 0,
    BasicFontAPI: "",
  },
  onLoad: function (options) {
    var that = this ;
    var _basicFontAPI = app.globalData.basicFontAPI;
    that.setData({
      BasicFontAPI: _basicFontAPI
    });
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    //批发市场的全部
    this.moreMarks(this.data.mark_inputValue);
  },
  //市场的input搜索
  nearMarktInput_show: function (e) {
    this.setData({
      mark_inputValue: e.detail.value,
      markInputValue : true
    })
    if (e.detail.value == ""){
      this.setData({
        markInputValue: false
      })
    }
    this.moreMarks(this.data.mark_inputValue);
  },
  //点×清空input搜索搜索框
  clearInputValue: function (e) {
    this.setData({
      mark_inputValue: "",
      markInputValue: false
    })
    this.moreMarks(this.data.mark_inputValue);
  },
  //navigator跳转到相应的市场
  go_markDtail: function (e) {
    var markId = e.currentTarget.dataset.markid;
    var url = "../lessPage/marketDetail/marketDetail?markId=" + markId;
    wx.navigateTo({
      url: url,
    });
  },
  // 更多的全部市场方法的API调用
  moreMarks: function (_keyword) {
    var that = this;
    app.showLoading();
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        wx.request({
          url: markAll_API,
          method: "POST",
          data: {
            lng: longitude,
            lat: latitude,
            pageNum: 1,
            pageSize: 20,
            keyword: _keyword
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
          },
          success: function (res) {
            wx.hideToast()
            var moreMarkArray = res.data.data.list || [];
            for (var i = 0; i < moreMarkArray.length; i++) {
              var num = moreMarkArray[i].distance / 1000;
              moreMarkArray[i].distance = num.toFixed(1);
              moreMarkArray[i].logo = that.data.BasicFontAPI + moreMarkArray[i].logo
            }
            that.setData({
              marketSiftArray: moreMarkArray
            })
          }
        })
      }
    })
  },
  //点击刷新当前位置
  getSelfLocation :function(){
    this.moreMarks("");
  },
})
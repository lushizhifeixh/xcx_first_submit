
//小程序登录获取GPF权限
var limit_API = "http://172.16.1.110:8060//wechat/user/login";
//收藏的商品列表
var collectGoodsListUrl = 'http://gpf-dev.ybveg.com:8060/v1.0/collection/pdt/list';
//取消收藏商品
var callGoodUrl = 'http://172.16.1.110:8060/v1.0/collection/cancel/pdt';
//收藏的商户列表
var collectStoreListUrl = 'http://gpf-dev.ybveg.com:8060/v1.0/collection/shop/list';
//取消收藏店铺
var callStoreUrl = 'http://172.16.1.110:8060/v1.0/collection/cancel/shop';
var app = getApp()
Page({
  data: {
    isEdit: true,//是否没有点击管理
    isorderEmpty: true,//订单一开始不为空
    BasicFontAPI: "",
    winWidth: 0,
    winHeight: 0,
    currentTab: 0,// tab切换 
    collectListArr: [],//收藏的店铺或则是商品的数组
    starListArr: [2, 3, 4, 5],//店铺评价星星的数组
    currntType: collectGoodsListUrl,//一进入店铺调用商品的方法
    selectAllStatus: true    // 全选状态，默认全选
  },
  //管理
  adminiFun: function () {
    var isEdit = this.data.isEdit;
    isEdit = !isEdit;
    this.setData({
      isEdit
    })
  },
  onLoad: function () {
    var that = this;
    /** 
     * 获取系统信息 
     */
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
  },
  onShow: function () {
    var that = this;
    //一进入调取待受理的方法
    var collectType = that.data.currntType;
    that.allCollectFun(collectType);
  },
  //我的收藏的调用方法
  allCollectFun: function (_collectListUrl) {
    var that = this;
    app.showLoading()
    //-----------------------收藏列表请求接口--------------------------
    var appsession = wx.getStorageSync('sessionId');
    //用户-购物车列表
    wx.request({
      url: _collectListUrl,
      header: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        'Cookie': 'appsession=' + appsession
      },
      data: {
        pageNum: 1,
        pageSize: 20
      },
      method: "POST",
      success: function (res) {
        wx.hideToast();
        if (res.data.httpCode == 500) {
          if (res.data.errorCode == "default.error.unlogin") {
            //未登录的情况下去判断是未登录还是未绑定
            wx.login({
              success: function (res) {
                var code = res.code; // 复制给变量就可以打印了，醉了
                if (res.code) {
                  wx.getUserInfo({
                    success: function (res) {
                      that.setData({
                        userInfo: res.userInfo,
                      });
                      //发起权限请求
                      wx.request({
                        url: limit_API,
                        data: {
                          code: code,
                          encryptedData: res.encryptedData,
                          iv: res.iv
                        },
                        success: function (res) {
                          if (res.data.httpCode == 500) {
                            if (res.data.errorCode == "no.bingdin") {
                              wx.navigateTo({
                                url: "/pages/myLoginInfo/register/register",
                              });
                            } else {
                              app.showRemindNone(res.data.errorMessage, 2000)
                            }
                          } else {
                            wx.setStorageSync('sessionId', res.data.data);
                            that.allCollectFun(_collectListUrl);
                          }
                        }
                      })
                    }
                  })
                } else {
                  console.log('获取用户登录态失败！' + res.errMsg)
                }
              }
            });
          } else {
            app.showRemindNone(res.data.errorMessage, 2000)
          }
        } else {//如果登陆了的话,要操作的
          var collectRst = res.data.data;
          // debugger
          collectRst.map(function (ele, i) {
            ele.selected = true;
          })
          if (collectRst.length == 0) {
            that.setData({
              isorderEmpty: false
            })
          } else {
            that.setData({
              isorderEmpty: true
            })
          }
          that.setData({
            collectListArr: collectRst
          })
        }
      }
    });
  },
  /** 
     * 滑动切换tab 
     */
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },
  /** 
   * 点击tab切换 
   */
  swichNav: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
    if (e.target.dataset.current == 0) {
      that.setData({
        currntType: collectGoodsListUrl
      })
      that.allCollectFun(collectGoodsListUrl);

    } else if (e.target.dataset.current == 1) {
      that.setData({
        currntType: collectStoreListUrl
      })
      that.allCollectFun(collectStoreListUrl);

    }
  },
  //点击店铺名字进入店铺
  forwardCartStore: function (e) {
    var item = e.currentTarget.dataset.storeitem,
      _url = "../lessPage/storeDetail/storeDetail?storeId=" + item;
    wx.navigateTo({
      url: _url,
    });
  },
  //全选事件
  selectAll(e) {
    let selectAllStatus = this.data.selectAllStatus;// 是否全选状态
    selectAllStatus = !selectAllStatus;
    let collectListArr = this.data.collectListArr;

    for (let i = 0; i < collectListArr.length; i++) {
      collectListArr[i].selected = selectAllStatus;// 改变所有商品状态
    }
    this.setData({
      selectAllStatus: selectAllStatus,
      collectListArr: collectListArr
    });
  },
  //选择事件
  selectList(e) {
    const index = e.currentTarget.dataset.index;    // 获取data- 传进来的index
    let collectListArr = this.data.collectListArr;                    // 获取购物车列表
    const selected = collectListArr[index].selected;         // 获取当前商品的选中状态
    collectListArr[index].selected = !selected;              // 改变状态
    this.setData({
      collectListArr: collectListArr
    });
  },
  //商品取消收藏
  callGoods: function () {
    var that = this;
    var appsession = wx.getStorageSync('sessionId')
    wx.request({
      url: callGoodUrl,
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded",
        'Cookie': 'appsession=' + appsession
      },
      data: {
        pId: that.data.pdtId
      },
      success: function (res) {
        if (res.data.httpCode == 200) {
          that.setData({
            Goodcollected: false,
          });
          app.showRemindNone("取消收藏成功", 2000)
        } else {
          app.showRemindNone(res.data.errorMessage, 2000)
        };
      }
    });
  },
  //店铺取消收藏
  callStore: function () {
    var that = this;
    var appsession = wx.getStorageSync('sessionId')
    wx.request({
      url: callStoreUrl,
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded",
        'Cookie': 'appsession=' + appsession
      },
      data: {
        sellerId: that.data.storeId
      },
      success: function (res) {
        if (res.data.httpCode == 200) {
          that.setData({
            collected: false,
          });
          app.showRemindNone("取消收藏成功", 2000)
        } else {
          app.showRemindNone(res.data.errorMessage, 2000)
        };
      }
    });
  },
})  
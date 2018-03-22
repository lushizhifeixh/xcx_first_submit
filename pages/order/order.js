//我的订单接口
var myOrderUrl = "http://172.16.1.110:8060/v1.0/order/buyerOrderList";
//小程序登录获取GPF权限
var limit_API = "http://172.16.1.110:8060//wechat/user/login";
//订单取消的接口
var calcMyOrderUrl = "http://172.16.1.110:8060/v1.0/order/cancelOrder";
//订单详情的接口
var orderDetailUrl = "http://172.16.1.110:8060/v1.0/order/getOrderDetail";
//删除订单的接口
var delMyOrderlUrl = "http://172.16.1.110:8060/v1.0/order/buyerDelete";
//再次购买的接口
var buyAginUrl = "http://172.16.1.110:8060/v1.0/order/reBuy";
//确认收货的接口
var configTakeGoodUrl = "http://172.16.1.110:8060/v1.0/order/confirmReceipt";
//取消订单的原因
var calcOrderWhyUrl = 'http://172.16.1.110:8060/v1.0/order/orderReason';
var app = getApp()
Page({
  data: {
    _reason: '',//取消订单的理由
    isCalcOrderWhyShow: false,//取消订单原因的弹框
    isLogin: false,//是否登陆,来判断是否显示页面
    isorderEmpty: true,//订单一开始不为空
    BasicFontAPI: "",
    winWidth: 0,
    winHeight: 0,
    currentTab: 0,// tab切换  
    markArr: [1, 2],
    goodsListArr: [2, 0],
    storeseArr: [1, 2],
    orderResultArr: [],//调用我的订单接口返回的值,
    calcOrderWhyArr: [],//订单取消原因的数组
    currntType: 'ACCEPTING',
  },
  // 点击搜索,进入搜索页面
  goSearchOrder: function () {
    wx.navigateTo({
      url: "../lessPage/searchOrder/searchOrder"
    });
  },
  onLoad: function () {
    // wx.setStorageSync('orderDetailBack', "2");
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
    var type = that.data.currntType;
    that.myOrderFun(type);
    
    
  },
  //我的订单接口的调用方法
  myOrderFun: function (orderParam) {
    app.showLoading()
    var that = this;
    var inBind = wx.getStorageSync('inBind');
    if (inBind == 1) return;
    //-----------------------购物车列表请求接口--------------------------
    var appsession = wx.getStorageSync('sessionId');
    //用户-购物车列表
    wx.request({
      url: myOrderUrl,
      header: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        'Cookie': 'appsession=' + appsession
      },
      data: {
        orderStatus: orderParam,
        pageNum: 1,
        pageSize: 20
      },
      method: "POST",
      success: function (res) {
        wx.hideToast();
        if (res.data.httpCode == 500) {
          that.setData({
            isLogin: false
          })
          
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
                            that.myOrderFun(orderParam);
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
          var resultDater = res.data.data ;
          resultDater.map(function(mark,i){
            mark.orderList.map(function(seller,j){
              seller.orderPrice = (seller.orderPrice-0).toFixed(2);
              seller.pdtDt.map(function(goods){
                goods.price = (goods.price-0).toFixed(2);
                goods.pdtTotalPrice = (goods.pdtTotalPrice-0).toFixed(2);
                goods.orderPdtNum = (goods.orderPdtNum - 0).toFixed(1);
              })
            })
          })
          that.setData({
            isLogin: true
          })
          that.setData({
            orderResultArr: resultDater || []
          })
          if (that.data.orderResultArr.length == 0) {
            that.setData({
              isorderEmpty: false
            })
          } else {
            that.setData({
              isorderEmpty: true
            })
          }
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
      app.showLoading();
      that.setData({
        currntType: 'ACCEPTING'
      });
      that.myOrderFun("ACCEPTING");
    } else if (e.target.dataset.current == 1) {
      app.showLoading()
      that.setData({
        currntType: 'PICKUPING'
      });
      that.myOrderFun("PICKUPING");
    } else if (e.target.dataset.current == 2) {
      app.showLoading()
      that.setData({
        currntType: 'RECEIVED'
      });
      that.myOrderFun("RECEIVED");
    } else if (e.target.dataset.current == 3) {
      app.showLoading()
      that.setData({
        currntType: 'CANCELLED,REFUSED'
      });
      that.myOrderFun("CANCELLED,REFUSED");
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
  //取消订单的接口调用,获取取消订单原因
  calcOrderWhy: function () {
    var that = this,
      appsession = wx.getStorageSync('sessionId'),
      calcOrderWhyArr = [];
    wx.request({
      url: calcOrderWhyUrl,
      header: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        'Cookie': 'appsession=' + appsession
      },
      data: {
        type: "orderCReason"
      },
      method: "POST",
      success: function (res) {
        if (res.data.httpCode == 200) {
          calcOrderWhyArr.push(res.data.data)
          that.setData({
            calcOrderWhyArr
          })
        } else {
          app.showRemindNone(res.data.errorMessage, 2000)
        }
      }
    })
  },
  // 取消订单原因的选择
  chooseCalcReson: function (e) {
    var that = this;
    this.setData({
      _reason: e.currentTarget.dataset.item,
      isCalcOrderWhyShow: false
    })
    that.orderClacFun();
  },
  //取消订单
  calcMyOrder: function (e) {
    var that = this;
    that.calcOrderWhy();
    that.setData({
      isCalcOrderWhyShow: true,
      calcOrderId: e.currentTarget.dataset.myorderid,
      calcOrderStatu: e.currentTarget.dataset.orderstatu
    })
  },
  orderClacFun: function () {
    var that = this,
      appsession = wx.getStorageSync('sessionId');
    wx.request({
      url: calcMyOrderUrl,
      header: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        'Cookie': 'appsession=' + appsession
      },
      data: {
        orderId: that.data.calcOrderId,
        reason: that.data._reason
      },
      method: "POST",
      success: function (res) {
        if (res.data.httpCode == 200) {
          if (res.data.data.state == true) {
            that.myOrderFun(that.data.calcOrderStatu);
            app.showRemindNone("取消成功!", 2000)
          } else {
            app.showRemindNone(res.data.data.msg, 2000)
          }
        } else {
          app.showRemindNone(res.data.errorMessage, 2000)
        }
      }
    })
  },
  //订单详情的接口
  GoOrderDetail: function (e) {
    var appsession = wx.getStorageSync('sessionId');
    var orderId = e.currentTarget.dataset.myorderid;
    var sellerPhone = e.currentTarget.dataset.sellerphone;
    wx.request({
      url: orderDetailUrl,
      header: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        'Cookie': 'appsession=' + appsession
      },
      data: {
        orderId: orderId
      },
      method: "POST",
      success: function (res) {
        if (res.data.httpCode == 500) {
          app.showRemindNone(res.data.errorMessage, 2000)
        } else {
          wx.setStorageSync('orderDtailData', res.data.data);
          wx.setStorageSync('orderId', orderId);
          wx.setStorageSync('sellerPhone', sellerPhone);
          wx.navigateTo({
            url: "../lessPage/orderDetail/orderDetail"
          });
        }
      }
    })
  },
  // 删除订单
  delMyOrder: function (e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定删除订单?',
      success: function (res) {
        if (res.confirm) {
          // app.showLoading();
          var appsession = wx.getStorageSync('sessionId'),
            orderId = e.currentTarget.dataset.myorderid,
            orderStatu = e.currentTarget.dataset.orderstatu;
          wx.request({
            url: delMyOrderlUrl,
            header: {
              "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
              'Cookie': 'appsession=' + appsession
            },
            data: {
              guid: orderId
            },
            method: "POST",
            success: function (res) {
              if (res.data.httpCode == 200) {
                if (res.data.state == true) {
                  that.myOrderFun(orderStatu);
                  app.showRemindNone("删除订单成功!", 2000)
                } else {
                  app.showRemindNone(res.data.data.msg, 2000)
                }
              } else {
                app.showRemindNone(res.data.errorMessage, 2000)
              }
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    
  },
  // 待受理再次购买
  buyAginAccept: function (e) {
    var that = this,
      appsession = wx.getStorageSync('sessionId'),
      orderId = e.currentTarget.dataset.myorderid;
    wx.request({
      url: buyAginUrl,
      header: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        'Cookie': 'appsession=' + appsession
      },
      data: {
        orderId: orderId
      },
      method: "POST",
      success: function (res) {
        if (res.data.httpCode == 200) {
          var rebuy = res.data.data.cartList;
          rebuy = JSON.stringify(rebuy);
          wx.setStorageSync('rebuy', rebuy);
          setTimeout(function () {
            wx.switchTab({
              url: '/pages/shopCart/shopCart',
            });
          }, 1000)
        } else {
          app.showRemindNone(res.data.errorMessage, 2000)
        }
      }
    })
  },
  //确认收货
  confirmTakeGoods: function (e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '是否确认收货?',
      success: function (res) {
        if (res.confirm) {
          // app.showLoading();    
          var  appsession = wx.getStorageSync('sessionId'),
            orderId = e.currentTarget.dataset.myorderid,
            orderStatu = e.currentTarget.dataset.orderstatu;
          wx.request({
            url: configTakeGoodUrl,
            header: {
              "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
              'Cookie': 'appsession=' + appsession
            },
            data: {
              guid: orderId
            },
            method: "POST",
            success: function (res) {
              if (res.data.httpCode == 200) {
                that.myOrderFun(orderStatu);
                app.showRemindNone("确认收货成功!", 2000)
              } else {
                app.showRemindNone(res.data.errorMessage, 2000)
              }
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })  
  },
  //联系卖家
  contactSeller: function (e) {
    var sellerPhone = e.currentTarget.dataset.sellerphone;
    wx.makePhoneCall({
      phoneNumber: sellerPhone,
      complete: function () {
        console.log("拨打过了")
      }
    })
  },
  // 点击取消,订单的朦层消失
  calcLayerHide: function () {
    var that = this;
    that.setData({
      isCalcOrderWhyShow: false
    })
  },
  //点击取消订单外层的朦层,朦层消失
  calOrderLayerOut: function (e) {
    var that = this;
    if (e.target.id == "calclayerout") {
      that.setData({
        isCalcOrderWhyShow: false
      })
    }
  },
})  
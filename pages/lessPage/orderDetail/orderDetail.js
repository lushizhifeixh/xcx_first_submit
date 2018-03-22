// app
var app = new getApp();
//再次购买的接口
var buyAginUrl = "http://172.16.1.110:8060/v1.0/order/reBuy";
//订单取消的接口
var calcMyOrderUrl = "http://172.16.1.110:8060/v1.0/order/cancelOrder";
//确认收货的接口
var configTakeGoodUrl = "http://172.16.1.110:8060/v1.0/order/confirmReceipt";
//取消订单的原因
var calcOrderWhyUrl = 'http://172.16.1.110:8060/v1.0/order/orderReason';
Page({
  data: {
    showDisNon: true,
    BasicFontAPI: "",
    _orderId: '',//订单编号,
    _orderStatus: '',
    orderDtailData: {},
    calcReson: '',//取消头部显示关闭订单中关闭的理由
    goodsArr: [1, 2],
    detailLeftWord: '',//头部的等待卖家受理字样
    detailRightWord: '',//头部的提醒受理字样
    orderState: 0, //显示订单的状态,来控制头部的样式 
    isCalcOrderWhyShow: false,//取消订单原因的弹框 
    _reason: '',//取消订单的理由
    calcOrderWhyArr: [],//订单取消原因的数组
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
      // calcOrderId: e.currentTarget.dataset.myorderid,
      // calcOrderStatu: e.currentTarget.dataset.orderstatu
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
        orderId: that.data._orderId,
        reason: that.data._reason
      },
      method: "POST",
      success: function (res) {
        if (res.data.httpCode == 200) {
          if (res.data.data.state == true) {
            // that.myOrderFun(that.data.calcOrderStatu);
            // app.showRemindNone("取消成功!", 2000)
            setTimeout(function () {
              wx.navigateBack();
            }, 1000);
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
  onLoad: function (option) {
    app.showLoading();
    var that = this,
      _basicFontAPI = app.globalData.basicFontAPI,
      orderDtailData = wx.getStorageSync('orderDtailData'),
      orderId = wx.getStorageSync('orderId');
    orderDtailData.price = orderDtailData.price.toFixed(2);
    orderDtailData.pdtList.map(function (ele, i) {
      ele.price = ele.price.toFixed(2);
      ele.sumPrice = ele.sumPrice.toFixed(2);
      ele.num = ele.num.toFixed(1);
    })
    if (_basicFontAPI != "" && orderDtailData != "" && orderId != "") {
      wx.hideToast();
    }
    if (orderDtailData.orderStatus == "ACCEPTING") {
      that.setData({
        detailLeftWord: "等待卖家受理",
        detailRightWord: "提醒受理",
        orderState: 1,
        showDisNon: true
      })
    } else if (orderDtailData.orderStatus == "PICKUPING") {
      that.setData({
        detailLeftWord: "卖家已受理",
        detailRightWord: "",
        orderState: 2,
        showDisNon: false
      })
    } else if (orderDtailData.orderStatus == "RECEIVED") {
      that.setData({
        detailLeftWord: "已收货",
        detailRightWord: "2018-01-08 10:59:34",
        orderState: 3,


      })
    } else if (orderDtailData.orderStatus == "CANCELLED") {
      that.setData({
        detailLeftWord: "已关闭",
        detailRightWord: "2018-01-08 10:59:34",
        orderState: 4,
        calcReson: orderDtailData.reason,

      })
    } else if (orderDtailData.orderStatus == "REFUSED") {
      that.setData({
        detailLeftWord: "已关闭",
        detailRightWord: "2018-01-08 10:59:34",
        orderState: 5,
        calcReson: orderDtailData.reason,

      })
    }
    that.setData({
      BasicFontAPI: _basicFontAPI,
      orderDtailData,
      _orderId: orderId,
      _orderStatus: orderDtailData.orderStatus

    });
  },
  // 待受理再次购买
  buyAginAcceptr: function (e) {
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
  //联系卖家
  contactSellerDetail: function (e) {
    var that = this;
    var sellerPhonere = e.currentTarget.dataset.sellerphoner;
    wx.makePhoneCall({
      phoneNumber: sellerPhonere,
      complete: function () {
      }
    })
  },
  //确认收货
  confirmTakeGoodsr: function (e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '是否确认收货?',
      success: function (res) {
        if (res.confirm) {
          app.showLoading();
          var appsession = wx.getStorageSync('sessionId'),
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
                setTimeout(function () {
                  wx.navigateBack();
                }, 1000)
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
  copyFun: function (e) {
   var _copy = e.currentTarget.dataset.ordernum;
    wx.setClipboardData({
      data: _copy,  //复制的内容
      success() {
        app.showRemindNone("复制成功!",1000)
       }
      //成功之后的回调
    })
  }


})
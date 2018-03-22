//订单-根据买家名称搜索订单列表 
var serchMyOrderUrl = "http://172.16.1.110:8060/v1.0/order/findOrderListBySellerNameSearch";
//订单详情的接口
var orderDetailUrl = "http://172.16.1.110:8060/v1.0/order/getOrderDetail";
//通过订单-通过扫描获取自己的订单详情
var scanOrderUrl = 'http://gpf-dev.ybveg.com:8060/v1.0/order/getOrderDetailByOrderNo' ;
//再次购买的接口
var buyAginUrl = "http://172.16.1.110:8060/v1.0/order/reBuy";
//确认收货的接口
var configTakeGoodUrl = "http://172.16.1.110:8060/v1.0/order/confirmReceipt";
//取消订单的原因
var calcOrderWhyUrl = 'http://172.16.1.110:8060/v1.0/order/orderReason';
//订单取消的接口
var calcMyOrderUrl = "http://172.16.1.110:8060/v1.0/order/cancelOrder";
// app
var app = new getApp();

Page({
  data: {
    winHeight:'',
    serchOrdertVal: false,// 一进入页面input的×不显示
    isorderEmpty: true,//订单一开始不为空
    BasicFontAPI: "",
    searchResultArr: [],
    input_Value: '', //订单搜索框的值
    calcOrderWhyArr: [],//订单取消原因的数组
    _reason: '',//取消订单的理由
    isCalcOrderWhyShow: false,//取消订单原因的弹框
  },
  onLoad: function () {
    var that = this;
    var _basicFontAPI = app.globalData.basicFontAPI;
    that.setData({
      BasicFontAPI: _basicFontAPI
    }); 
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winHeight: res.windowHeight
        });
      }
    }); 
  },
  onShow:function(){//每次进入搜索页面进行订单的全部搜索
    var that = this;
    that.serchMyOrderFun("");
  },
  // 下拉加载更多
  loadMoreData:function(){

  },
  // 根据买家名称搜索订单列表 
  serchMyOrderFun: function (inputValue) {
    app.showLoading();  
    var that = this,
      appsession = wx.getStorageSync('sessionId');
    wx.request({
      url: serchMyOrderUrl,
      header: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        'Cookie': 'appsession=' + appsession
      },
      data: {
        keywords: inputValue,
        pageNum: 1,
        pageSize: 100
      },
      method: "POST",
      success: function (res) {
        wx.hideToast();
        if (res.data.httpCode == 200) {
          var orderSerchData = res.data.data ;
          orderSerchData.map(function (mark, i) {
            mark.orderList.map(function (seller, j) {
              seller.orderPrice = (seller.orderPrice - 0).toFixed(2);
              seller.pdtDt.map(function (goods) {
                goods.price = (goods.price - 0).toFixed(2);
                goods.pdtTotalPrice = (goods.pdtTotalPrice - 0).toFixed(2);
                goods.orderPdtNum = (goods.orderPdtNum - 0).toFixed(1);
              })
            })
          })
          var allOrderListArr = orderSerchData || [];
          if (allOrderListArr.length==0){//搜索出来的订单为空
            that.setData({
              isorderEmpty: false,
            })
          }else{
            that.setData({
              searchResultArr: allOrderListArr,
              isorderEmpty: true,
            })
          }       
        } else {
          app.showRemindNone(res.data.errorMessage,2000)
        }
      }
    })
  },
  serchSellerOrder: function (e) {// 根据店铺名称搜索订单
    var that = this ;
    app.showLoading();
    that.serchMyOrderFun(that.data.input_Value);
  },
  searchSingleorders:function(e){//通过input事件控制×的显示与否
    this.setData({
      input_Value: e.detail.value
    })
    if (e.detail.value == "") {
      this.setData({
        serchOrdertVal: false
      })
      this.serchMyOrderFun("");
    } else {
      this.setData({
        serchOrdertVal: true
      })
    }
  },
  clearSerInputVale: function (e) {//点×清空搜索框
    this.setData({
      input_Value: "",
      serchOrdertVal: false
    })
    this.serchMyOrderFun("");
  },
  //订单详情的接口
  GoOrderDetail: function (e, _orderId_) {
    var appsession = wx.getStorageSync('sessionId');
    if( e!=''){
      var orderId = e.currentTarget.dataset.myorderid;
    }
    wx.request({
      url: orderDetailUrl,
      header: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        'Cookie': 'appsession=' + appsession
      },
      data: {
        orderId: orderId || _orderId_
      },
      method: "POST",
      success: function (res) {
        if (res.data.httpCode == 500) {
          app.showRemindNone(res.data.errorMessage, 2000)
        } else {
          wx.setStorageSync('orderDtailData', res.data.data);
          wx.setStorageSync('orderId', orderId || _orderId_);
          wx.navigateTo({
            url: "../orderDetail/orderDetail"
          });
        }

      }
    })
  },
  userScan:function(){//通过扫码获取自己的订单
  var that = this ;
    wx.scanCode({//允许从相机和相册扫码
      success: (res) => {
        if (res.errMsg == "scanCode:ok") {//扫描成功获取扫描获取到的订单编号
          that.scanorderFun(res.result)
        }else{//扫描失败
          app.showRemindNone(res.errMsg,3000);
        }
      }
    })
  },
  // 通过订单-通过扫描获取自己的订单详情
  scanorderFun: function (_orderNo){
    var that = this ;
    var appsession = wx.getStorageSync('sessionId');
    wx.request({
      url: scanOrderUrl,
      header: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        'Cookie': 'appsession=' + appsession
      },
      data: {
        isBuyer:'buyer',
        orderNo: _orderNo
      },
      method: "POST",
      success: function (res) {
        if(res.data.httpCode == 500){//该编号不存在或则不是你的订单
          app.showRemindNone(res.data.errorMessage, 8000);
        }else{//成功就调取搜索订单的方法
          that.GoOrderDetail('', res.data.data.orderGuid);//res.data.data.orderGuid是订单编号
        }
      }
    })
  },
  // 再次购买
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
  //联系卖家
  contactSellerDetail: function (e) {
    var that = this;
    var sellerPhonere = e.currentTarget.dataset.sellerphoner;
    wx.makePhoneCall({
      phoneNumber: sellerPhonere,
      complete: function () {
        console.log("拨打过了ya")
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
          var appsession = wx.getStorageSync('sessionId'),
            orderId = e.currentTarget.dataset.myorderid;
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
      calcOrderId: e.currentTarget.dataset.myorderid
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
            that.serchMyOrderFun(that.data.input_Value);
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
  //点击店铺名字进入店铺
  forwardCartStore: function (e) {
    var item = e.currentTarget.dataset.storeitem,
      _url = "../storeDetail/storeDetail?storeId=" + item;
    wx.navigateTo({
      url: _url,
    });
  },
})
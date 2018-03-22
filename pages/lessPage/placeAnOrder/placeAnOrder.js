// app
var app = new getApp();
// 买家类型的接口
var buyerUrl = 'http://172.16.1.110:8060/v1.0/order/getBuyerType';
//提货时间间隔
var timeUrl = 'http://172.16.1.110:8060/v1.0/order/getDeliveryTimeRange';
//提交订单的接口172.16.2.4:8080
var anOrderUrl = "http://172.16.1.110:8060/v1.0/order/ensureOrder";
// 个人信息的朦层点击确认的接口
var personInfoUrl = 'http://gpf-dev.ybveg.com:8060/v1.0/buyer/info/complete';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    nameValue: '',//完善用户信息的姓名
    concreteTypeValue: '',//完善用户信息的具体类型
    isBuyerShow: true,//一开始显示如果为个人具体类型就不显示
    buyerLayerShow: false,//买家类型的朦层
    buyerFiy: '买家类型',
    buyerNumber: '',//买家类型的序号
    _buyerClassfiy: [],//买家类型的名字
    _buyerNumber: [],   //买家类型的序号
    pickLayerShow: false,//是否显示买家类型选择的朦层
    buyerClassfiy: [],//买家类型
    pickGoodsTime: '选择提货时间',//选择提货时间
    dayvalue: "", //时间的day
    BasicFontAPI: "",
    cartBandData: '',//getStorageSync
    allMarkArr: '',//getStorageSync.data
    pickGoodsTimeArr: '',//提货时间
    pickGoodsLayer: false,//提货时间朦层
    currentTab: 0,// tab切换 
    _startDate: '', //送货的的开始时间
    _endDate: '', //送货的的结束时间
    choosedIndex: -1,
  },
  //选择提货时间,朦层出现
  selectTime: function () {
    var that = this;
    that.setData({
      pickGoodsLayer: true
    })
  },
  //点击外层的朦层,朦层消失
  wrapLayerOut: function (e) {
    var that = this;
    if (e.target.id == "wraplayer") {
      that.setData({
        pickGoodsLayer: false
      })
    }
  },
  //点×朦层消失
  calcLayer: function () {
    var that = this;
    that.setData({
      pickGoodsLayer: false
    })
  },
  //获取提货时间间隔的方法
  pickUpTime: function () {
    var that = this;
    wx.request({
      url: timeUrl,
      header: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      method: "POST",
      data: {},
      success: function (res) {
        if (res.data.httpCode == 200) {

          that.setData({
            pickGoodsTimeArr: res.data.data,
            dayvalue: res.data.data[0].date
          })
        } else {
          app.showRemindNone(res.data.errorMessage, 2000)
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var that = this,
      _basicFontAPI = app.globalData.basicFontAPI,
      cartBandData = wx.getStorageSync('cartBandData');
    cartBandData.totalPrice = (cartBandData.totalPrice-0).toFixed(2);
    console.log(cartBandData.data, '22222222222')
    cartBandData.data.map(function (ele, i) {
      ele.subList.map(function (stores) {
        stores['orderMark'] = "";
        stores.sellerTotalPrice = (stores.sellerTotalPrice-0).toFixed(2);
        stores.cartList.map(function(goods){
          goods.cartNum = (goods.cartNum - 0).toFixed(1);
          goods.price = (goods.price - 0).toFixed(2);
          goods.pdtTotalPrice = (goods.pdtTotalPrice - 0).toFixed(2);
        })
      })
    })
    that.setData({
      BasicFontAPI: _basicFontAPI,
      cartBandData,
      allMarkArr: cartBandData.data,
      goodsNum: wx.getStorageSync('goodsNum')
    });
    that.pickUpTime()
  },

  saveMsg(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var storeIndex = e.currentTarget.dataset.storeindex;
    var msg = e.detail.value;
    var list = that.data.allMarkArr;
    list[index].subList[storeIndex].orderMark = msg;
    that.setData({
      allMarkArr: list
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  // 提交订单
  placeAnOrder: function () {
    var that = this;
    var appsession = wx.getStorageSync('sessionId');
    var complete = wx.getStorageSync('complete');
    if (that.data._startDate == "" && that.data._endDate == "") {
      app.showRemindNone('请选择提货时间哟~', 2000)
    } else {
      if (complete == false) {//为false表示第一次提交订单
        that.setData({
          buyerLayerShow: true
        })
      } else {
        app.showLoading();
        var source = that.data.allMarkArr;
        var arr = [];
        source.map(function (ele) {
          ele.subList.map(function (_store) {
            var obj = {};
            obj['shopGuid'] = _store.sellerId;
            obj['orderMark'] = _store.orderMark;
            var cartArr = [];
            _store.cartList.map(function (goods) {
              var goodsObj = {};
              goodsObj['pGuid'] = goods.pdtId;
              goodsObj['cartGuid'] = goods.guid;
              goodsObj['cartNum'] = goods.cartNum;
              cartArr.push(goodsObj);
            });
            obj['productCartList'] = cartArr;
            arr.push(obj);
          });
        });
        wx.request({
          url: anOrderUrl,
          header: {
            "content-type": "application/json",
            'Cookie': 'appsession=' + appsession
          },
          method: "POST",
          data: {
            "deliverytimestart": that.data._startDate,
            "deliverytimeend": that.data._endDate,
            "shopList": arr
          },
          success: function (res) {
            wx.hideToast();
            if (res.data.httpCode == 500) {
              app.showRemindNone(res.data.errorMessage, 3000);
              if (res.data.errorCode == "购物车包含失效商品！") {
                wx.switchTab({
                  url: "/pages/shopCart/shopCart",
                });
                setTimeout(function () {
                  app.showRemindNone('购物中有失效商品', 3000);
                }, 1000)
              }
            } else if (res.data.httpCode == 200 && res.data.data.msg == "订单生成成功") {
              wx.navigateBack();
              setTimeout(function () {
                app.showRemindNone('订单生成成功', 4000);
              }, 0)
            }
          }
        })
      }
    }

  },
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },

  swichNav: function (e) {
    var that = this;
    that.setData({
      dayvalue: e.currentTarget.dataset.dayvalue
    })
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current,
        choosedIndex: -1
      })
    }
  },
  //选择时间的点击时间
  selectTimeChange: function (e) {
    var that = this;
    var alltime = e.currentTarget.dataset.alltime;
    var index = e.currentTarget.dataset.index;
    that.setData({
      pickGoodsTime: that.data.dayvalue + " " + e.currentTarget.dataset.timevalue,
      pickGoodsLayer: false,
      _startDate: alltime.startDate,
      _endDate: alltime.endDate,
      choosedIndex: index
    })
  },
  // 第一次提交订单的时候买家类型的选择
  showAction: function () {
    var that = this;
    that.setData({
      pickLayerShow: true
    })
    that.getBuyerFun();
  },
  // 买家类型方法的封装
  getBuyerFun: function () {
    var that = this;
    wx.request({
      url: buyerUrl,
      header: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      data: {},
      method: "POST",
      success: function (res) {
        if (res.data.httpCode == 500) {
          app.showRemindNone(res.data.errorMessage, 3000);
        } else {
          var resultData = res.data.data;
          var _buyerClassfiy_ = [];
          var _buyerNumber_ = [];
          resultData.map(function (ele, i) {
            _buyerClassfiy_.push(ele.value)
            _buyerNumber_.push(ele.key)
          })
          that.setData({
            buyerClassfiy: resultData,
            _buyerClassfiy: _buyerClassfiy_,
            _buyerNumber: _buyerNumber_
          })
        }
      }
    })
  },
  // 点击买家类型的滑动块,获取值
  buyerGet: function (e) {
    console.log(e.currentTarget.dataset.buyvalue)
  },
  bindChanger: function (e) {
    const val = e.detail.value
    this.setData({
      buyerFiy: this.data._buyerClassfiy[val[0]],
      buyerNumber: this.data._buyerNumber[val[0]]
    })
  },
  // 点击买家类型选择朦层的取消
  calcPickLayer: function () {
    this.setData({
      buyerFiy: "买家类型",
      pickLayerShow: false,
      buyerNumber: ''
    })
    if (this.data.buyerFiy == "买家类型") {
      this.setData({
        isBuyerShow: true
      })
    }
  },
  // 点击买家类型选择朦层的确定
  surePickLayer: function () {
    this.setData({
      pickLayerShow: false
    })
    if (this.data.buyerNumber == "301") {
      this.setData({
        isBuyerShow: false
      })
    } else {
      this.setData({
        isBuyerShow: true
      })
    }
  },
  //点击买家类型外层的朦层,朦层消失
  pickerLayerOut: function (e) {
    var that = this;
    if (e.target.id == "pickerly") {
      that.setData({
        pickLayerShow: false
      })
    }
  },
  //点击最外层补充买家类型的朦层消失
  buyerlyLayerOut: function (e) {
    var that = this;
    if (e.target.id == "buyerWrapLayer") {
      that.setData({
        buyerLayerShow: false
      })
    }
  },
  // 点击确认提交个人信息
  pickPersonInfo: function () {
    var that = this;
    if (that.data.buyerNumber == "301") {
      if (that.data.nameValue != '' && that.data.buyerNumber != '') {
        that.pickPersonInfoFun();
      } else {
        app.showRemindNone('请完善个人信息!', 3000);
      }
    } else {
      if (that.data.nameValue != '' && that.data.buyerNumber != '' && that.data.concreteTypeValue != '') {
        that.pickPersonInfoFun();
      } else {
        app.showRemindNone('请完善个人信息!', 3000);
      }
    }
  },
  // 个人信息提方法的封装
  pickPersonInfoFun: function () {
    var that = this;
    var appsession = wx.getStorageSync('sessionId');
    wx.request({
      url: personInfoUrl,
      header: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        'Cookie': 'appsession=' + appsession
      },
      data: {
        username: that.data.nameValue,
        orgname: that.data.concreteTypeValue,
        usertype: that.data.buyerNumber
      },
      method: "POST",
      success: function (res) {
        if (res.data.httpCode == 500) {//报500错误
          app.showRemindNone(res.data.errorMessage, 3000);
        } else {
          app.showRemindNone(res.data.data.msg, 3000);
          that.setData({//信息完善成功朦层消失
            buyerLayerShow: false
          })
        }
      }
    })
  },
  // 完善用户信息的姓名的获取
  saveName: function (e) {
    var that = this;
    var nameVal = e.detail.value;
    that.setData({
      nameValue: nameVal
    });
  },
  // 完善用户信息的具体类型的获取
  saveConcreteValue: function (e) {
    var that = this;
    var concreVal = e.detail.value;
    that.setData({
      concreteTypeValue: concreVal
    });
  }
})
// 商品详情页的API
var googsDetail_API = "http://172.16.1.110:8060/v1.0/buyer/getProductInfo"
//小程序登录获取GPF权限
var limit_API = "http://172.16.1.110:8060//wechat/user/login";
// 收藏商品
var collectGoodUrl = 'http://172.16.1.110:8060/v1.0/collection/add/pdt';
//取消收藏商品
var callGoodUrl = 'http://172.16.1.110:8060/v1.0/collection/cancel/pdt';
//添加到购物车以及修改数量
var addCartUrl = 'http://172.16.1.110:8060/v1.0/shoppingcart/saveAndUpdate';
//购物车-当前用户购物车商品数量-
var storeCartNumUrl = 'http://172.16.1.110:8060/v1.0/shoppingcart/count';
//立即购买的接口
var buyAtOnceUrl = 'http://gpf-dev.ybveg.com:8060/v1.0/order/buynow' ;
// app
var app = new getApp();
Page({
  data: {
    isGoodEffect: true,//商品是否失效 
    LayermainImg: '',//主图
    imgUrls: [],
    cateBoxListArray: [],
    getIndexObject: {},
    Goodcollected: false,
    pdtId: '',//商品id
    storeId: '',//店铺id
    showModal: false,//加入购物车是否显示弹框,一开始不显示
    _guid: '',//购物车主键
    _cartInputValue: '',
    cartInputValue: '',
    canInputDot: true,   //数量是否可以输小数
    isLoginNum: false,//是否显示购物车
    storeCartNum: 0,//购物车的数量
    hasGoosSimly: true,//默认有相似商品
  },
  //进入店铺查看购物车的数量
  freshCartNum: function () {
    var me = this;
    var appsession = wx.getStorageSync('sessionId');
    ////进入店铺查看购物车里面的数量
    wx.request({
      url: storeCartNumUrl,
      header: {
        "content-type": "application/x-www-form-urlencoded",
        'Cookie': 'appsession=' + appsession
      },
      data: {},
      method: "POST",
      success: function (res) {
        if (res.data.httpCode == 500) {
          if (res.data.errorCode == "default.error.unlogin") {
            me.setData({
              isLoginNum: false
            })
          } else {
            app.showRemindNone(res.data.errorMessage, 2000)
          }
        } else {
          me.setData({
            isLoginNum: true,
            storeCartNum: res.data.data.count
          })
        }
      }
    })
  },
  //进入店铺
  goThisStore: function () {
    wx.redirectTo({
      url: '../storeDetail/storeDetail?storeId=' + this.data.storeId,
    });
  },
  onShow: function () {
    this.freshCartNum();
    //设置缓存,记录进入过商品页面
    wx.setStorageSync('fromGoods', '1');
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (params) {
    var me = this;
    me.setData({
      pdtId: params.goodsId
    })
    me.goodsDetilFun();
  },
  goodsDetilFun: function () {
    var me = this;
    app.showLoading();
    var appsession = wx.getStorageSync('sessionId')
    wx.request({
      url: googsDetail_API,
      data: {
        pId: me.data.pdtId
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Cookie': 'appsession=' + appsession
      },
      success: function (res) {
        if (res.data.httpCode == 500) {
          app.showRemindNone(res.data.errorMessage, 2000)
        } else { 
          var goodsData = res.data.data ;
          var _getIndexObject = goodsData.pdtInfo ;
          // Number(_getIndexObject.price).toFixed(5);//价格保留两位数字
          wx.hideToast();
          if (goodsData.isEffect) {
            app.showRemindNone("该商品已失效", 2000)
            me.setData({
              isGoodEffect: false
            });
          } else {
            me.setData({
              isGoodEffect: true,
              storeId: goodsData.pdtInfo.sellerId
            });
            if (goodsData.pdtInfo.packaged == 'FALSE') {
              me.setData({
                canInputDot: false
              });
            };
            var or_coll = goodsData.pdtInfo.collectPdt;
            if (or_coll == 'true') {
              me.setData({
                Goodcollected: true
              });
            } else {
              me.setData({
                Goodcollected: false
              });
            };
            var LayermainImg = app.globalData.basicFontAPI + goodsData.pdtInfo.slideImgs.split(",")[0];
            var cartGuid = goodsData.pdtInfo.guid;
            me.setData({
              LayermainImg: LayermainImg,
              _guid: cartGuid
            })
            var imgUrles = goodsData.pdtInfo.slideImgs.split(",")
            for (var i = 0; i < imgUrles.length; i++) {
              me.data.imgUrls.push(app.globalData.basicFontAPI + imgUrles[i]);
            }

            var similarPdtInfo = goodsData.similarPdtInfo || [];
            if (similarPdtInfo.length == 0){
              me.setData({
                hasGoosSimly :false
              })
            }else{
              me.setData({
                hasGoosSimly: true
              })
            }
            for (var i = 0; i < similarPdtInfo.length; i++) {
              var imgs = similarPdtInfo[i].slideImgs;
              var img = imgs.split(",")[0];
              similarPdtInfo[i].price = similarPdtInfo[i].price.toFixed(2);
              similarPdtInfo[i].slideImgs = app.globalData.basicFontAPI + img;
            }
            me.setData({
              cateBoxListArray: similarPdtInfo,
              getIndexObject: _getIndexObject,
              _cartInputValue: goodsData.pdtInfo.minNum,
              cartInputValue: goodsData.pdtInfo.minNum,
              imgUrls: me.data.imgUrls
            })
          }

        }
      }
    });
  },
  //点击购物车数量进入购物车
  goCartListPage: function () {
    var _url = "/pages/shopCart/shopCart";
    wx.switchTab({
      url: _url,
    });
  },
  /**
   * 添加商品数量
   */
  addGoodsNum() {
    var that = this;
    var cartInputValue = that.data.cartInputValue;
    var _cartInputValue = that.data._cartInputValue;
    if (cartInputValue < _cartInputValue) {
      app.showRemindNone("商品数量不得低于起批量", 2000);
      cartInputValue = _cartInputValue
    } else {
      cartInputValue++;
    }
    that.setData({ cartInputValue });
  },
  /**
   * 减少商品数量
   */
  deductGoodsNum() {
    var that = this;
    var cartInputValue = that.data.cartInputValue;
    var _cartInputValue = that.data._cartInputValue;
    if (cartInputValue <= _cartInputValue) {
      app.showRemindNone("商品数量不得低于起批量", 2000);
      cartInputValue = _cartInputValue
    } else {
      cartInputValue--
    }
    that.setData({ cartInputValue });
  },
  //失去焦点是促发
  blurInput: function (e) {
    var that = this;
    var cartInputValue = that.data.cartInputValue;
    var _cartInputValue = that.data._cartInputValue;
    if (cartInputValue <= _cartInputValue) {
      app.showRemindNone("商品数量不得低于起批量", 2000);
      cartInputValue = _cartInputValue
    }
  },
  //收藏方法的封装
  collectGoodsFun: function () {
    var that = this;
    var appsession = wx.getStorageSync('sessionId');
    wx.request({
      url: collectGoodUrl,
      header: {
        "content-type": "application/x-www-form-urlencoded",
        'Cookie': 'appsession=' + appsession
      },
      data: {
        pdtid: that.data.pdtId,
        sellerid: that.data.storeId
      },
      method: "POST",
      success: function (res) {
        if (res.data.httpCode == 500) {
          if (res.data.errorCode == "default.error.unlogin") {
            //未登录的情况下去判断是未登录还是未绑定
            wx.login({
              success: function (res) {
                var code = res.code;
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
                            that.collectGoodsFun();
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
        } else {
          that.setData({
            Goodcollected: true,
          });
          app.showRemindNone("成功收藏商品", 2000)
        }
      }
    })
  },
  /**
  *收藏商品,
  */
  collectGoods: function () {
    var that = this;
    that.collectGoodsFun();
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
  /**
*商品加入购物车
*/
  addShopCart: function () {
    var that = this;
    wx.setStorageSync('oprationNum', 1); 
    that.setData({
      showModal: true
    })
  },
  //点击×关闭购物车弹框
  offDialog: function () {
    this.setData({
      showModal: false
    })
  },
  //点击外层弹框关闭
  off_layer: function (e) {
    if (e.target.id == "wrapLayer") {
      this.setData({
        showModal: false
      })
    }
  },
  cartNumInput: function (e) {
    var that = this;
    var cartNum = e.detail.value;
    if (that.data.canInputDot) {
      cartNum = cartNum.replace('.', '');
    };
    //保留一位小数
    var floatNum = cartNum.split('.')[1];
    if (!!floatNum) {
      var floatLenth = floatNum.length;
      if (floatLenth > 1) {
        floatNum = floatNum[0];
        cartNum = cartNum.split('.')[0] + '.' + floatNum;
      };
    };
    that.setData({
      cartInputValue: cartNum
    });
  },
  //点击确认按钮加入购物车
  start_addCart: function () {
    var that = this ;
    var oprationNum = wx.getStorageSync('oprationNum');
    if (oprationNum == 1) {//如果是1就是加入购物车
      that.addCartFun();
      // wx.setStorageSync('oprationNum','');
    } else if (oprationNum == 2){//如果是2就是立即购买
      that.buyAdonceSureFun();
      // wx.setStorageSync('oprationNum', '');
    }
  },
  addCartFun: function () {
    var that = this;
    var appsession = wx.getStorageSync('sessionId')
    wx.request({
      url: addCartUrl,
      data: {
        pdtid: that.data.pdtId,
        num: that.data.cartInputValue,
        guid: ""
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Cookie': 'appsession=' + appsession
      },
      success: function (res) {
        if (res.data.httpCode == 500) {
          if (res.data.errorCode == "default.error.unlogin") {
            that.setData({
              showModal: false
            })
            app.showRemindNone(res.data.errorMessage, 2000)
            //未登录的情况下去判断是未登录还是未绑定
            wx.login({
              success: function (res) {
                var code = res.code;
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
                            that.addCartFun();
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
        } else {
          if (res.data.data.state == false) {
            app.showRemindNone(res.data.data.msg, 2000)
            if (res.data.data.msg == "该商品已在购物车！") {
              that.setData({
                showModal: false
              })
            } else {
              that.setData({
                showModal: true
              })
            }
          } else {
            //购物车数量的方法调用
            that.freshCartNum()
            that.setData({
              showModal: false
            })
            app.showRemindNone(res.data.data.msg, 2000)
          }
        }
      }
    })
  },
  // 立刻购买
  buyAdonce: function () {
    var that = this;
    wx.setStorageSync('oprationNum', 2);
    that.setData({
      showModal: true
    })
    
  },
  buyAdonceSureFun:function(){
    console.log("lijiegoumai")
    var that = this ;
    var appsession = wx.getStorageSync('sessionId');
    wx.request({
      url: buyAtOnceUrl,
      header: {
        "content-type": "application/x-www-form-urlencoded",
        'Cookie': 'appsession=' + appsession
      },
      data: {
        pdtid: that.data.pdtId,
        num: that.data.cartInputValue
      },
      method: "POST",
      success: function (res) {
        if (res.data.httpCode == 500) {
          if (res.data.errorCode == "default.error.unlogin") {
            //未登录的情况下去判断是未登录还是未绑定
            wx.login({
              success: function (res) {
                var code = res.code;
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
                            that.buyAdonce();
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
        } else {
          that.setData({
            showModal: false
          })
          //成功的话就跳转页面
          var cartData = res.data.data;
          wx.setStorageSync('complete', res.data.data.complete);
          wx.setStorageSync('cartBandData', cartData);
          // 
          wx.setStorageSync('goodsNum', 1);
          wx.navigateTo({
            url: "../placeAnOrder/placeAnOrder",
          });
        }
      }
    })
  },
  //navigator商品详情里面的相似商品的跳转
  go_goodsSimly: function (e) {
    var item = e.currentTarget.dataset.goodsimlyitem,
      _url = "../goodsDetail/goodsDetail?goodsId=" + item;
    wx.navigateTo({
      url: _url,
    });
  }
})
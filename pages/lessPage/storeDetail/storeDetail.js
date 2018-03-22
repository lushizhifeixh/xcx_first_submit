var app = new getApp();
// 店铺首页_头部——API
var storeHeader_API = "http://172.16.1.110:8060/v1.0/buyer/getSellerInfo";
// 店铺左边品类_API
var storeSortLeft_API = "http://172.16.1.110:8060/v1.0/pdttype/sellerPdtType";
// 根据左边品类ID获取数据_API                              
var storeStailRight_API = "http://172.16.1.110:8060/v1.0/sellerPdt/pdtListByType"
//小程序登录获取GPF权限
var limit_API = "http://172.16.1.110:8060//wechat/user/login";
// 收藏店铺
var collectStoreUrl = 'http://172.16.1.110:8060/v1.0/collection/add/shop';
//取消收藏店铺
var callStoreUrl = 'http://172.16.1.110:8060/v1.0/collection/cancel/shop';
//购物车-当前用户购物车商品数量-
var storeCartNumUrl = 'http://172.16.1.110:8060/v1.0/shoppingcart/count';
Page({
  data: {
    storeExit:true,//店铺默认存在
    storeInputValue: false,// 一进入页面input的×不显示
    storeHeaderObject: {},
    isStoreShow: false,
    headerBackground: "",
    mark: 0,
    newmark: 0,
    starArray: [],
    posTop: "280",
    posBot: "0",
    category: [],
    detail: [],
    curIndex: 0,
    isScroll: false,
    toView: "",
    cateBoxListArray: [],
    storeId: "",
    collected: false,
    minFeatureArray: [],
    input_value: '', //店铺搜索框的值
    isStoreGoods: true,//店铺搜索框结果是否有值
    storeCartNum: 0,//购物车的数量
    isLoginNum: false,
  },
  // 拨打电话
  phoneRelation: function () {
    var me = this;
    wx.makePhoneCall({
      phoneNumber: me.data.storeHeaderObject.phone,
      complete: function () {
        console.log("拨打过了")
      }
    })
  },
  tap_start: function (e) {
    this.data.mark = this.data.newmark = e.touches[0].pageY;
  },
  tap_drag: function (e) {
    var me = this;
    this.data.newmark = e.touches[0].pageY;
    if (this.data.mark > this.data.newmark) {
      me.setData({
        posTop: "120",
        posBot: "120",
        isStoreShow: true
      })
    } else {
      me.setData({
        posTop: "280",
        posBot: "0",
        isStoreShow: false
      })
    }
  },
  tap_end: function (e) {
    this.data.mark = 0;
    this.data.newmark = 0;
  },
  /**
   *点击收藏
  */
  collectStore: function () {
    var that = this;
    that.collectStoreFun();
  },
  //收藏方法的封装
  collectStoreFun: function () {
    var that = this;
    var appsession = wx.getStorageSync('sessionId');
    wx.request({
      url: collectStoreUrl,
      header: {
        "content-type": "application/x-www-form-urlencoded",
        'Cookie': 'appsession=' + appsession
      },
      data: {
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
                            that.collectStoreFun();
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
            collected: true,
          });
          app.showRemindNone("成功收藏店铺", 2000)
        }
      }
    })
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
  onShow: function () {
    //设置缓存,记录进入过店铺页面
    wx.setStorageSync('fromStore', '1');
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
    var pdtType_Id = this.data.toView;
    me.goStoreRight(pdtType_Id, "");
  },
  onLoad(params) {
    var me = this;
    this.setData({
      storeId: params.storeId
    });
    // //////////////////
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        var appsession = wx.getStorageSync('sessionId');
        wx.request({
          url: storeHeader_API,
          data: {
            sellerId: params.storeId,
            lat: latitude,
            lng: longitude
          },
          method: "POST",
          header: {
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'Cookie': 'appsession=' + appsession
          },
          success(res) {

            if (res.data.httpCode == 500) {
              app.showRemindNone(res.data.errorMessage, 5000)
              if (res.data.errorMessage == "此店铺不存在"){
                me.setData({
                  storeExit:false
                })
              }
            } else {
              //是否收藏店铺
              var or_coll = res.data.data.collectShop;
              if (or_coll == 'true') {
                me.setData({
                  collected: true
                });
              } else {
                me.setData({
                  collected: false
                });
              };
              var headerObj = res.data.data;
              headerObj.picstr = app.globalData.basicFontAPI + res.data.data.picstr.split(",")[0];
              var myHeaderBackgrund = app.globalData.basicFontAPI + res.data.data.backgroudPic;
              var newstarLength = parseInt(headerObj.shopAccess);
              for (var i = 0; i < newstarLength; i++) {
                me.data.starArray.push(i);
              }
              me.setData({
                storeHeaderObject: headerObj,
                starArray: me.data.starArray,
                headerBackground: myHeaderBackgrund
              })
            }
          }
        });
      }
    })
    // 店铺左边品类_API
    wx.request({
      url: storeSortLeft_API,
      data: {
        sellerId: params.storeId
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      success(res) {
        if (res.data.httpCode == 500) {
          app.showRemindNone(res.data.errorMessage, 2000)
        } else {
          var sortLeftArray = res.data.data.list || [];
          for (var i = 0; i < sortLeftArray.length; i++) {
            var first_view = sortLeftArray[0].guid;
            me.data.category.push({
              name: sortLeftArray[i].typeName,
              sortId: sortLeftArray[i].guid
            })
          }
          me.data.category.unshift({
            name: "全部",
            sortId: ""
          })
          me.setData({
            category: me.data.category,
            toView: first_view
          })
        }
      }
    });
  },
  goStoreRight: function (_pdtType_Id, _word) {
    const me = this;
    app.showLoading();
    //根据左边品类ID获取_右边_数据_API 
    wx.request({
      url: storeStailRight_API,
      data: {
        sellerId: me.data.storeId,
        pdtTypeId: _pdtType_Id,
        keyword: _word
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      success(res) {
        wx.hideToast();
        if (res.data.httpCode == 500) {
          app.showRemindNone(res.data.errorMessage, 2000)
        } else {
          var dataArr = res.data.data.list || '[]';
          if (dataArr.length == 0) {
            me.setData({
              isStoreGoods: false
            })
          } else {
            var _minFeatureArray ;
            dataArr.map(function(goodsPdt){
              goodsPdt.slideImgs = app.globalData.basicFontAPI + goodsPdt.slideImgs.split(",")[0];
              _minFeatureArray = goodsPdt.propList || [] ;
              goodsPdt.price = (goodsPdt.price-0).toFixed(2);
              goodsPdt.saleAmount = (goodsPdt.saleAmount - 0).toFixed(0);
            })
            me.setData({
              cateBoxListArray: dataArr,
              minFeatureArray: _minFeatureArray,
              isStoreGoods: true
            })
          }
        }
      }
    });
  },

  switchTab(e) {
    const me = this;
    var pdtType_Id = e.target.dataset.id;
    this.goStoreRight(pdtType_Id, me.data.input_value);
    this.setData({
      isScroll: true
    })
    setTimeout(function () {
      me.setData({
        toView: e.target.dataset.id,
        curIndex: e.target.dataset.index
      })
    }, 0)
    setTimeout(function () {
      me.setData({
        isScroll: false
      })
    }, 1)
  },
  //店铺内搜索单个商品方法
  searchSingleGoods: function (e) {
    var that = this;
    that.setData({
      input_value: e.detail.value,
    })
    if (e.detail.value == "") {
      that.setData({
        storeInputValue: false
      })
    } else {
      that.setData({
        storeInputValue: true
      })
    }
    var pdtType_Id = this.data.toView;
    that.goStoreRight(pdtType_Id, that.data.input_value);
  },
  //点×清空搜索框
  clearInputValue: function (e) {
    this.setData({
      input_value: "",
      storeInputValue: false
    })
    var pdtType_Id = this.data.toView;
    this.goStoreRight(pdtType_Id, "");
  },
  //navigator店铺里面商品的跳转
  go_storeGoods: function (e) {
    var item = e.currentTarget.dataset.storegooditem,
      _url = "../goodsDetail/goodsDetail?goodsId=" + item;
    wx.navigateTo({
      url: _url,
    });
  },
  //点击购物车数量进入购物车
  goCartListPage: function () {
    var _url = "/pages/shopCart/shopCart";
    wx.switchTab({
      url: _url,
    });
  },
  //点击进入店铺的地图
  goSotreMarkMap: function () {
    var markHeader_Object = this.data.storeHeaderObject;
    var _sellerName = markHeader_Object.sellerName;
    var _markAddress = markHeader_Object.address;
    var _markDistance = (markHeader_Object.distance / 1000).toFixed(1);
    var _lng = markHeader_Object.lng;
    var _lat = markHeader_Object.lat;
    var latitude = Number(_lat);
    var longitude = Number(_lng);
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      name: _sellerName,
      address: _markAddress,
      scale: 28
    })
  }
})
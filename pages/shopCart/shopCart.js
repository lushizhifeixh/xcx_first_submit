//小程序登录获取GPF权限
var limit_API = "http://172.16.1.110:8060//wechat/user/login";
// //用户-购物车列表172.16.2.42:8090
var cartListUrl = 'http://172.16.1.110:8060/v1.0/shoppingcart/list';
//购物车-当前用户购物车商品数量-
var storeCartNumUrl = 'http://172.16.1.110:8060/v1.0/shoppingcart/count';
//删除购物车
var deleteCartUrl = 'http://172.16.1.110:8060/v1.0/shoppingcart/del';
//添加到购物车以及修改数量
var addCartUrl = 'http://172.16.1.110:8060/v1.0/shoppingcart/saveAndUpdate';

//购物车下单的接口
var cartorderUrl = "http://172.16.4.208:8090/v1.0/order/orderInit";
// var cartorderUrl = "http://172.16.1.110:8060/v1.0/order/orderInit";
// app
var app = new getApp();
Page({
  data: {
    isLogin:false,//是否登陆,来判断是否显示页面
    isEdit: true,//编辑
    BasicFontAPI: "",
    minusColor: {}, //减到一定的数,"-"号变灰色
    iscartEmpty: true,//购物车是否为空
    cartGoodsListArr: [],//同一店铺下的商品Arr
    ApiResultMarkArr: [],
    totalPrice: 0,           // 总价，初始为0,
    singleSelectStatus: false, //店铺时候全选,默认全选
    choosedJson: {},   //选中的商品的json
    choosedStore: {},     //选中的商铺
    storeToGoodsMap: {},   //店铺与商品间的映射
    allChoosed: false,// 全选状态，默认全选,
    choosedNum: 0,
    storeInfo: {},   //各店铺信息
    storeGoodsNum: {},
    firstIn: true,
  },
  onLoad: function (options) {
    var that = this;
    
    var _basicFontAPI = app.globalData.basicFontAPI;
    this.setData({
      BasicFontAPI: _basicFontAPI
    });
  },
  onHide(){
    wx.setStorageSync('rebuy', '');
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    that.getCartList();
  },
  //点击店铺名字进入店铺
  forwardCartStore: function (e) {
    var item = e.currentTarget.dataset.storeitem,
      _url = "../lessPage/storeDetail/storeDetail?storeId=" + item;
    wx.navigateTo({
      url: _url,
    });
  },
  //购物车列表方法的封装
  getCartList: function () {
    app.showLoading();
    var that = this;
    var inBind = wx.getStorageSync('inBind');
    if (inBind == 1) return;
    var rebuyflag = false;
    //-----------------------购物车列表请求接口--------------------------
    var appsession = wx.getStorageSync('sessionId');  
    //用户-购物车列表
    wx.request({
      url: cartListUrl,
      header: {
        "content-type": "application/x-www-form-urlencoded",
        'Cookie': 'appsession=' + appsession
      },
      data: {},
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
                            that.getCartList();
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
            isLogin: true
          })
          var _ApiResultMarkArr = res.data.data || [];
          if (_ApiResultMarkArr.length == 0) {
            that.setData({
              iscartEmpty: false
            })
          } else {
            that.setData({
              iscartEmpty: true,
            })
            var mapjson = {};
            var totalCartNum = 0;
            var storeGoodsNum = {};
            var rebuyObj = {};
            var rebuy = wx.getStorageSync('rebuy');
            if (rebuy) {
              rebuyflag = true;
              var stoo = '';
              rebuy = JSON.parse(rebuy);
              _ApiResultMarkArr.map(function (market) {
                market.subList.map(function (seller) {
                  mapjson[seller.sellerId] = [];
                  var totalPrice = 0;
                  seller.cartList.map(function (cart) {
                    if (rebuy.indexOf(cart.guid)>-1){
                      rebuyObj[cart.pdtId] = true;
                      stoo = seller.sellerId;
                    };
                    if (cart.isEffect == false) {
                      totalCartNum++;
                      if (!storeGoodsNum[seller.sellerId]) {
                        storeGoodsNum[seller.sellerId] = 0;
                      };
                      storeGoodsNum[seller.sellerId]++;
                      mapjson[seller.sellerId].push(cart.pdtId);
                      totalPrice += cart.cartNum * cart.price;
                    };
                    //价格保留2位数字
                    cart.price = (cart.price - 0).toFixed(2);
                  });
                  seller['totalPrice'] = totalPrice.toFixed(2);
                  var storeJson = {};
                  console.log(that.ifGoodsAllChoosed(stoo),'------');
                  if (that.ifGoodsAllChoosed(stoo)) {
                    storeJson[stoo] = true;
                  } else {
                    delete storeJson[stoo];
                  };
                  that.setData({
                    choosedJson: rebuyObj,
                    choosedStore: {}, 
                    allChoosed: false,
                    choosedStore: storeJson
                  });
                  
                });
              });
            } else {
              _ApiResultMarkArr.map(function (market) {
                market.subList.map(function (seller) {
                  mapjson[seller.sellerId] = [];
                  var totalPrice = 0;

                  seller.cartList.map(function (cart) {
                    if (cart.isEffect == false) {
                      totalCartNum++;
                      if (!storeGoodsNum[seller.sellerId]) {
                        storeGoodsNum[seller.sellerId] = 0;
                      };
                      storeGoodsNum[seller.sellerId]++;
                      mapjson[seller.sellerId].push(cart.pdtId);
                      totalPrice += cart.cartNum * cart.price;
                    };

                    // //价格保留2位数字
                    cart.price = (cart.price - 0).toFixed(2);
                  });
                  seller['totalPrice'] = totalPrice.toFixed(2);
                });
              });
            }
            
            that.setData({
              totalCartNum,
              storeGoodsNum,
              storeToGoodsMap: mapjson,
              ApiResultMarkArr: _ApiResultMarkArr
            });
            //一进入页面,购物车全选状态
            var fromStore = wx.getStorageSync('fromStore');
            var fromGoods = wx.getStorageSync('fromGoods');
            if ((that.data.firstIn || fromStore == 1 || fromGoods == 1) && !rebuyflag && !rebuy){
              that.cartselectAll();
              wx.setStorageSync('fromStore', '');
              wx.setStorageSync('fromGoods', '');
            };
            that.getTotalPrice();
            that.countGoodsNum();
          };
        }
      }
    });
  },

  /**
   * 统计当前选择商品的数量
   */
  countGoodsNum() {
    var that = this;
    var choosedJson = that.data.choosedJson;
    choosedJson = Object.keys(choosedJson);
    that.setData({
      choosedNum: choosedJson.length
    });
  },




  /**
   * 判断购物车中所有店铺是否全部被选中
   */
  ifMarketAllChoosed() {
    var that = this;
    var obj = that.data.choosedStore;
    var storeToGoodsMap = that.data.storeToGoodsMap;
    var boo = true;
    for (var ele in storeToGoodsMap) {
      if (!obj[ele]) {
        boo = false;
      };
    };
    return boo;
  },

  /**
   * 判断一个店铺中所有商品是否全部被选中
   */
  ifGoodsAllChoosed(storeId) {
    var that = this;
    var arr = that.data.storeToGoodsMap[storeId]||[];
    var goods = that.data.choosedJson;
    for (var i = 0, len = arr.length; i < len; i++) {
      if (!goods[arr[i]]) {
        return false;
      }
    };
    return true;
  },
  /**
   * 选中店铺
   */
  clickStore(e) {
    var that = this;
    var storeId = e.currentTarget.dataset.id;
    var item = e.currentTarget.dataset.item;
    var json = that.data.choosedStore;
    var goodsJson = that.data.choosedJson;
    if (json[storeId]) {
      delete json[storeId];
      item.map(function (ele, i) {
        if (goodsJson[ele.pdtId]) {
          delete goodsJson[ele.pdtId];
        };
      });
      that.setData({
        allChoosed: false
      });
    } else {
      json[storeId] = true;
      item.map(function (ele, i) {
        if (!goodsJson[ele.pdtId] && ele.isEffect==false) {
          goodsJson[ele.pdtId] = true;
        };
      });
    };
    that.setData({
      choosedStore: json,
      choosedJson: goodsJson
    });
    that.getTotalPrice();

    if (that.ifMarketAllChoosed()) {
      that.setData({
        allChoosed: true
      });
    };
    that.countGoodsNum();
  },
  /**
   * 当前商品选中事件cartSingleSelected
   */
  cartSingleSelected(e) {
    var that = this;
    var id = e.currentTarget.dataset.goodsid;
    var sellerId = e.currentTarget.dataset.sellerid;
    var json = that.data.choosedJson;
    if (json[id]) {
      delete json[id];
      that.setData({
        allChoosed: false
      });
    } else {
      json[id] = true;
    };
    that.setData({
      choosedJson: json
    });
    var storeJson = that.data.choosedStore;
    if (that.ifGoodsAllChoosed(sellerId)) {
      storeJson[sellerId] = true;
    } else {
      delete storeJson[sellerId];
    };
    that.setData({
      choosedStore: storeJson
    });
    that.getTotalPrice();
    if (that.ifMarketAllChoosed()) {
      that.setData({
        allChoosed: true
      });
    };
    that.countGoodsNum();
  },
  /**
   * 计算购物车选中商品的总价
   */
  getTotalPrice() {
    var that = this;
    var totalPrice = 0;
    var storeObj = {};
    var list = that.data.ApiResultMarkArr;
    var json = that.data.choosedJson;
    for (var key in json) {
      var cartMap = that.getInfoByGoodsId(key);
      var _obj = list[cartMap['i']].subList[cartMap['j']].cartList[cartMap['k']];
      totalPrice += _obj.cartNum * _obj.price;
      if (!storeObj[list[cartMap['i']].subList[cartMap['j']].sellerId]) {
        storeObj[list[cartMap['i']].subList[cartMap['j']].sellerId] = 0;
      };
      storeObj[list[cartMap['i']].subList[cartMap['j']].sellerId] += _obj.cartNum * _obj.price;
    };
    totalPrice = totalPrice.toFixed(2);
    for (var key in storeObj) {
      storeObj[key] = storeObj[key].toFixed(2);
    };
    that.setData({ totalPrice, storeInfo: storeObj });
  },
  /**
   * 根据商品ID返回市场index和店铺index和购物车index
   */
  getInfoByGoodsId(goodsId) {
    var that = this;
    var list = that.data.ApiResultMarkArr;
    for (var i = 0, len = list.length; i < len; i++) {
      for (var j = 0, lenj = list[i].subList.length; j < lenj; j++) {
        for (var k = 0, lenk = list[i].subList[j].cartList.length; k < lenk; k++) {
          if (list[i].subList[j].cartList[k].pdtId == goodsId) {
            return { i, j, k };
          }
        }
      }
    }
  },
  /**
   * 购物车全选事件
   */
  cartselectAll() {
    var that = this;
    var fromStore = wx.getStorageSync('fromStore');
    var fromGoods = wx.getStorageSync('fromGoods');
    if (that.data.firstIn || fromStore == 1 || fromGoods == 1){
      var boo = true;
      that.setData({
        firstIn: false
      });
    } else {
      var boo = !that.data.allChoosed;
    };
    var storejson = {};
    var goodsjson = {};
    if (boo) {
      var storeToGoodsMap = that.data.storeToGoodsMap;
      for (var key in storeToGoodsMap) {
        if (!!key) {
          storejson[key] = true;
          storeToGoodsMap[key].map(function (ele, i) {
            goodsjson[ele] = true;
          });
        };
      };
    };
    that.setData({
      allChoosed: boo,
      choosedJson: goodsjson,
      choosedStore: storejson
    });
    that.getTotalPrice();
    that.countGoodsNum();
  },
  /**
   * 绑定加数量事件
   */
  cartListaddCount(e) {
    var that = this;
    var id = e.currentTarget.dataset.goodsid;
    var _guid = e.currentTarget.dataset.goodsguid;
    var minus = that.data.minusColor;
    var mininum = e.currentTarget.dataset.mininum;
    var obj = that.getInfoByGoodsId(id);
    var list = that.data.ApiResultMarkArr;
    
    if (!!minus[id]) {
      minus[id] = false;
      that.setData({
        minusColor: minus
      });
    };
    if (list[obj['i']].subList[obj['j']].cartList[obj['k']].cartNum < mininum) {
      list[obj['i']].subList[obj['j']].cartList[obj['k']].cartNum = mininum;
    } else {
      list[obj['i']].subList[obj['j']].cartList[obj['k']].cartNum++;
    };
    that.setData({
      ApiResultMarkArr: list
    });
    //如果该商品为选中状态,则重新计算总价
    if (that.data.choosedJson[id]) {
      that.getTotalPrice();
    };
    var _cartNum = list[obj['i']].subList[obj['j']].cartList[obj['k']].cartNum;
    that.cartNumChange(id, _cartNum, _guid)
  },
  cartNumInput: function (e) {
    var that = this;
    var cartNum = e.detail.value;
    var id = e.currentTarget.dataset.goodsid;
    var _guid = e.currentTarget.dataset.goodsguid;
    var obj = that.getInfoByGoodsId(id);
    var list = that.data.ApiResultMarkArr;
    var _cartNum = list[obj['i']].subList[obj['j']].cartList[obj['k']].cartNum;
    if (list[obj['i']].subList[obj['j']].cartList[obj['k']].packaged == 'TRUE') {
      list[obj['i']].subList[obj['j']].cartList[obj['k']].cartNum = cartNum.replace('.', '');
    } else {
      //保留一位小数
      var floatNum = cartNum.split('.')[1];
      if (!!floatNum) {
        var floatLenth = floatNum.length;
        if (floatLenth > 1) {
          floatNum = floatNum[0];
          list[obj['i']].subList[obj['j']].cartList[obj['k']].cartNum = cartNum.split('.')[0] + '.' + floatNum;
        } else {
          list[obj['i']].subList[obj['j']].cartList[obj['k']].cartNum = cartNum;
        };
      } else {
        list[obj['i']].subList[obj['j']].cartList[obj['k']].cartNum = cartNum;
      };
    };
    that.setData({
      ApiResultMarkArr: list
    });
    //如果该商品为选中状态,则重新计算总价
    if (that.data.choosedJson[id]) {
      that.getTotalPrice();
    };
    
  },
  /**
   * 绑定减数量事件
   */
  cartListminusCount(e) {
    var that = this;
    var id = e.currentTarget.dataset.goodsid;
    var _guid = e.currentTarget.dataset.goodsguid;
    var mininum = e.currentTarget.dataset.mininum;

    var minus = that.data.minusColor;
    var obj = that.getInfoByGoodsId(id);
    var list = that.data.ApiResultMarkArr;
    var _cartNum = list[obj['i']].subList[obj['j']].cartList[obj['k']].cartNum;
    if (_cartNum <= mininum) {
      minus[id] = true;
      that.setData({
        minusColor: minus
      })
      app.showRemindNone("商品数量不得低于起批量", 2000)
      if (_cartNum < mininum) {
        list[obj['i']].subList[obj['j']].cartList[obj['k']].cartNum = mininum;
        that.setData({
          ApiResultMarkArr: list
        });
        //如果该商品为选中状态,则重新计算总价
        if (that.data.choosedJson[id]) {
          that.getTotalPrice();
        };
      }
      return;
    }
    list[obj['i']].subList[obj['j']].cartList[obj['k']].cartNum--;
    that.setData({
      ApiResultMarkArr: list
    });
    //如果该商品为选中状态,则重新计算总价
    if (that.data.choosedJson[id]) {
      that.getTotalPrice();
    };
    _cartNum = list[obj['i']].subList[obj['j']].cartList[obj['k']].cartNum;
    
    that.cartNumChange(id, _cartNum, _guid)
  },
  /**
   * 输入框失焦
   */
  inputBlur(e) {
    var that = this;
    var val = e.detail.value;
    var id = e.currentTarget.dataset.goodsid;
    var _guid = e.currentTarget.dataset.goodsguid;
    var obj = that.getInfoByGoodsId(id);
    var list = that.data.ApiResultMarkArr;
    var mininum = e.currentTarget.dataset.mininum;
    var _cartNum = list[obj['i']].subList[obj['j']].cartList[obj['k']].cartNum;
    if (val < mininum) {
      var minus = that.data.minusColor;
      minus[id] = true;
      list[obj['i']].subList[obj['j']].cartList[obj['k']].cartNum = mininum;
      that.setData({
        ApiResultMarkArr: list,
        minusColor: minus
      });
      app.showRemindNone("商品数量不得低于起批量", 2000)
      //如果该商品为选中状态,则重新计算总价
      if (that.data.choosedJson[id]) {
        that.getTotalPrice();
      };
    };
    _cartNum = list[obj['i']].subList[obj['j']].cartList[obj['k']].cartNum;
   
    that.cartNumChange(id, _cartNum, _guid)
  },
  //编辑
  edit: function () {
    var isEdit = this.data.isEdit;
    isEdit = !isEdit;
    this.setData({
      isEdit
    })
  },
  /**
   * 删除购物车商品
   */
  deleteGoods(e,_guid_) {
    var that = this;
    var appsession = wx.getStorageSync('sessionId');
    var choosedJson = that.data.choosedJson;
    var list = that.data.ApiResultMarkArr;
    var arr = [];
    if (_guid_) {
      arr = arr.push(_guid_).toString();
    } else {
      for (var key in choosedJson) {
        var obj = that.getInfoByGoodsId(key);
        var guid = list[obj['i']].subList[obj['j']].cartList[obj['k']].guid;
        arr.push(guid);
      };
      arr = arr.toString();
    }
    wx.showModal({
      title: '',
      content: '确认要删除商品吗',
      success: function (res) {
        if (res.confirm) {
          //删除购物车
          wx.request({
            url: deleteCartUrl,
            header: {
              "content-type": "application/x-www-form-urlencoded",
              'Cookie': 'appsession=' + appsession
            },
            data: {
              guid: arr
            },
            method: "POST",
            success: function (res) {
              if (res.data.httpCode == 200) {
                that.setData({
                  choosedJson: {},
                  choosedStore: {},
                  allChoosed: false
                });
                that.getCartList();
              } else if (res.data.httpCode == 500) {
                app.showRemindNone(res.data.errorMessage, 2000)
              }
            }
          })
          /////////////////////
        } else if (res.cancel) {
          console.log("用户选择取消")
        }
      }
    })
  },

  //购物车数量的变化调用的接口
  cartNumChange: function (_pdtid, _num, _guid) {
    var that = this;
    var appsession = wx.getStorageSync('sessionId')
    wx.request({
      url: addCartUrl,
      data: {
        pdtid: _pdtid,
        num: _num,
        guid: _guid
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Cookie': 'appsession=' + appsession
      },
      success: function (res) {
        
      }
    })
  },
  //下单,调用接口:
  CartplaceAnOrder: function () {
    var that = this,
        appsession = wx.getStorageSync('sessionId'),
        choosedJson = that.data.choosedJson,
        list = that.data.ApiResultMarkArr,
        arr = [];
    for (var key in choosedJson) {
      var obj = that.getInfoByGoodsId(key);
      var guid = list[obj['i']].subList[obj['j']].cartList[obj['k']].guid;
      arr.push(guid);
    };
    arr = arr.toString();
    if (that.data.choosedNum == 0){
      app.showRemindNone("您还没有选择宝贝哦!", 2000)
    }else{
      wx.request({
        url: cartorderUrl,
        header: {
          "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
          'Cookie': 'appsession=' + appsession
        },
        data: {
          guids: arr
        },
        method: "POST",
        success: function (res) {
          // 购物车中有失效商品
          if (res.data.httpCode == 500) {
            app.showRemindNone(res.data.errorMessage, 2000)
          } else {
            //成功的话就跳转页面
            var cartData = res.data.data;   
            wx.setStorageSync('complete', res.data.data.complete);
            wx.setStorageSync('cartBandData', cartData);
            that.setData({
              choosedJson: {},
              choosedStore: {},
              allChoosed: false
            });
            wx.setStorageSync('goodsNum', that.data.choosedNum);
            wx.navigateTo({
              url: "../lessPage/placeAnOrder/placeAnOrder",
            });
          }
        }
      })
    }
  },
  // 删除失效商品
  delEfficacyGoods:function(e){
    var that = this ;
    var _guid_ = e.currentTarget.dataset.guidid ;
    that.deleteGoods(_guid_);
  },
  //购物车点击商品进入商品的页面
  go_GoodsDetail: function (e) {
    var item = e.currentTarget.dataset.goodsitem,
      _url = "../lessPage/goodsDetail/goodsDetail?goodsId=" + item;
    wx.navigateTo({
      url: _url,
    });
  },
  
})
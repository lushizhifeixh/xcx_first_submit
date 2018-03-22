var goodsRecommend_API = "http://172.16.1.110:8060/v1.0/buyer/init/recommend/product";
var storeRecommend_API = "http://172.16.1.110:8060/v1.0/buyer/init/recommend/seller";
// 商品搜索补全
var goodsComplete_API = "http://172.16.1.110:8060/v1.0/pdttype/pdtTypeSuggest";
// 商户搜索补全
var storeComplet_API = "http://172.16.1.110:8060/v1.0/shopinfo/suggestSellerName";
var app = new getApp();
Page({
  data: {
    setting_id: "left",
    show_goods_list: true,
    winWidth: 0,
    winHeight: 0,
    currentTab: 0,
    completeArray: [],
    isGoodHistory: false,
    isStoreHistory: false,
    hotArray: [],
    goodsHistoryArray: [],
    storeHistoryArray: [],
    input_value: '',
    searchText: ''
  },
  onShow: function () {
    var currentTab = app.globalData.completeCur;
    if (!!currentTab) {
      this.setData({
        currentTab
      });
    };
  },
  redirect_index: function () {
    wx.reLaunch({
      url: '/pages/index/index',
    });
  },
  complementInput: function (_text, _url, result_data) {
    app.showLoading();
    var _text = _text;
    var _url = _url;
    var result_data = result_data;
    var me = this;
    wx.request({
      url: _url,
      data: {
        keywords: _text
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      success: function (res) {
        wx.hideToast();
        me.data.completeArray = [];
        var res_data = res.data.data.list || [];
        for (var i = 0; i < res_data.length; i++) {
          me.data.completeArray.push(res_data[i][result_data]);
        }
        me.setData({
          completeArray: me.data.completeArray
        })
      }
    })
  },
  complementInput_show: function (e) {
    this.setData({
      show_goods_list: false,
      input_value: e.detail.value
    })
    if (e.detail.value == "") {
      this.setData({
        show_goods_list: true
      })
    } else {
      if (this.data.setting_id == "left") {
        this.complementInput(e.detail.value, goodsComplete_API, "typeName")
      } else {
        this.complementInput(e.detail.value, storeComplet_API, "sellerName")
      }
    }
  },
  //清楚商品的所有商品
  clearAllGoods: function () {
    var that = this;
    wx.showModal({
      title: '温馨提示!',
      content: '确认删除商品的全部历史记录',
      success: function (res) {
        if (res.confirm) {
          var arr = that.data.goodsHistoryArray;
          arr = [];
          that.setData({
            goodsHistoryArray: arr,
            isGoodHistory: false
          });
          var arr_str = JSON.stringify(arr);
          wx.setStorageSync('good_history', arr_str);
        } else if (res.cancel) {
          console.log("用户选择取消")
        }
      }
    })
  },
  goToSearchResult(e) {
    var that = this;
    var name = e.currentTarget.dataset.item;
    var arr = that.data.goodsHistoryArray;
    var nameIndex = arr.indexOf(name);
    if (nameIndex == -1) {
      arr.unshift(name);
    } else {
      arr.splice(nameIndex, 1);
      arr.unshift(name);
    };
    if (arr.length > 8) {
      arr.pop();
    }
    var arr_str = JSON.stringify(arr);
    wx.setStorageSync('good_history', arr_str);
    that.setData({
      goodsHistoryArray: arr,
      searchText: name,
      isGoodHistory: true
    });
    var url = "../searchCompResult/searchCompResult?goodValue=" + name;
    this.setData({
      searchText: name
    });
    wx.navigateTo({
      url: url,
    });
  },
  storeResult(e) {
    var that = this;
    var name = e.currentTarget.dataset.item;
    var tab = e.currentTarget.dataset.tab;
    var arr = that.data.storeHistoryArray;
    var nameIndex = arr.indexOf(name);
    if (nameIndex == -1) {
      arr.unshift(name);
    } else {
      arr.splice(nameIndex, 1);
      arr.unshift(name);
    };
    if (arr.length > 10) {
      arr.pop();
    }
    var arr_str = JSON.stringify(arr);
    wx.setStorageSync('store_history', arr_str);
    that.setData({
      storeHistoryArray: arr,
      searchText: name,
      isStoreHistory: true
    });
    var url = "../searchCompResult/searchCompResult?storeValue=" + name + "&tab=" + tab;
    this.setData({
      searchText: name
    });
    wx.navigateTo({
      url: url,
    });
  },
  recommendInput: function (_url, recommend_data) {
    app.showLoading();
    var _url = _url;
    var result_data = result_data;
    var me = this;
    wx.request({
      url: _url,
      data: {

      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      success: function (res) {
        wx.hideToast();
        me.data.hotArray = [];
        var _res_data = res.data.data || [];
        for (var i = 0; i < _res_data.length; i++) {
          me.data.hotArray.push(_res_data[i][recommend_data]);
        }
        me.setData({
          hotArray: me.data.hotArray
        })
      }
    })
  },
  bindChange: function (e) {
    var me = this;
    me.setData({ currentTab: e.detail.current });

  },
  swichNav: function (e) {
    var me = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      if (e.target.dataset.current == 0) {
        this.recommendInput(goodsRecommend_API, "pdtType")
        if (this.data.input_value != "") {
          this.complementInput(this.data.input_value, goodsComplete_API, "typeName")
        }

        this.setData({
          setting_id: "left"
        })
      } else if (e.target.dataset.current == 1) {
        this.recommendInput(storeRecommend_API, "sellerName")
        if (this.data.input_value != "") {
          this.complementInput(this.data.input_value, storeComplet_API, "sellerName")
        }

        this.setData({
          setting_id: "right"
        })
      }
      me.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  //商品历史保存
  goods_history: function (e) {
    var that = this;
    var name = e.currentTarget.dataset.item;
    var arr = that.data.goodsHistoryArray;
    var nameIndex = arr.indexOf(name);
    if (nameIndex == -1) {
      arr.unshift(name);
    } else {
      arr.splice(nameIndex, 1);
      arr.unshift(name);
    };
    if (arr.length > 8) {
      arr.pop();
    }
    var arr_str = JSON.stringify(arr);
    wx.setStorageSync('good_history', arr_str);
    that.setData({
      goodsHistoryArray: arr,
      searchText: name,
      isGoodHistory: true
    });
    wx.navigateTo({
      url: '../searchCompResult/searchCompResult?goodValue=' + name + '&tab=' + that.data.currentTab,
    });
  },
  clearGoodsHistory(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var arr = that.data.goodsHistoryArray;
    arr.splice(index, 1);
    that.setData({
      goodsHistoryArray: arr
    });
    if (that.data.goodsHistoryArray.length == 0) {
      that.setData({
        isGoodHistory: false
      });
    }
    var arr_str = JSON.stringify(arr);
    wx.setStorageSync('good_history', arr_str);

  },
  // 商户点击的保存
  store_history: function (e) {
    var that = this;
    var name = e.currentTarget.dataset.item;
    var arr = that.data.storeHistoryArray;
    var nameIndex = arr.indexOf(name);
    if (nameIndex == -1) {
      arr.unshift(name);
    } else {
      arr.splice(nameIndex, 1);
      arr.unshift(name);
    };
    if (arr.length > 10) {
      arr.pop();
    }
    var arr_str = JSON.stringify(arr);
    wx.setStorageSync('store_history', arr_str);
    that.setData({
      storeHistoryArray: arr,
      searchText: name,
      isStoreHistory: true
    });
    wx.navigateTo({
      url: '../searchCompResult/searchCompResult?storeValue=' + name + '&tab=' + that.data.currentTab,
    });
  },
  //清楚商户的所以保存历史搜索记录
  clearAllStores: function () {
    var that = this;
    wx.showModal({
      title: '温馨提示!',
      content: '确认删除商户的全部历史记录',
      success: function (res) {
        if (res.confirm) {
          var arr = that.data.storeHistoryArray;
          arr = [];
          that.setData({
            storeHistoryArray: arr,
            isStoreHistory: false
          });
          var arr_str = JSON.stringify(arr);
          wx.setStorageSync('store_history', arr_str);
        } else if (res.cancel) {
          console.log("用户选择取消")
        }
      }
    })

  },
  clearstoresHistory(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var arr = that.data.storeHistoryArray;
    arr.splice(index, 1);
    that.setData({
      storeHistoryArray: arr
    });
    if (that.data.storeHistoryArray.length == 0) {
      that.setData({
        isStoreHistory: false
      });
    }
    var arr_str = JSON.stringify(arr);
    wx.setStorageSync('store_history', arr_str);
  },
  // 商品搜索历史的跳转
  skip_goods: function (e) {
    var _names = e.currentTarget.dataset.item;
    this.setData({
      searchText: _names
    });
    wx.navigateTo({
      url: '../searchCompResult/searchCompResult?goodValue=' + _names,
    });
  },
  // 商户搜索历史的跳转
  skip_store: function (e) {
    var that = this;
    var _names = e.currentTarget.dataset.item;
    this.setData({
      searchText: _names
    });
    wx.navigateTo({
      url: '../searchCompResult/searchCompResult?storeValue=' + _names + '&tab=' + that.data.currentTab,
    });
  },
  direct_search: function (e) {
    var that = this;
    if (e.detail.value != "") {
      if (this.data.setting_id == "left") {
        wx.navigateTo({
          url: '../searchCompResult/searchCompResult?goodValue=' + e.detail.value,
        });
      } else {
        wx.navigateTo({
          url: '../searchCompResult/searchCompResult?storeValue=' + e.detail.value + '&tab=' + that.data.currentTab,
        });
      }
    }

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var me = this;
    var currentTab = options.tab;
    var searchText = options.text;
    if (!!currentTab) {
      me.setData({ currentTab });
    };
    if (!!searchText) {
      me.setData({ searchText });
    };
    var goodHistory = wx.getStorageSync('good_history') || '[]';
    if (goodHistory == '[]') {
      me.setData({
        isGoodHistory: false
      })
    } else {
      me.setData({
        isGoodHistory: true
      })
    }
    var storeHistory = wx.getStorageSync('store_history') || '[]';
    if (storeHistory == '[]') {
      me.setData({
        isStoreHistory: false
      })
    } else {
      me.setData({
        isStoreHistory: true
      })
    }
    goodHistory = JSON.parse(goodHistory);
    storeHistory = JSON.parse(storeHistory);
    me.setData({
      goodsHistoryArray: goodHistory,
      storeHistoryArray: storeHistory
    });
    me.recommendInput(goodsRecommend_API, "pdtType")
    wx.getSystemInfo({
      success: function (res) {
        me.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
  },
})
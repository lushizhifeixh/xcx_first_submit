// 搜索结果页-商品-wjd  
var goodSiftArray_API = "http://172.16.1.110:8060/v1.0/product/searchPdt"
// 搜索结果页-商户-wjd 
var storeSiftArray_API = "http://172.16.1.110:8060/v1.0/product/searchSeller"
// 市场-市场搜索接口_全部 -----------------------------------------------------------------
var markAll_API = "http://172.16.1.110:8060/v1.0/market/search";
var app = new getApp();
Page({
  data: {
    goodsMarkName: '筛选市场',
    storeMarkName: '筛选市场' ,
    is_Overflow: "scroll",// 最外层是否可以滚动
    isgoods: true,// 是否搜索的商品有
    isstore: true,// 是否搜索的商户有
    price_sort: "up",
    goodsPriceImg: "../../../images/index/icon/price_up.png",
    goodsSaleColor_volume: "",
    goodsSaleColor_price: "",
    storeSaleColor_volume: "",
    searchText: '',
    isDialogShow: false,
    isDialogShown: false,
    isScroll: true,
    goodSiftArray: [],
    minGoodsiftArray: [],
    singleMarkArray: [],
    winWidth: 0,
    winHeight: 0,
    currentTab: 0,
    storeSelectArray: [],
    minstoresiftArray: [],
    goodMark_inputValue: '',//商品的市场搜索框的值
    good_MarkInputValue: false,//商品搜索框一开始不显示×
    storedMark_inputValue: '', //商户的市场搜索框的值
    store_MarkInputValue: false,//商户搜索框一开始不显示×
    ajaxParams: {// 调取搜索商品结果页接口传入的data值
      keyword: '',
      marketId: '',
      marketSubId: '',
      sortType: 'price',
      sort: 'asc',
      pageNum: '1',
      pageSize: '20'
    },
    animationData: {}
  },
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },
  swichNav: function (e) {
    var that = this;
    wx.showToast({
      title: '加载中...',
      icon: "loading",
      duration: 100
    });
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      });
      app.globalData.completeCur = e.target.dataset.current;
    }
  },
  showDialog: function (e) {
    this.allMarks(this.data.goodMark_inputValue);    
    var currentStatu = e.currentTarget.dataset.statu;
    if (currentStatu == "open") {
      this.setData({
        isDialogShow: true,
        isScroll: false,
        is_Overflow: "hidden"
      });
    };
    if (currentStatu == "close" && e.target.id == "animation") {
      this.setData({
        isDialogShow: false,
        isScroll: true,
        is_Overflow: "scroll"
      });
    };
  },
  showTwoDialog: function (e) {
    //批发市场的全部
    this.allMarks(this.data.storedMark_inputValue);
    var currentStatur = e.currentTarget.dataset.statur;
    if (currentStatur == "on") {
      this.setData({
        isDialogShown: true,
        isScroll: false,
        is_Overflow: "hidden"
      });
    }
    if (currentStatur == "off" && e.target.id == "animations") {
      this.setData({
        isDialogShown: false,
        isScroll: true,
        is_Overflow: "scroll"
      });
    }
  },
  goBackComplete: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  // 点击——————商品的价格—————— ，调用商品函数
  goodsPriceVolume: function (e) {
    var params = this.data.ajaxParams;
    this.setData({
      goodsSaleColor_price: "color: #37C65C;",
      goodsSaleColor_volume: ""
    });
    if (this.data.price_sort == "down") {
      params.sortType = 'price';
      params.sort = 'asc';
      this.setData({
        price_sort: "up",
        goodsPriceImg: "../../../images/index/icon/price_up.png",
        ajaxParams: params
      });
    } else {
      params.sortType = 'price';
      params.sort = 'desc';
      this.setData({
        price_sort: "down",
        goodsPriceImg: "../../../images/index/icon/price_down.png",
        ajaxParams: params
      });
    };
    this.goodsLeft_select();
  },
  // 点击——————商品的销量—————— ，调用商品函数
  goodsSaleVolume: function () {
    var params = this.data.ajaxParams;
    params.sortType = 'saleAmount';
    this.setData({
      goodsSaleColor_volume: "color: #37C65C;",
      goodsSaleColor_price: "",
      ajaxParams: params
    });
    this.goodsLeft_select();

  },
  // 点击——————商户——————的销量 ，调用商品函数
  storeSaleVolume: function () {
    this.setData({
      storeSaleColor_volume: "color: #37C65C;",
    });
    this.storesRight_select(this.data.searchText, "", "saleAmount", "desc", 1, 20)
  },
  // 点击——————商品的筛选市场—————— 调用商品函数
  goodsMarkSelectVolume: function (e) {
    // debugger
    var mark_id = e.currentTarget.dataset.markid;
    var mark_name = e.currentTarget.dataset.marketname
    var params = this.data.ajaxParams;
    params.marketId = mark_id;
    // console.log(mark_id)
    this.setData({
      ajaxParams: params,
      isDialogShow: false,
      isScroll: true,
      is_Overflow: "scroll"
    });
    this.goodsLeft_select();
    this.setData({
      goodsMarkName: mark_name      
    })
  },
  //点击商品市场的全部
  all_goodsMarkSelect: function () {
    var params = this.data.ajaxParams;
    params.marketId = "";
    this.setData({
      ajaxParams: params,
      isDialogShow: false,
      isScroll: true,
      is_Overflow: "scroll"
    });
    this.goodsLeft_select();
    this.setData({
      goodsMarkName: "全部市场"
    })
  },
  //商品的市场搜索方法
  goodsMarktInput_show: function (e) {
    this.setData({
      goodMark_inputValue: e.detail.value,
      good_MarkInputValue:true
    })
    if (e.detail.value == "") {
      this.setData({
        good_MarkInputValue:false
      })
    }
    this.allMarks(this.data.goodMark_inputValue);
  },
  //点×清空商品的市场搜索框
  clearInputGoodsValue: function (e) {
    this.setData({
      goodMark_inputValue: "",
      good_MarkInputValue:false
    })
    this.allMarks("");
  },
  //商户的市场搜索方法
  storesMarktInput_show: function (e) {
    this.setData({
      storedMark_inputValue: e.detail.value,
      store_MarkInputValue: true
    })
    if (e.detail.value == "") {
      this.setData({
        store_MarkInputValue: false
      })
    }
    this.allMarks(this.data.storedMark_inputValue);
  },
  //点×清空商户的市场搜索框
  clearInputstoreValue: function (e) {
    this.setData({
      storedMark_inputValue: "",
      store_MarkInputValue: false
    })
    this.allMarks("");
  },
  // 点击——————商户的筛选市场—————— 调用商户函数
  storeMarkSelectVolume: function (e) {
    app.showLoading();
    var mark_id = e.currentTarget.dataset.markid;
    this.setData({
      // storeParams: params,
      isDialogShown: false,
      isScroll: true,
      is_Overflow: "scroll"
    });
    this.storesRight_select(this.data.searchText, mark_id, "saleAmount", "desc", 1, 20)
    var mark_name = e.currentTarget.dataset.marketname
    this.setData({
      storeMarkName: mark_name
    })
  },
  //点击商户市场的全部
  all_storeMarkSelect: function () {
    this.setData({
      isDialogShown: false,
      isScroll: true,
      is_Overflow: "scroll"
    });
    this.storesRight_select(this.data.searchText, "", "saleAmount", "desc", 1, 20)
    this.setData({
      storeMarkName: '全部市场'
    })
  },
  onLoad: function (params) {
    // 是否固定到商户
    var currentTab = params.tab;
    if (!!currentTab) {
      this.setData({
        currentTab
      });
    };
    var me = this;
    var good_words = params.goodValue;
    if (!!good_words) {
      me.setData({
        searchText: good_words
      });
    };
    var store_words = params.storeValue;
    if (!!store_words) {
      me.setData({
        searchText: store_words
      });
    };
    wx.getSystemInfo({
      success: function (res) {
        me.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    // 初始调用____商品____的搜索结果页面
    this.goodsLeft_select();
    // 初始调用____商户____的搜索结果页面
    this.storesRight_select(this.data.searchText, "", "saleAmount", "asc", 1, 20)
    
  },

  /**
   *左边 商品的方法封装goodsLeft_select()
   */
  goodsLeft_select: function () {
    app.showLoading();
    var me = this;
    var params = me.data.ajaxParams;
    params.keyword = this.data.searchText;
    wx.request({
      url: goodSiftArray_API,
      method: "POST",
      data: params,
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      success: function (res) {
        wx.hideToast();
        if (res.data.data.total == 0) {
          me.setData({
            isgoods: false
          })
        } else {
          me.setData({
            isgoods: true
          })
        }
        var goodsArry = res.data.data.list || [];
        for (var i = 0; i < goodsArry.length; i++) {
          me.data.minGoodsiftArray = goodsArry[i].otherPropList
          goodsArry[i].gpf_product_slideimgs = app.globalData.basicFontAPI + res.data.data.list[i].gpf_product_slideimgs.split(",")[0];
          goodsArry[i].gpf_product_price = (goodsArry[i].gpf_product_price-0).toFixed(2);
        }
        me.setData({
          goodSiftArray: goodsArry,
          minGoodsiftArray: me.data.minGoodsiftArray
        })
      }
    });
  },
  /**
   *右边 商户的方法封装  storesRight_select(_keyWord, _marketId, _sortType, _sort, _pageNum, _pageSize)
   */
  storesRight_select: function (_keyWord, _marketId, _sortType, _sort, _pageNum, _pageSize) {
    var me = this;
    app.showLoading();
    wx.request({
      url: storeSiftArray_API,
      method: "POST",
      data: {
        keyword: _keyWord,
        marketId: _marketId,
        sortType: _sortType,
        sort: _sort,
        pageNum: _pageNum,
        pageSize: _pageSize
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      success: function (res) {
        wx.hideToast();
        if (!res.data.data.total) {
          me.setData({
            isstore: false
          })
        } else {
          me.setData({
            isstore: true
          })
        }
        var storeArray = res.data.data.list || [];
        var minstoreArray = me.data.minstoresiftArray || [];
        for (var i = 0; i < storeArray.length; i++) {
          minstoreArray = res.data.data.list[i].products
          storeArray[i].shopPics = app.globalData.basicFontAPI + storeArray[i].shopPics.split(",")[0];
        }
        for (var i = 0; i < minstoreArray.length; i++) {
          var imgs = minstoreArray[i].imgs;
          var img = imgs.split(",")[0];
          minstoreArray[i].imgs = app.globalData.basicFontAPI + img;
          minstoreArray[i].price = (minstoreArray[i].price-0).toFixed(2);
        }
        me.setData({
          storeSelectArray: storeArray,
          minstoresiftArray: minstoreArray
        })
      }
    })
  },
  // 调用附近的全部市场方法
  allMarks: function (_keyword) {
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
            wx.hideToast();
            var markAllArr = res.data.data.list || [];
            for (var i = 0; i < markAllArr.length; i++) {
              var num = markAllArr[i].distance / 1000;
              markAllArr[i].distance = num.toFixed(1);
            }
            that.setData({
              singleMarkArray: markAllArr
            })
          }
        })
      }
    })
  },
  //商品的弹框的市场当前位置刷新
  goodsMarkRefresh : function(){
    
    this.allMarks(this.data.goodMark_inputValue);
  },
  storeMarkRefresh : function(){
    
    this.allMarks(this.data.storedMark_inputValue);
  },
  //商品的跳转
  goStoreGoods: function (e) {
    var item = e.currentTarget.dataset.storegoodsitem,
      _url = "../goodsDetail/goodsDetail?goodsId=" + item;
    wx.navigateTo({
      url: _url,
    });
  },
  //店铺的跳转
  goToStore: function (e) {
    var item = e.currentTarget.dataset.storeitem,
      _url = "../storeDetail/storeDetail?storeId=" + item;
    wx.navigateTo({
      url: _url,
    });
  },
})



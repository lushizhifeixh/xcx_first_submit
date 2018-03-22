// 市场上边的分类
var markTop_API = "http://172.16.1.110:8060/v1.0/market/mInfo";
// 搜索结果页-商品-wjd  
var goodSiftArray_API = "http://172.16.1.110:8060/v1.0/product/searchPdt";
var app = new getApp();
Page({
  data: {
    markDetailInputValue: false,//输入框没值的时候×不显示
    input_value: '',//市场搜索框的值
    markHeader_Object: {},//市场的头部的消息
    isgoods: true,// 是否搜索的商品有
    price_sort: "up",
    goodsPriceImg: "../../../images/index/icon/price_up.png",
    goodsSaleColor_volume: "",
    goodsSaleColor_price: "",
    goodSiftArray: [],
    minGoodsiftArray: [],
    winHeight: '',
    category: [],
    curIndex: 0,
    storeId: "",
    markId : '',
    goodsParams: {
      keyword: '',
      marketId: '',
      marketSubId: '',
      sortType: 'price',
      sort: 'asc',
      pageNum: '1',
      pageSize: '3'
    },
    ajaxFlag: true,    //控制到底加载更多的标示量
    nomoredata: false,
  },
  //点击进入市场的地图
  goMarkMap: function () {
    var markHeader_Object = this.data.markHeader_Object;
    var _markName = markHeader_Object.marketName;
    var _markAddress = markHeader_Object.address;
    var _markDistance = (markHeader_Object.distance / 1000).toFixed(1);
    var _lng = markHeader_Object.lng;
    var _lat = markHeader_Object.lat;
    var latitude = Number(_lat);
    var longitude = Number(_lng);
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      name: _markName,
      address: _markAddress,
      scale: 28
    })
  },
  onLoad(options) {
    var me = this;
    // 初始调用____商品____的搜索结果页面
    var markId = options.markId;
    me.setData({
      markId: markId
    })
    var params = me.data.goodsParams;
    params.marketId = markId; 
    params.keyword= me.data.input_value;
    me.setData({
      params: params
    })
    me.goodsLeft_select();
    wx.getSystemInfo({
      success: function (res) {
        me.setData({
          winHeight: res.windowHeight
        });
      }
    });
    // 市场中商品的分类调用
    me.markTopList();
  },
  // 市场中商品的分类tab
  markTopList:function(){
    var me = this ;
    wx.request({
      url: markTop_API,
      data: {
        guid: me.data.markId,
        lat: app.globalData.wd,
        lng: app.globalData.jd
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      success(res) { 
        var header_message = res.data.data.marketInfo ;
        var sortLeftArray = res.data.data.mSubList || [];
        for (var i = 0; i < sortLeftArray.length; i++) {
          var first_view = sortLeftArray[0].guid;
          me.data.category.push({
            name: sortLeftArray[i].subareaname,
            sortId: sortLeftArray[i].guid
          })
        }
        me.data.category.unshift({
          name: "全部",
          sortId: ""
        })
        me.setData({
          category: me.data.category,
          toView: first_view,
          markHeader_Object: header_message
        })
      }
    });
  },
  
  // 点击——————商品的价格—————— ，调用商品函数
  goodsPriceVolume: function (e) {
    var params =this.data.goodsParams;
    params.pageNum = 1;
    params.sortType = 'price';
    this.setData({
      goodsSaleColor_price: "color: #37C65C;",
      goodsSaleColor_volume: "",
      params :params
    });
    if (this.data.price_sort == "down") {
      params.sort = 'asc';
      this.setData({
        price_sort: "up",
        goodsPriceImg: "../../../images/index/icon/price_up.png",
      });
    } else {
      params.sort = 'desc';
      this.setData({
        price_sort: "down",
        goodsPriceImg: "../../../images/index/icon/price_down.png",
      });
    };
    this.setData({
      params: params
    });
    this.goodsLeft_select();
  },
  // 点击商品的销量—调用商品函数
  goodsSaleVolume: function () {
    var params = this.data.goodsParams;
    params.pageNum = 1;
    params.sortType = 'saleAmount'; 
    this.setData({
      goodsSaleColor_volume: "color: #37C65C;",
      goodsSaleColor_price: "",
      params: params
    });
    this.goodsLeft_select();
  },
  
  switchTab(e) {
    //切换显示加载中....
    var me = this;
    var pdtType_Id = e.target.dataset.id;
    var params = me.data.goodsParams;
    params.pageNum =1 ;
    params.marketSubId = pdtType_Id;
    params.keyword = me.data.input_value ;
    me.setData({
      params: params
    })
    me.goodsLeft_select();  
    setTimeout(function () {
      me.setData({
        toView: e.target.dataset.id,
        curIndex: e.target.dataset.index
      })
    }, 0)
  }, 
  //市场内搜索单个商品方法
  searchSingleGoods: function (e) {
    var that = this;
    that.setData({
      input_value: e.detail.value
    }) 
    if (e.detail.value == ""){
      that.setData({
        markDetailInputValue: false
      })
    }else{
      that.setData({
        markDetailInputValue: true
      })
    }
    var params = that.data.goodsParams;
    params.keyword = that.data.input_value;
    that.setData({
      params: params
    })  
    that.goodsLeft_select();  
  },
  //点×清空搜索框
  clearInputValue: function (e) {
    this.setData({
      input_value: "",
      markDetailInputValue: false
    })
    var params = this.data.goodsParams;
    params.keyword = "";
    this.setData({
      params: params
    }) 
    this.goodsLeft_select();
  },
  //navigator市场中的商品点击跳转
  go_MarkGoods: function(e){
    var item = e.currentTarget.dataset.marksgooditem,
      _url = "../goodsDetail/goodsDetail?goodsId=" + item;
    wx.navigateTo({
      url: _url,
    });
  },
  //商品的方法封装goodsLeft_select()
  goodsLeft_select: function () {
    app.showLoading();
    var me = this;
    var params = me.data.goodsParams;
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
            isgoods: false,
            nomoredata:false,
          })
        } else {
          me.setData({
            isgoods: true,
            
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
  //到底加载更多
  loadMoreData(e) {
    if (!this.data.ajaxFlag) return;
    app.showLoading();
    var me = this;
    var params = me.data.goodsParams;
    params['pageNum']++;
    me.setData({
      ajaxFlag: false
    });
    wx.request({
      url: goodSiftArray_API,
      method: "POST",
      data: params,
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      success: function (res) {
        wx.hideToast();
        var goodsArry = res.data.data.list || [];
        for (var i = 0; i < goodsArry.length; i++) {
          me.data.minGoodsiftArray = goodsArry[i].otherPropList
          goodsArry[i].gpf_product_slideimgs = app.globalData.basicFontAPI + res.data.data.list[i].gpf_product_slideimgs.split(",")[0];
          goodsArry[i].gpf_product_price = (goodsArry[i].gpf_product_price - 0).toFixed(2);
        };
        //拼接数据
        var arr = me.data.goodSiftArray.concat(goodsArry);
        me.setData({
          goodSiftArray: arr,
          ajaxFlag: true,
          minGoodsiftArray: me.data.minGoodsiftArray
        });
        debugger
        if (goodsArry.length < me.data.goodsParams.pageSize) {
          me.setData({
            ajaxFlag: false,
            nomoredata: true
          });
        };
      }
    });
  },
})
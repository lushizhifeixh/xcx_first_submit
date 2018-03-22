var app = new getApp();
// 首页的---banner----接口
var banner_API = "http://172.16.1.110:8060/v1.0/index/banners";
// 买家首页推荐--市场，商户，商品-wjd
var recomand_API = "http://172.16.1.110:8060/v1.0/buyer/init/recommend/markertAndPdtAndSeller";
Page({
  data: {
    // 是否首页有推荐---市场--商户---商品
    isMarketList: true,
    isStore: true,
    isGoods: true,
    bannerImgUrls: [],
    marklistArray: [],
    pdtListArray: [],
    sellerListArray: [],
    minPdtsListArray: [],
    banlistArray: [
      { imgsUrls: "../../images/index/bannerList/banner_li_list.png", texts: "常购菜单" },
      { imgsUrls: "../../images/index/bannerList/banner_li_warn.png", texts: "通知提货" },
      { imgsUrls: "../../images/index/bannerList/banner_li_price.png", texts: "价格行情" },
      { imgsUrls: "../../images/index/bannerList/banner_li_collect.png", texts: "收藏商户" },
      { imgsUrls: "../../images/index/bannerList/banner_li_car.png", texts: "车辆信息" },
      { imgsUrls: "../../images/index/bannerList/banner_li_compari.png", texts: "比价" },
      { imgsUrls: "../../images/index/bannerList/banner_li_footprint.png", texts: "足迹" }
    ],
    isLayerShow: true //朦层
  },
  //点击知道了朦层消息
  knowCalcLayer:function(){
    this.setData({
      isLayerShow : false
    })
  },
  //onshow 每次页面显示都会加载..........
  onShow: function () {
    wx.setStorageSync('inBind', '');
    var me = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        wx.request({
          url: recomand_API,
          data: {
            lat: latitude,
            lng: longitude
          },
          method: "POST",
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            if (res.data.httpCode == 500) {
              app.showRemindNone(res.data.errorMessage, 2000)
              me.setData({
                isMarketList: false,
                isStore: false,
                isGoods: false,
              })
            } else {
              wx.hideToast();
              // -------------------------附近的市场---------------------------------
              var markDatas = res.data.data.marketList || [];
              if (markDatas.length == 0) {
                me.setData({
                  isMarketList: false
                })
              } else {
                for (var i = 0; i < markDatas.length; i++) {
                  var num = markDatas[i].distance / 1000;
                  markDatas[i].distance = num.toFixed(1);
                  markDatas[i].logo = app.globalData.basicFontAPI + markDatas[i].logo
                }
                me.setData({
                  marklistArray: markDatas,
                  isMarketList: true,
                })
              }
              // ----------------------------为你推荐----------------------------------
              var pdtDatas = res.data.data.pdtList || [];
              if (pdtDatas.length == 0) {
                me.setData({
                  isGoods: false
                })
              } else {
                for (var i = 0; i < pdtDatas.length; i++) {
                  var pdtprices = pdtDatas[i].pdtPrice ;
                  var pdtImg = pdtDatas[i].pdtImgs.split(",")[0]
                  pdtDatas[i].pdtImgs = app.globalData.basicFontAPI + pdtImg;
                  pdtDatas[i].pdtPrice = pdtprices.toFixed(2);
                }
                me.setData({
                  pdtListArray: pdtDatas,
                  isGoods: true
                })
              }
              // ------------------优质商户---------------------------------
              var sellerDatas = res.data.data.sellerList || [];
              if (sellerDatas.length == 0) {
                me.setData({
                  isStore: false
                })
              } else {
                for (var i = 0; i < sellerDatas.length; i++) {
                  var picImg = res.data.data.sellerList[i].picstr.split(",")[0];
                  sellerDatas[i].picstr = app.globalData.basicFontAPI + picImg;
                  var minPdtsDatas = sellerDatas[i].pdts;
                  for (var j = 0; j < minPdtsDatas.length; j++) {
                    var sellerpdtPrice = minPdtsDatas[j].price ;
                    var imgs = minPdtsDatas[j].slideimgs;
                    var img = imgs.split(",")[0];//price
                    minPdtsDatas[j].slideimgs = app.globalData.basicFontAPI + img;
                    minPdtsDatas[j].price = sellerpdtPrice.toFixed(2);
                  }
                }
                me.setData({
                  sellerListArray: sellerDatas,
                  minPdtsListArray: minPdtsDatas,
                  isStore: true
                })
              }
            }
          }
        })
      }
    })
  },
  onLoad: function () {
    var me = this;
    app.showLoading();
    // 首页-banner图片--接口的调用----------------------------------
    wx.request({
      url: banner_API,
      data: {},
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var bannerArr = [];
        var res = res.data.data || [];
        var host = app.globalData.basicFontAPI;
        res.map(function (ele) {
          ele.image = host + ele.image;
          bannerArr.push(ele);
        });
        me.setData({
          bannerImgUrls: bannerArr
        })
      }
    })
  },
  // 跳转到相应的页面
  goBannerPage: function (e) {
    var item = e.currentTarget.dataset.item;
    if (item.type == "BANNER_H5") {
      wx.navigateTo({
        url: '/pages/h5Page/h5Page?h5Url=' + item.title
      })
    } else if (item.type == "BANNER_MARKET"){
      wx.navigateTo({
        url: "../lessPage/marketDetail/marketDetail?markId=" + item.title
      });
    } else if (item.type == "BANNER_SELLER"){
      wx.navigateTo({
        url: "../lessPage/storeDetail/storeDetail?storeId=" + item.title
      });
    } else if (item.type == "BANNER_PDT"){
      // debugger
      wx.navigateTo({
        url: "../lessPage/goodsDetail/goodsDetail?goodsId=" + item.title
      });
    }
  },
  // --搜索navigator跳转到searchComplete --
  go_completPage: function () {
    var _url = "../lessPage/searchComplete/searchComplete"
    wx.navigateTo({
      url: _url,
    });
  },
  //更多跳转到更多的市场nearby_market
  go_nearby_market: function () {
    var _url = "../nearby_market/nearby_market"
    wx.navigateTo({
      url: _url,
    });
  },
  // 首页推荐市场的跳转
  go_nearyMark: function (e) {
    var item = e.currentTarget.dataset.markitem,
      _url = "../lessPage/marketDetail/marketDetail?markId=" + item;
    wx.navigateTo({
      url: _url,
    });
  },
  //首页为你推荐商品的跳转
  go_remmonGoods: function (e) {
    var item = e.currentTarget.dataset.goodsitem,
      _url = "../lessPage/goodsDetail/goodsDetail?goodsId=" + item;
    wx.navigateTo({
      url: _url,
    });
  },
  //首页推荐店铺的跳转
  go_recomendStore: function (e) {
    var item = e.currentTarget.dataset.storeitem,
      _url = "../lessPage/storeDetail/storeDetail?storeId=" + item;
    wx.navigateTo({
      url: _url,
    });
  },
  //首页推荐店铺下面的商品的跳转
  go_recomendStoreGoods: function (e) {
    var item = e.currentTarget.dataset.storegoodsitem,
      _url = "../lessPage/goodsDetail/goodsDetail?goodsId=" + item;
    wx.navigateTo({
      url: _url,
    });
  },
})


var common = require('../../utils/common.js');
var app = new getApp();
Page({
  data: {
    typeNum: '1',//顶部切换属性值
    listChoose: true,//列表选中
    listChooseShow: false,//列表选中框是否显示
    editText: '编辑',
    wxHiden: false,
    saleListShow: true,//出售列表显示
    leaseListShow: false,//出租列表显示
    agentListShow: false,//经纪人列表
    editBtnComplete: '0',//编辑按钮显示勾勾图标
    footShow: false,//底部显示
    nodataShow: false,//没有数据显示
    allChooseIcon: true,//底部全选icon
    collectListUrl: '/WxApp/Index/collectListForWxapp.html',//收藏列表接口
    deleteFunUrl: '/WxApp/Index/delCollectionHouse',//删除
    deleteBrokerUrl: '/WxApp/Index/delFavBroker',
    page: 1,
    uid: [],
    openid: null,
    collectionSale: [],
    collectionLease: [],
    collectionBroker: [],
    uids: [],
    allUidarr: [],
    selectAll: false,
    currentType: 'sale',
    editBtnShow: true,//编辑按钮显示
    nodataText: '您还没有收藏二手房哦！',
    nodataShowSale: false,
    nodataShowLease: false,
    nodataShowAgent: false
  },
  onLoad: function (options) {//页面加载
    app.WeToast();
    var that = this;
    wx.getStorage({
      key: 'openid',
      success: function (e) {
        app.globalData.openid = e.data;
        if (!!e.data) {
          that.setData({
            openid: e.data
          })
        }
      },
      fail: function (fail) {
        app.getOpenId();
      }
    })
  },
  onShareAppMessage: function () {
    return {
      title: app.globalData.compInfo.FCompName,
      path: app.globalData.sharePublicUrl,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  /**
   * 顶部切换
   */
  headSwitch: function (e) {
    var type = e.currentTarget.dataset.type;
    this.collectList(type);

  },
  // 列表是否选中
  listChooseTap: function (e) {
    var index = e.currentTarget.dataset.index;
    var select = e.currentTarget.dataset.select;
    var oldStatus = e.currentTarget.dataset.listSelect;
    var listObj = {};
    listObj[oldStatus] = select == true ? false : true;
    this.setData(listObj);
  },
  // 编辑
  editTap: function (e) {
    var editBtnComplete = this.data.editBtnComplete;
    if (editBtnComplete != 0) {
      this.setData({
        editBtnComplete: 0,
        editText: '编辑',
        footShow: !this.data.footShow
      })
    } else {
      this.setData({
        editBtnComplete: 1,
        editText: '完成',
        footShow: !this.data.footShow
      })
    };
    this.setData({
      listChooseShow: !this.data.listChooseShow,
    })
  },
  // 全选
  allChooseTap: function (e) {
    if (this.data.currentType == 'sale') {
      var collectData = this.data.collectionSale;
      if (this.data.allChooseIcon) {
        for (var i = 0, l = collectData.length; i < l; i++) {
          collectData[i].select = true;
        }
      } else {
        for (var i = 0, l = collectData.length; i < l; i++) {
          collectData[i].select = false;
        }
      }
      this.setData({
        collectionSale: collectData,
        allChooseIcon: !this.data.allChooseIcon,
      })
    } else if (this.data.currentType == 'lease') {
      var collectData = this.data.collectionLease;
      if (this.data.allChooseIcon) {
        for (var i = 0, l = collectData.length; i < l; i++) {
          collectData[i].select = true;
        }
      } else {
        for (var i = 0, l = collectData.length; i < l; i++) {
          collectData[i].select = false;
        }
      }
      this.setData({
        collectionLease: collectData,
        allChooseIcon: !this.data.allChooseIcon,
      })
    } else if (this.data.currentType == 'agent') {
      var collectData = this.data.collectionBroker;
      if (this.data.allChooseIcon) {
        for (var i = 0, l = collectData.length; i < l; i++) {
          collectData[i].select = true;
        }
      } else {
        for (var i = 0, l = collectData.length; i < l; i++) {
          collectData[i].select = false;
        }
      }
      this.setData({
        collectionBroker: collectData,
        allChooseIcon: !this.data.allChooseIcon,
      })
    }

  },
  deleteEvent: function () {
    var _this = this;
    if (_this.data.currentType == 'sale') {
      var collectData = _this.data.collectionSale,
        caseIdsArr = [],
        caseIds = '';
      console.log(collectData)
      for (var i = 0; i < collectData.length; i++) {
        if (collectData[i].select == true) {
          caseIdsArr.push(collectData[i].CASE_ID)
        }
      }
      caseIds = caseIdsArr.join(',');
      if (!caseIds) {
        _this.wetoast.toast({
          title: '请选择删除条件',
          duration: 500
        })
        return;
      }
      wx.request({
        url: app.globalData.online + _this.data.deleteFunUrl + '?' + 'cityId=' + app.globalData.cityId,
        data: {
          openId: _this.data.openid,
          caseType: 1,
          caseIds: caseIds
        },
        success: function (res) {
          console.log(res)
          if (res.data.status == 1) {
            _this.wetoast.toast({
              title: '删除成功',
              duration: 500
            })
          } else {
            _this.wetoast.toast({
              title: '删除失败',
              duration: 500
            })
          }
        }
      })
      this.collectList('sale', true);
    } else if (this.data.currentType == 'lease') {
      var _this = this;
      var collectData = _this.data.collectionLease,
        caseIdsArr = [],
        caseIds = '';
      for (var i = 0; i < collectData.length; i++) {
        if (collectData[i].select == true) {
          caseIdsArr.push(collectData[i].CASE_ID)
        }
      }
      caseIds = caseIdsArr.join(',');
      if (!caseIds) {
        _this.wetoast.toast({
          title: '请选择删除条件',
          duration: 500
        })
        return;
      }
      wx.request({
        url: app.globalData.online + _this.data.deleteFunUrl + '?' + 'cityId=' + app.globalData.cityId,
        data: {
          openId: _this.data.openid,
          caseType: 2,
          caseIds: caseIds
        },
        success: function (res) {
          if (res.data.status == 1) {
            _this.wetoast.toast({
              title: '删除成功',
              duration: 500
            })
          } else {
            _this.wetoast.toast({
              title: '删除失败',
              duration: 500
            })
          }
        }
      })
      this.collectList('lease', true);
    } else if (this.data.currentType == 'agent') {
      var _this = this;
      var collectData = _this.data.collectionBroker,
        archiveArr = [],
        archive_ids = '';
      for (var i = 0; i < collectData.length; i++) {
        if (collectData[i].select == true) {
          archiveArr.push(collectData[i].ARCHIVE_ID)
        }
      }
      archive_ids = archiveArr.join(',');
      if (!archive_ids) {
        _this.wetoast.toast({
          title: '请选择删除条件',
          duration: 500
        })
        return;
      }
      wx.request({
        url: app.globalData.online + _this.data.deleteBrokerUrl,
        data: {
          openId: _this.data.openid,
          archive_ids: archive_ids
        },
        success: function (res) {
          if (res.data.status == 1) {
            _this.wetoast.toast({
              title: '删除成功',
              duration: 500
            })

          } else {
            _this.wetoast.toast({
              title: '删除失败',
              duration: 500
            })
          }
        }
      })
      this.collectList('3');
    }
  },
  onReady: function () {
    // 页面渲染完成
    this.collectList('sale');
  },

  /**
   * 请求完收藏数据后判断是否 展示 no-data 提示
   */
  checkNoDataInfo: function (type) {
    //判断是否展示 nodata 提示
    if (type == 'sale') {
      if (this.data.collectionSale.length == 0) {
        this.setData({
          editBtnShow: true,
          nodataShowSale: true,
          nodataShowLease: false,
          nodataShowAgent: false,
          nodataText: '您还没有收藏商品哦！'
        })
      } else {
        this.setData({
          nodataShowLease: false,
          nodataShowAgent: false,
          nodataShowSale: false,
        })
      }
      this.setData({
        typeNum: '1',
        saleListShow: true,
        leaseListShow: false,
        agentListShow: false,
        uids: [],
        currentType: 'sale',
        footShow: false,
        listChooseShow: false,
        editBtnComplete: 0,
        editText: '编辑',
        allChooseIcon: true
      });
    } else if (type == 'lease') {
      if (this.data.collectionLease.length == 0) {
        this.setData({
          editBtnShow: true,
          nodataShowLease: true,
          nodataShowAgent: false,
          nodataShowSale: false,
          nodataText: '您还没有收藏商户哦！'
        })
      } else {
        this.setData({
          nodataShowLease: false,
          nodataShowAgent: false,
          nodataShowSale: false,
        })
      }
      this.setData({
        typeNum: '2',
        saleListShow: false,
        leaseListShow: true,
        agentListShow: false,
        uids: [],
        currentType: 'lease',
        footShow: false,
        listChooseShow: false,
        editBtnComplete: 0,
        editText: '编辑',
        allChooseIcon: true
      });
    } 

  },

  /***
   * caseType
   * refreshFlag : 是否刷新缓存 true: 是
   * **/
  collectList: function (caseType, refreshFlag) {
    var that = this;
    var url = app.globalData.online + this.data.collectListUrl;
    var params = {
      caseType: caseType == 'sale' ? '1' : caseType == 'lease' ? '2' : '3',
      page: this.data.page,
      openId: app.globalData.openid,
      cityId: app.globalData.cityId
    };
    try {
      var key = "collection" + caseType;
      var value = wx.getStorageSync(key);
      console.log(value);
      if (!!value && !refreshFlag) {
        if (caseType == 'sale') {
          that.setData({
            collectionSale: value,
            nodataShowSale: false
          })

        } else if (caseType == 'lease') {
          that.setData({
            collectionLease: value,
            nodataShowLease: false
          })
        } else {
          that.setData({
            collectionBroker: value,
            nodataShowAgent: false
          })
        }
      } else {
        common.getList(url, params).then(res => {
          //console.log(res);
          if (caseType == 'sale') {
            that.setData({
              collectionSale: res,
              nodataShowSale: false
            })
            if (res.length > 0) {
              wx.setStorageSync('collectionsale', res.data);
            } else {
              that.setData({
                nodataShowLease: true
              })
            }
          } else if (caseType == 'lease') {
            that.setData({
              collectionLease: res,
              nodataShowLease: false
            })
            if (res.length > 0) {
              wx.setStorageSync('collectionlease', res.data);
            } else {
              that.setData({
                nodataShowLease: true
              })
            }
          } else {
            if (res.length > 0) {
              res.map(function (ele, i) {
                if (ele.USER_PHOTO == '') {
                  ele.USER_PHOTO = 'http://weidian.51vfang.com/Public/web/default/images/default_avatar_2.png'
                } else {
                  ele.USER_PHOTO = 'http://img.vfanghui.com/pic/' + ele.USER_PHOTO
                }
                return res;
              })
              console.log(res)
              that.setData({
                collectionBroker: res,
                nodataShowAgent: false
              })
              if (res.length > 0) {
                wx.setStorageSync('collectionagent', res.data);
              } else {
                that.setData({
                  nodataShowLease: true
                })
              }

            }

          }
        })
      }
      //请求完数据后判断显示no-data 提示
      setTimeout(function () {
        that.checkNoDataInfo(caseType);
      }, 300);

    } catch (e) {
    }

  },
  // errImg: function (ev) {
  //   //需要访问当前页面的数据对象传递到其它页面上
  //   var type = ev.target.dataset.type;
  //   var _that = this;
  //   common.errImgFun(ev, _that, type);
  // },
  calling: function (e) {
    common.calling(e);
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  goIndex: function (e) {
    wx.reLaunch({
      url: '/pages/index/index??comp_id=' + app.globalData.comp_id,
    })
  },
});
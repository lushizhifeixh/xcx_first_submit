var app = new getApp();
//小程序登录获取GPF权限
var limit_API = "http://172.16.1.110:8060//wechat/user/login";
//小程序解除绑定
var GonoBing_API = "http://172.16.1.110:8060/wechat/user/relieve";
//信息初始化
var infoInitUrl = 'http://172.16.1.110:8060/v1.0/merchant/init';
Page({
  data: {
    isLogin: false,//是否登陆,来判断是否显示页面
    headerLoginBg: "../../images/aboutMe/header_login_bg.png",
    userNmae: "",
    userInfo: {},
    token: true,
    isLoginEr:false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    //进入我的页面查看是否登陆

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    
    that.aboutMeFun();
  },
  aboutMeFun:function(){
    var inBind = wx.getStorageSync('inBind');
    if (inBind == 1) return;
    var that = this;
    var appsession = wx.getStorageSync('sessionId')
    wx.request({
      url: infoInitUrl,
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Cookie': 'appsession=' + appsession
      },
      data: {},
      success(res) {
        if (res.data.httpCode == 500) {
          that.setData({
            isLogin: false
          });
          if (res.data.errorCode == "default.error.unlogin") {
            //未登录的情况下去判断是未登录还是未绑定
            wx.login({
              success: function (res) {
                var code = res.code;
                if (res.code) {
                  wx.getUserInfo({
                    success: function (res) {
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
                            that.aboutMeFun();
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
          wx.getUserInfo({
            success: function (res) {
              that.setData({
                userInfo: res.userInfo,
              });
            }
          })
          that.setData({
            userNmae: res.data.data.loginName,
            isLoginEr :true
          })
        }
      }
    })
  },
  //绑定了之后去解除绑定
  go_unbundle: function () {
    var that = this;
    var appsession = wx.getStorageSync('sessionId')
    wx.showModal({
      title: '温馨提示!',
      content: '确认解除绑定',
      success: function (res) {
        if (res.confirm) {
          wx.login({
            success: function (res) {
              var code = res.code; // 复制给变量就可以打印了，醉了
              if (res.code) {
                wx.getUserInfo({
                  success: function (res) {
                    //解绑请求
                    wx.request({
                      url: GonoBing_API,
                      method: "POST",
                      header: {
                        "content-type": "application/x-www-form-urlencoded",
                        'Cookie': 'appsession=' + appsession
                      },
                      data: {
                        encryptedData: res.encryptedData,
                        iv: res.iv,
                        code: code,
                      },
                      success: function (res) {
                        wx.hideToast();
                        if (res.data.httpCode == 200) {
                          wx.setStorageSync('sessionId', "");
                          that.setData({
                            isLoginEr : false,
                            userNmae:''
                          })
                          wx.switchTab({
                            url: "../index/index",
                          });

                        } else {
                          app.showRemindNone(res.data.errorMessage, 2000)
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
        } else if (res.cancel) {
          console.log("用户取消解绑")
        }
      }
    })
  },
  // 进入收藏页面
  goCollectPage:function(){
    wx.navigateTo({
      url: "../lessPage/collectPage/collectPage",
    });
  }
})
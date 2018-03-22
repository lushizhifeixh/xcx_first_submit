var app = new getApp();
//小程序获取手机验证码
var getCodeUrl = 'http://172.16.1.110:8060//wechat/user/send/vcode';
//小程序-小程序绑定逛批发接口
var bindPort_API = "http://172.16.1.110:8060//wechat/user/binding";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    telephone: '',
    telFlag: false,
    code: '',
    codeFlag: false,
    codeText: '获取验证码',
    getNumFlag: true,
    canTap: false,
    switchFlag: true     //跳转标识量,如果点击绑定按钮则置为false
  },
  /**
   * 记录手机号码
   */
  telInput(e){
    var that = this;
    var tel = e.detail.value;
    that.setData({
      telephone: tel
    });
  },
  /**
   * 清空手机号码
   */
  clearTel(){
    var that = this;
    that.setData({
      telephone: ''
    });
  },
  /**
   * 获取验证码
   */
  getCode(){
    var that = this;
    if (!that.data.getNumFlag)return;
    var tel = that.data.telephone;
    if (tel == '' || tel.length != 11) {
      app.showRemindNone('请输入正确的手机号', 2000)
      return;
    };
    that.setData({
      telFlag: true
    });
    var time = 60;
    var t = setInterval(function () {
      time--;
      that.setData({
        codeText: time + '秒',
        getNumFlag: false
      });
      if (time == 0) {
        clearInterval(t);
        that.setData({
          codeText: '重新发送',
          getNumFlag: true
        })
      }
    }, 1000);
    wx.request({
      //小程序获取手机验证码
      url: getCodeUrl,
      method: "POST",
      data: {
        phone: tel,
      },
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        if (res.data.httpCode == 200) {
          app.showRemindNone('发送成功', 2000)
        }
      }
    })
    
  },
  /**
   * 记录验证码
   */
  codeInput(e){
    var that = this;
    var code = e.detail.value;
    that.setData({
      code: code
    });
  },
  /**
   * 绑定
   */
  gotoregister(){
    var that = this;
    var tel = that.data.telephone;
    var _code = that.data.code;
    app.showRemindNone("绑定中...", 2000)
    wx.login({
      success: function (res) {
        var code = res.code; // 复制给变量就可以打印了，醉了
        if (res.code) {
          wx.getUserInfo({
            success: function (res) {
              //发起网络请求
              // debugger
              wx.request({
                url: bindPort_API,
                data: {
                  encryptedData: res.encryptedData,
                  iv: res.iv,
                  code: code,
                  vcode: _code,
                  phone: tel
                },
                success: function (res) {
                  wx.hideToast();
                  if (res.data.httpCode == 200) {
                    wx.setStorageSync('sessionId', res.data.data);
                    that.setData({
                      switchFlag: false
                    });
                    setTimeout(function(){
                      wx.navigateBack();
                      wx.setStorageSync('inBind', '');
                    },1000)
                  }else{
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
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setStorageSync('inBind', 1);
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    var that = this;
    if (that.data.switchFlag) {
      wx.switchTab({
        url: "/pages/index/index"
      })
    }  
  },
 
})
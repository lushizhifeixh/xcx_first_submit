var app = getApp();

function MyPromise(fn, api, params) {
  this.value;
  this.api = api;
  this.params = params;
  this.resolveFunc = function () { };
  this.rejectFunc = function () { };
  fn(this.resolve.bind(this), this.reject.bind(this), this.api, this.params);
}

MyPromise.prototype.resolve = function (val) {
  var self = this;
  self.value = val;
  setTimeout(function () {
    self.resolveFunc(self.value);
  }, 0);
}

MyPromise.prototype.reject = function (val) {
  var self = this;
  self.value = val;
  setTimeout(function () {
    self.rejectFunc(self.value);
  }, 0);
}

MyPromise.prototype.then = function (resolveFunc, rejectFunc) {
  this.resolveFunc = resolveFunc;
  this.rejectFunc = rejectFunc;
}

var fn = function (resolve, reject, api, params) {
  wx.request({
    url: api,
    data: params,
    header: {
      'content-type': 'application/json'
    },
    success: function (res) {
      console.log(res);
      resolve(res.data);
    },
    fail: function (error) {
      console.log(error);
      reject(error);
    }
  })
}


function fetchApi(api, params) {
  if (typeof Promise == 'undefined') {
    return new MyPromise(fn, api, params)
  } else {
    return new Promise((resolve, reject) => {
      wx.request({
        url: api,
        data: params,
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          console.log(res);
          resolve(res.data);
        },
        fail: function (error) {
          console.log(error);
          reject(error);
        }
      })
    })
  }

}

function getHouseDetail(case_id) {
  wx.request({
    url: app.globalData.detailUrl,
    data: {
      comp_id: app.globalData.comp_id,
      case_id: case_id
    },
    success: function (res) {
      return res;
    },
    fail: function (fail) {
      return fail;
    }
  })
}

//图片路径格式化
function formateImg(imgList) {
  var imgLists = [];
  if (imgList.length) {
    for (var i = imgList.length - 1; i >= 0; i--) {
      imgLists.push(app.globalData.photoServerUrl + imgList[i].PHOTO_ADDR);
    }
  }

  return imgLists;
}
//详情的图片列表转成数据返回
function formatePicsUrl(picsUrlPath) {
  if (picsUrlPath) {
    return picsUrlPath.split(',');
  } else {
    return '';
  }
}
//经纪人头像
function brokerAvar(icon) {
  return app.globalData.photoBrokerUrl + icon;
}

//跳转链接
function navigateTo(e) {
  var url = e.target.dataset.url ? e.target.dataset.url : e.currentTarget.dataset.url;
  console.log(url);
  wx.navigateTo({
    url: url
  })
}
function redirectTo(e) {
  var url = e.target.dataset.url ? e.target.dataset.url : e.currentTarget.dataset.url;
  wx.redirectTo({
    url: url
  })
}
function switchTab(e) {
  console.log(e);
  var url = e.target.dataset.url ? e.target.dataset.url : e.currentTarget.dataset.url;
  wx.switchTab({
    url: url
  })
}
function reLaunch(e) {
  var url = e.target.dataset.url ? e.target.dataset.url : e.currentTarget.dataset.url;
  wx.reLaunch({
    url: url
  })
}
function inArray(needle, haystack) {
  var i = 0, n = haystack.length;
  for (; i < n; ++i)
    if (haystack[i] === needle)
      return true;
  return false;
}
function removeByValue(arr, val) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] == val) {
      arr.splice(i, 1);
      break;
    }
  }
}
/**
 * 拨打电话
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function calling(e) {
  var mobile = e.target.dataset.mobile ? e.target.dataset.mobile : e.currentTarget.dataset.mobile;
  wx.makePhoneCall({
    phoneNumber: mobile
  })
}
/**
 * 错误图片处理
 * @param  {[type]} e    []
 * @param  {[type]} that []
 * @param  {[type]} type [图片类型 avatar/house]
 * @return {[type]}      [description]
 */
function errImgFun(e, that, type) {
  var _errImg = e.target.dataset.errImg;
  var _errObj = {};
  _errObj[_errImg] = type == 'avatar' ? "../../images/default_avatar.jpg" : "../../images/default_house.jpg";

  console.log(_errImg + '---' + _errObj[_errImg]);
  that.setData(_errObj);
}


module.exports = {
  getHouseDetail: getHouseDetail,
  formateImg: formateImg,
  brokerAvar: brokerAvar,
  navigateTo: navigateTo,
  redirectTo: redirectTo,
  switchTab: switchTab,
  errImgFun: errImgFun,
  inArray: inArray,
  formatePicsUrl: formatePicsUrl,
  removeByValue: removeByValue,
  calling: calling,
  reLaunch: reLaunch,
  getList: function (api, params) {
    return fetchApi(api, params)
  },
  getRequest: function (api, params) {
    return fetchApi(api, params)
  }
}
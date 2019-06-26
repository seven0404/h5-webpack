function createNode(list) {
  var root = {
    "id": "0",
    "text": "全选",
    "value": "",
    "showcheck": true,
    complete: true,
    "isexpand": true,
    "checkstate": 0,
    "hasChildren": true
  };
  var arr = [];
  for (var i = 0; i < list.length; i++) {
    var subarr = [];
    var itemList = list[i].list
    for (var j = 0; j < itemList.length; j++) {
      subarr.push({
        "id": itemList[j].id.toString(),
        "text": itemList[j].userName,
        "value": itemList[j].id,
        "showcheck": true,
        complete: true,
        "isexpand": false,
        "checkstate": 0,
        "hasChildren": false
      });
    }
    arr.push({
      "id": 'userId' + list[i].userType,
      "text": list[i].userTypeName,
      "value": '',
      "showcheck": true,
      complete: true,
      "isexpand": false,
      "checkstate": 0,
      "hasChildren": true,
      "ChildNodes": subarr
    });
  }
  root["ChildNodes"] = arr;
  return root;
}

function getUsersList(callback) {
  // 请求被通知对象列表
  var userInfo = JSON.parse(window.localStorage.getItem('userInfo'))
  $.ajax({
    url: serverUrl + '/getUsersList',
    type: 'GET',
    headers: {
      token: userInfo.token
    },
    success: function (res) {
      if(res.code == 200){
        callback(createNode(res.data))
      }
    }
  })
}

function initSendInfo(callback) {
   getUsersList(function(route){
    callback([route])
   })
 
}

window.initSendInfo = initSendInfo

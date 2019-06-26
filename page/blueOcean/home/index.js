
$(function () {

  let prdType = 1; // 项目类型
  let userInfo = JSON.parse(window.localStorage.getItem('userInfo'))

  if(userInfo.jurisdiction==1){
    $('.add').css('display','block')
  }

  initSendInfo(function(treedata){
    console.log('treedata',treedata)
    $("#tree").treeview({
        showcheck: true,
        data: treedata
    });
  })

  // 切换左侧控制台
  $('.icon').click(function () {
    $('.control').fadeToggle("slow", "linear");
    $('#leftC').fadeToggle("slow", "linear")
    $('#rightC').fadeToggle("slow", "linear")
  })

  // 切换项目
  $('#catalogue').on('click', '.prdTitle', function () {
    $(".list").fadeOut("slow")
    $(this).next(".list").fadeToggle("slow", "linear")
  })
  // 选中项目
  $('#catalogue').on('click', 'li', function () {
    $('.list li').removeClass('active')
    $(this).addClass('active')
    $('iframe').attr('src', $(this)[0].dataset.src)
  })

  // 切换UI 和 原型
  $('.typeToggle div').click(function () {
    $('.typeToggle div').removeClass('active')
    $(this).addClass('active')
    $('iframe').attr('src', '')
    prdType = $(this)[0].dataset.type
    getList($(this)[0].dataset.type)
  })

  // 弹出上传
  $('.add').click(function () {
    if(prdType == 1){
      $('#uTitle').html('UI图上传')
    }else{
      $('#uTitle').html('原型图上传')
    }
    $('#prdName').val('')
    $('#prdId').val('')
    $('#upload_file').val('')
    $('.cover').hide()
    $('#to').hide()
    $("#progress_bar_top").css('width', (0 + '%'));
    $("#progressValue").html(0 + '%');
    $('.uploadModel').fadeToggle("slow", "linear");
  })
  // 弹出上传
  $('#catalogue').on('click', '.upload', function (e) {
    e.stopPropagation();
    if(prdType == 1){
      $('#uTitle').html('UI图上传')
    }else{
      $('#uTitle').html('原型图上传')
    }
    $('#upload_file').val('')
    $('.cover').show()
    $('#to').show()
    $("#progress_bar_top").css('width', (0 + '%'));
    $("#progressValue").html(0 + '%');
    $('#prdName').val($(this)[0].dataset.prdname)
    $('#willName').html($(this)[0].dataset.prdname)
    $('#prdId').val($(this)[0].dataset.id)
    $('.uploadModel').fadeToggle("slow", "linear");
  })

  // 关闭上传
  $('.cancle').click(function () {
    $('.uploadModel').fadeOut("slow", "linear");
  })

  // 请求列表数据
  function getList(type) {
    $.ajax({
      url: serverUrl + '/getPictureList',
      type: 'GET',
      data: {
        prdType: type
      },
      headers:{
        token: userInfo.token
      },
      success: function (e) {
        if (e.code == 200) {
          let list = e.data
          let value = ''
          list.forEach((item) => {
            var ulLi = ''
            item.list.forEach(e => {
              ulLi += `
                  <li data-src="${e.fileUrl}">
                    <div>
                      ${e.fileName}
                      <a class='download' href="${e.fileUrl.replace(/index.html$/,'assets.zip')}" download="assets.zip">下载切图</a>
                    </div>
                    <div>${formatDateTime(e.createdAt)}</div>
                  </li>
                `
            })
            value += `<div class="prd">
                  <div class="prdTitle">
                    <img class="jiantou" src="../img/jiantou.svg" alt="" srcset="">
                    ${item.prdName}
                    ${userInfo.jurisdiction==1?`<img class="upload" src="../img/uplaod.svg" alt="" srcset="" data-id='${item.prdId}' data-prdname='${item.prdName}'></img>`:''}
                  </div>
                  <ul class="list">
                    ${ulLi}
                  <ul>
                </div>`
          })
          $('#catalogue').html(value)
        }
      },
      error: function (e) {
        console.log(e)
      }
    })
  }
  getList(1)

  var formatDateTime = function (time) {
    var date = new Date(time)
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    var minute = date.getMinutes();
    minute = minute < 10 ? ('0' + minute) : minute;
    return y + '-' + m + '-' + d + ' ' + h + ':' + minute;
  };

  // 文件上传
  function upload(formDate,sList) {
    if (window.FormData) {
      $.ajax({
          url: serverUrl + '/uploadPrd?prdName='+formDate.get('prdName') + '&fileName=' + formDate.get('upName').name + '&type=' + prdType + '&prdId=' + formDate.get('prdId') + '&sList=' + sList.toString(),
          type: 'POST',
          data: formDate,
          headers:{
            token: userInfo.token
          },
          cache: false,
          processData: false,
          contentType: false,
          async: true,
          xhr :function () {//这里我们先拿到jQuery产生的 XMLHttpRequest对象，为其增加 progress 事件绑定，然后再返回交给ajax使用
            console.log('111')
            myXhr = $.ajaxSettings.xhr();
            if(myXhr.upload){
              myXhr.upload.addEventListener('progress',progressHandlingFunction, false)//progress事件会在浏览器接收新数据期间周期性地触发。而onprogress事件处理程序会接收到一个event对象，其target属性是XHR对象，但包含着三个额外的属性：lengthComputable、loaded和total。其中，lengthComputable是一个表示进度信息是否可用的布尔值，loaded表示已经接收的字节数，loaded表示根据Content-Length响应头部确定的预期字节数。
            }
            return myXhr
          },
          success:function(e){
            if(e.code == 200){
              window.$tip.success('上传成功');
              $('.uploadModel').fadeOut("slow", "linear");
              getList(prdType)
            }
          }
      });
    } else {
      window.$tip.error('浏览器不支持上传方式，请更换浏览器！');
    }
  }

  // 点击提交
  $('#submit').click(function () {
    var oldList = $("#tree").getCheckedNodes();
    var sList = []
    oldList.forEach(function(e){
      if(e){
        sList.push(e)
      }
    })
    var formDate = new FormData($('#myForm')[0]);
    if (!formDate.get('prdName')) {
      window.$tip.error('请填写项目名称')
      return
    }
    if (!formDate.get('upName').size || /zip$/.test(formDate.get('upName')).name) {
      window.$tip.error('请上传压缩包,支持上传zip压缩包')
      return
    }
    if (!sList.length){
      window.$tip.error('请选择通知对象')
      return
    }
    upload(formDate, sList)
  })

  function progressHandlingFunction(event) {
    if (event.lengthComputable) {
      var value = (event.loaded / event.total * 100 | 0);
      $("#progress_bar_top").css('width', (value + '%'));
      $("#progressValue").html(value + '%');
    }
  }

  function fresh() {
    window.location.reload();
  }
})
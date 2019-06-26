$(function () {
  $('#submit').click(function(){
    if (!$('#userName').val()) {
      window.$tip.error('请填写用户名')
      return
    }
    if (!$('#password').val()) {
      window.$tip.error('请填写密码')
      return
    }
    login()
  })
  function login(){
    $.ajax({
      url: serverUrl + '/login',
      type: 'post',
      
      data: {
        userName: $('#userName').val(),
        password: $('#password').val()
      },
      success: function (e) {
        if(e.code == 200){
          window.$tip.success('登录成功')
          window.localStorage.setItem('userInfo', JSON.stringify(e.data))
          location.href='./home/index.html'
        }else{
          window.$tip.error('姓名/邮箱或密码错误')
        }
      }
    })
  }
})
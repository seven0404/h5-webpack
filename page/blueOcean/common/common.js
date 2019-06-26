$(function () {
  window.$tip = {
    success: function (e) {
      $('body #tip').empty()
      var value = `<div id="tip" style="position: fixed; left: 50%;top: 20px; transform: translateX(-50%); width: 300px;background: #69aa04; color: #ffffff; line-height: 60px;text-align: center; border-radius: 8px; font-size: 18px">${e}</div>`
      $('body').append(value)
      setTimeout(function(){
        $('body #tip').fadeOut("slow")
      },2000)
    },
    error: function (e) {
      $('body #tip').empty()
      var value = `<div id="tip" style="position: fixed; left: 50%;top: 20px; transform: translateX(-50%); width: 300px;background: #ed0b0b; color: #ffffff; line-height: 60px;text-align: center; border-radius: 8px; font-size: 18px">${e}</div>`
      $('body').append(value)
      setTimeout(function(){
        $('body #tip').fadeOut("slow")
      },2000)
    }
  }
})
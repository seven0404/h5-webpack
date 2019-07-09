const co = require('co');
const prompt = require('co-prompt');
const colors = require('colors'); // 终端输出颜色
const fs = require('fs')
const path = require('path');
const { exec } = require('child_process');


function cliParmas(callback){
  let params = null
  co(function* () {

    // 项目名
    let name = yield prodName()
    if (!name) {
      process.exit();
      return
    }
  
    // api环境
    let api = yield prodApi()
    if (!name) {
      process.exit();
      return
    }
  
    // 项目运行环境pc 或 mobile
    let env = yield environment()
  
    // 是否需要加载vconsole
    let isVConsole = yield isNeedVConsole()
  
    // 是否需要代理
    let poxy = yield isNeedProxy()
  
    params = {
      name: name,
      api: api,
      env: env,
      isVConsole: isVConsole,
      poxy: poxy
    }
    callback(params)
  });
  
  function* prodName() {
    let name = yield prompt('请输入启动服务的项目名: '.red)
    if (name) {
      console.log(`-->输入的项目名为：${name}\n`.green)
      const dirExist = fs.existsSync(path.join(__dirname, '../page/' + name))
      if (!dirExist) {
        console.log(`--> error: 在page目录下没有这名字为 ${name}的项目， 请检查项目名称\n`.red)
        return false
      } else {
        return name
      }
    } else {
      console.log(`--> error: 必须输入启动服务的项目名\n`.red)
      return false
    }
  }
  
  function* prodApi() {
    let api = yield prompt('请输入api环境(dev1,dev2,test1,test2,prod): '.red)
    if (api && (api == 'dev1' || api == 'dev2' || api == 'test1' || api == 'test2' || api == 'prod')) {
      console.log(`-->已加载api环境:${api}\n`.green)
      return api
    } else {
      console.log(`-->输入的是:${api}，没有这个环境\n`.red)
      return false
    }
  }
  
  function* environment() {
    let env = yield prompt('请输入运行环境(p,m): '.red)
    if (env == 'p') {
      console.log(`-->运行环境为pc端，不加载rem\n`.green)
      return 'pc'
    } else {
      console.log(`-->运行环境为移动端，加载了rem计算公式和pxtorem\n`.green)
      return 'mobile'
    }
  }
  
  function* isNeedVConsole() {
    let ok = yield prompt.confirm('是否加载vConsloe? (y|n)'.red);
    if (ok) {
      console.log('-->已加载vConsole\n'.green)
      return true
    } else {
      console.log('-->未加载vConsole\n'.cyan)
      return false
    }
  }
  
  function* isNeedProxy() {
    let poxy = yield prompt.confirm('是否需要本地代理? (y|n)'.red);
    if (poxy) {
      let url = yield prompt('请输入代理地址: ')
      if (url) {
        console.log(`-->本地代理地址：${url}\n`.green)
        return url
      } else {
        console.log('-->未输入，默认不需要代理\n'.cyan)
        return false
      }
    } else {
      console.log('-->不需要代理\n'.cyan)
      return false
    }
  }
}

module.exports = cliParmas
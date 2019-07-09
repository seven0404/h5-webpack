const co = require('co');
const prompt = require('co-prompt');
const colors = require('colors'); // 终端输出颜色
const fs = require('fs')
const path = require('path');
const {
  exec
} = require('child_process');
const cliParmas = require('./index')


cliParmas(function (params) {
  var child = exec(`npm run start --pro=${params.name} --api=${params.api} --env=${params.env} --isVConsole=${params.isVConsole} --poxy=${params.poxy}`, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  })

  child.stdout.on('data', function (data) {
    console.log(data);
  });
})
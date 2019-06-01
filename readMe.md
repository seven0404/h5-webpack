# 活动页打包工具
  特性:
    1. 每个文件夹就是一个活动项目
    2. 开发启动单个项目的服务
    3. 独立打包
    4. 常用插件注入（jq, zcqShare 等等）
    5. html, js, css 压缩混淆
    6. 本地代理（解决接口跨域）
    7. 支持es6,less

## 使用
  启动服务器
  npm run start --prd=项目名

  打包
   npm run build --prd=项目名

  除了html的名字对应的js,jq 可以不用引入，打包的时候可以自动注入。
  其他的js需要手动引入 如 `<script src="./common.js"></script>`,打包的时候会将

## webpack 配置
  1. 入口，出口
  2. html，js 文件打包
  3. es6,less 支持
  4. 本地代理
  

html-webpack-plugin 简化了HTML文件的创建

style-ext-html-webpack-plugin 将您的<link>s 转换为外部样式表，转换为<style>包含内部CSS的元素

html-webpack-injector 用于在相同的html文档head或body（不同位置）注入块。



  
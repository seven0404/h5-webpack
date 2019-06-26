# 活动页打包工具
  特性:
    1. 每个文件夹就是一个活动项目
    2. 开发启动单个项目的服务 TODO
    3. 独立打包
    4. 常用插件注入（jq, zcqShare 等等）
    5. html, js, css,less 压缩混淆
    <!-- 6. 本地代理（解决接口跨域） -->
    7. 支持es6,less

## 使用
  1. 启动服务器
  npm run start --pro=项目名 --api=dev1/dev2/test1/test2/prod

  2. 打包
   npm run build --pro=项目名 --api=dev1/dev2/test1/test2/prod

  3. js 文件引入问题，默认引入了jq 的cdn 地址，引入位置在body末尾。所以自己的js需要放到body之后，才能使用jq.
    如： 
    ```js
      <body>
      </body>
      <script src="./index.js"></script>
    ```
    
    打包后的效果：
    ```js
    <body>
      <script src="//assetscdn.51zouchuqu.com/js/jquery-3.2.1.min.js"></script>
    </body>
    <script src="./index.js"></script>
    ```

    开发环境移动端默认引入vConsole 3.3.0 // TODO 移动端默认引入
    打包后的效果：
    ```js
    <body>
      <script src="//assetscdn.51zouchuqu.com/js/jquery-3.2.1.min.js"></script>
      <script src="//assetscdn.51zouchuqu.com/js/vconsole.min.js"></script>
      <script>var vConsole = new VConsole()</script>
    </body>
    <script src="./index.js"></script>
    ```

  4: css 引入，不自动引入，需要手动引入
    1. 支持css 和 less
    2. 不管是写的css或者写的less, 在开发的时候，
      直接引入 <link rel="stylesheet" href="./index.css">
      即使写的less,比如说写的是index.less,但是开发的时候还是引入./index.css，因为less在打包的时候会自动转化的css。所以只需要直接写成css 即可
    3. 开发环境css默认不压缩，生产环境css默认压缩

  5：dev1, dev2,test1,test2, prd的请求域名。对应启动服务的请求域名copy 配置文件。


  <!-- 5: js 支持es6 开发环境和生产环境会进行babel转码 TODO-->
  pc 端和移动端rem
  本地代理

## webpack 配置
  1. 入口，出口
  2. html，js 文件打包
  3. es6,less 支持
  4. 本地代理
  

html-webpack-plugin 简化了HTML文件的创建

style-ext-html-webpack-plugin 将您的<link>s 转换为外部样式表，转换为<style>包含内部CSS的元素

html-webpack-injector 用于在相同的html文档head或body（不同位置）注入块。



  
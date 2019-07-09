# 活动页打包工具
  特性:

    1. 每个文件夹就是一个活动项目

    2. 开发启动单个项目的服务

    3. 独立打包

    4. 常用插件注入（jq, zcqShare 等等）

    5. html, js, css,less 压缩混淆

    6. 本地代理（解决接口跨域）

    7. 支持es6,less

## 使用

  ### 拥有两种启动方式
  一：引导式启动：
  
  ```js
    npm run start-cli

    npm run dev-cli 
  ```
  注：上面两种方式是：start-cli 是webpack-dev-server启动本地服务，不会打包文件。dev-cli是编译dev包文件。不启动本地服务

  二：命令式启动

  1. 启动服务器
  ```js
  npm run start --pro=项目名 --api=dev1/dev2/test1/test2/prod
  ```

  2. 打包出dev文件，不启动服务
  ```js
  npm run dev --pro=项目名 --api=dev1/dev2/test1/test2/prod
  ```
  
  3. 打包
  ```js
   npm run build --pro=项目名 --api=dev1/dev2/test1/test2/prod
  ```

## 命令式启动参数说明
  1. --pro=name 启动的项目名称，无默认值
  2. --api=api  将要重config中copy的文件名（dev1,dev2,test1,test2,prod），无默认值
  3. --env=env  项目运行环境，pc或mobile， mobile 会默认引入rem.css 默认值：mobile
  4. --isVConsole=isVConsole 是有加载调试工具vConsole, 默认不加载
  5. --poxy=poxy 是否启动本地代理，如果需要启动本地代理。直接跟上url,如```--poxy=192.168.0.2:8080```。 默认无代理


## 其他说明

  1. js 文件引入问题，默认引入了jq 的cdn 地址，引入位置在body末尾。所以自己的js需要放到body之后，才能使用jq.
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

  2: css 引入，不自动引入，需要手动引入
  
    1. 支持css 和 less
    2. 不管是写的css或者写的less, 在开发的时候，
      直接引入  ```<link rel="stylesheet" href="./index.css">```
      即使写的less,比如说写的是index.less,但是开发的时候还是引入./index.css，因为less在打包的时候会自动转化的css。所以只需要直接写成css 即可
    3. 开发环境css默认不压缩，生产环境css默认压缩

  3：dev1, dev2,test1,test2, prd的请求域名。对应启动服务的请求域名copy 配置文件。

  4: js 支持es6 开发环境和生产环境会进行babel转码

  5: 使用移动端启动，会默认引入rem.css (密集媒体查询，解决js设置在网速慢的时候，页面先放大后缩小)

  6: 拥有本地代理功能


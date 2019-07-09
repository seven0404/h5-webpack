const path = require('path');
const fs = require('fs')
const colors = require('colors'); // 终端输出颜色
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const HtmlWebpackInjectPlugin = require('html-webpack-insert-text-plugin').default;
const CopyPlugin = require('copy-webpack-plugin');
const devMode = process.env.NODE_ENV !== 'production';
const pathBase = devMode ? path.join(__dirname, 'dev') : path.join(__dirname, 'dist')
const projectName = '/page/' + process.env.npm_config_pro
const utils = require('./webpack.util.js')


// 检测项目是否存在
const dirExist = fs.existsSync(path.join(__dirname, projectName))
if (!dirExist) {
  console.error(`error: 在page目录下没有这名字为 ${process.env.npm_config_pro}的项目， 请检查项目名称 --pro=${process.env.npm_config_pro}  \n`.red)
  process.exit(`error: 在page目录下没有这名字为 ${process.env.npm_config_pro}的项目， 请检查项目名称 --pro=${process.env.npm_config_pro}  \n`.red);
  return;
}

const allFileArr = utils.getAllFileArr('.'+projectName)

//打包之前删除build文件夹
if (devMode) { // 开发环境
  utils.deleteFolderRecursive('./dev')
} else {
  utils.deleteFolderRecursive('./dist')
}

console.log('入口entry11 -> %o'.green, utils.getEntry(allFileArr))

var conf = {
  entry: { // js 和 less, css 为入口
    ...utils.getEntry(allFileArr)
  },
  output: {
    path: pathBase,
    publicPath: '/',
    filename: `[name]`
  },
  plugins: [
    new ExtractTextPlugin({
      filename: `[name]`
    }),
    new CopyPlugin(utils.getImgEntry(allFileArr)),
    new CopyPlugin(utils.getApiConfigEntry())
  ],
  resolve: { // 这些选项能设置模块如何被解析
    modules: [
      path.resolve(projectName),
      path.resolve('node_modules')
    ],
    extensions: ['.js', '.css', '.less']
  },
  module: {
    rules: [{
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('css-loader')
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'less-loader']
        })
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          'img-loader',
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: process.env.npm_config_pro + '/img/[name].[hash:7].[ext]'
            }
          }
        ]
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      }
    ]
  },
  devServer: {
    host:'0.0.0.0', // 如果你希望服务器外部可访问，指定如下0.0.0.0
    contentBase: pathBase, // 告诉服务器从哪个目录中提供内容。只有在你想要提供静态文件时才需要。
    // publicPath: '/dev', // 将用于确定应该从哪里提供 bundle，并且此选项优先。
    compress: true, // 启动gzip压缩
    useLocalIp: true, //此选项允许浏览器使用本地 IP 打开。
    port: 9000,
    overlay: true, // 当出现编译器错误或警告时，在浏览器中显示全屏覆盖层。默认禁用。如果你想要只显示编译器错误：
    open: true, // 打开默认浏览器
    openPage: process.env.npm_config_pro + '/', //  指定打开浏览器时的导航页面。
    proxy: {
      '/api': {
        target: process.env.npm_config_poxy,
        pathRewrite: {
          '^/api': ''
        },
        ws: false,
        changeOrigin: false
      }
    }
  }
}

if (devMode) { // 开发环境
  //将html文件打包
  allFileArr.forEach((item) => {
    var re = new RegExp("^" + process.env.npm_config_pro + "/");
    if (re.test(item[3]) && /\.html$/.test(item[0])) {
      var name = item[2];
      var prex = item[3]
      var initSrciptPath = item[2].split("./page/")[1]
      conf.plugins.push(
        new htmlWebpackPlugin({ //根据模板插入css/js等生成最终HTML
          // favicon: './src/images/favicon.ico', //favicon路径，通过webpack引入同时可以生成hash值
          filename: prex + item[0],
          template: name, //html模板路径
          inject: false, //js插入的位置，true, false, 'head', 'body'. （false 不注入， true 注入到body尾部）
          hash: true, //为静态资源生成hash值
          chunks: [], //需要引入的chunk，不配置就会引入所有页面的资源
          minify: false //不压缩
        })
      )

      var InjectPluginList = [{
        target: initSrciptPath,
        parent: 'body',
        text: '<script src="/' + process.env.npm_config_pro + '/config/config.js"></script> <script src="//assetscdn.51zouchuqu.com/js/jquery-3.2.1.min.js"></script> '
      }]

      if(process.env.npm_config_isVConsole == 'true'){
        var InjectPluginList = [{
          target: initSrciptPath,
          parent: 'body',
          text: '<script src="/' + process.env.npm_config_pro + '/config/config.js"></script> <script src="//assetscdn.51zouchuqu.com/js/jquery-3.2.1.min.js"></script> <script src="//assetscdn.51zouchuqu.com/js/vconsole.min.js"></script> <script>var vConsole = new VConsole()</script>'
        }]
      }

      if (process.env.npm_config_env !== 'pc') {
        InjectPluginList.unshift({
          target: initSrciptPath,
          parent: 'head',
          text: '<link rel="stylesheet" href="https://assetscdn.51zouchuqu.com/css/rem.css">'
        })
      }

      conf.plugins.push(
        new HtmlWebpackInjectPlugin(InjectPluginList)
      )

    }
  })
}

if (!devMode) { // 生产环境
  //将html文件打包
  allFileArr.forEach((item) => {
    var re = new RegExp("^" + process.env.npm_config_pro + "/");
    if (re.test(item[3]) && /\.html$/.test(item[0])) {
      var name = item[2];
      var prex = item[3]
      var initSrciptPath = item[2].split("./page/")[1]
      conf.plugins.push(
        new htmlWebpackPlugin({ //根据模板插入css/js等生成最终HTML
          // favicon: './src/images/favicon.ico', //favicon路径，通过webpack引入同时可以生成hash值
          filename: prex + item[0],
          template: name, //html模板路径
          inject: false, //js插入的位置，true, false, 'head', 'body'. （false 不注入， true 注入到body尾部）
          hash: true, //为静态资源生成hash值
          chunks: [], //需要引入的chunk，不配置就会引入所有页面的资源
          minify: { //压缩HTML文件
            removeComments: true, //移除HTML中的注释
            collapseWhitespace: false, //删除空白符与换行符
            ignoreCustomFragments: [
              /\{\{[\s\S]*?\}\}/g //不处理 {{}} 里面的 内容
            ]
          }
        })
      )

      var InjectPluginList = [{
        target: initSrciptPath,
        parent: 'body',
        text: '<script src="/' + process.env.npm_config_pro + '/config/config.js"></script> <script src="//assetscdn.51zouchuqu.com/js/jquery-3.2.1.min.js"></script> '
      }]

      if(process.env.npm_config_isVConsole == 'true'){
        var InjectPluginList = [{
          target: initSrciptPath,
          parent: 'body',
          text: '<script src="/' + process.env.npm_config_pro + '/config/config.js"></script> <script src="//assetscdn.51zouchuqu.com/js/jquery-3.2.1.min.js"></script> <script src="//assetscdn.51zouchuqu.com/js/vconsole.min.js"></script> <script>var vConsole = new VConsole()</script>'
        }]
      }

      if (process.env.npm_config_agent !== 'pc') {
        InjectPluginList.unshift({
          target: initSrciptPath,
          parent: 'head',
          text: '<link rel="stylesheet" href="https://assetscdn.51zouchuqu.com/css/rem.css">'
        })
      }

      conf.plugins.push(
        new HtmlWebpackInjectPlugin(InjectPluginList)
      )

    }
  })

  // css 压缩
  conf.plugins.push(
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano'),
      cssProcessorOptions: {
        safe: true,
        discardComments: {
          removeAll: true
        }
      },
      canPrint: true
    })
  )
}

module.exports = conf
const path = require('path');
const fs = require('fs')
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const HtmlWebpackInjectPlugin = require('html-webpack-insert-text-plugin').default;
const CopyPlugin = require('copy-webpack-plugin');
const devMode = process.env.NODE_ENV !== 'production';
const pathBase = devMode ? __dirname + '/dev' : __dirname + '/dist'
const projectName = '/page/' + process.env.npm_config_pro
const utils = require('./webpack.util.js')

// 检测项目是否存在
const dirExist = fs.existsSync(path.join(__dirname, projectName))
if (!dirExist) {
  console.error(`在page目录下没有这名字为 ${process.env.npm_config_pro}的项目， 请检查项目名称  \n`)
  process.exit(`在page目录下没有这名字为 ${process.env.npm_config_pro}的项目， 请检查项目名称  \n`);
  return;
}

const allFileArr = utils.getAllFileArr('./page')

//打包之前删除build文件夹
if (devMode) { // 开发环境
  utils.deleteFolderRecursive('./dev')
} else {
  utils.deleteFolderRecursive('./dist')
}

console.log('entry----', utils.getEntry(allFileArr), '----')

module.exports = {
  mode: process.env.NODE_ENV,
  entry: {// js 和 less, css 为入口
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
  resolve: {
    modules: [
      path.resolve(projectName),
      path.resolve('node_modules')
    ],
    extensions: ['.js', '.css', '.less']
  },
  module: {
    rules: [
      {
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
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  devServer: {
    contentBase: pathBase,
    compress: true,
    port: 9000,
    open: 'Google Chrome',
    openPage: process.env.npm_config_pro,
    proxy: {
      '/api': {
        target: 'http://192.168.2.125:5761',
        pathRewrite: { '^/api': '' },
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
        console.log('initSrciptPath',initSrciptPath)
        console.log('item[2]',item[2])
        module.exports.plugins.push(
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
        module.exports.plugins.push(
          new HtmlWebpackInjectPlugin([{
            target: initSrciptPath,
            parent: 'body',
            text: '<script src="/'+ process.env.npm_config_pro +'/config/config.js"></script> <script src="//assetscdn.51zouchuqu.com/js/jquery-3.2.1.min.js"></script> '
            // <script src="//assetscdn.51zouchuqu.com/js/vconsole.min.js"></script> <script>var vConsole = new VConsole()</script>
          }])
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
        module.exports.plugins.push(
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
        module.exports.plugins.push(
          new HtmlWebpackInjectPlugin([{
            target: initSrciptPath,
            parent: 'body',
            text: '<script src="/config/config.js"></script> <script src="//assetscdn.51zouchuqu.com/js/jquery-3.2.1.min.js"></script>'
          }])
        )
      }
  })

  // css 压缩
  module.exports.plugins.push(
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

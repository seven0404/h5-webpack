const path = require('path');
const fs = require('fs')
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin');
const devMode = process.env.NODE_ENV !== 'production';
const type = process.env.NODE_TYPE
const pathBase = devMode ? __dirname + '/dev' : __dirname + '/dist'
const projectName = '/page/' + process.env.npm_config_prd
const utils = require('./webpack.util.js')


// 检测项目是否存在
const dirExist = fs.existsSync(path.join(__dirname, projectName))
if (!dirExist) {
  console.error(`在page目录下没有这名字为 ${process.env.npm_config_prd}的项目， 请检查项目名称  \n`)
  process.exit(`在page目录下没有这名字为 ${process.env.npm_config_prd}的项目， 请检查项目名称  \n`);
  return;
}

const allFileArr = utils.getAllFileArr('./page')

//打包之前删除build文件夹
if (type == 'dev') {
  utils.deleteFolderRecursive('./dev')
} else if (type == 'build') {
  utils.deleteFolderRecursive('./dist')
}

console.log('entry----', utils.getEntry(allFileArr), '----')

module.exports = {
  mode: process.env.NODE_ENV,
  entry: {
    ...utils.getEntry(allFileArr),
    "jquery.js": 'jquery'
  },
  output: {
    path: pathBase,
    publicPath: '/',
    filename: `[name]`
  },
  plugins: [
    new ExtractTextPlugin({
      filename: '[name]'
    }),
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
    }),
    new CopyPlugin(utils.getImgEntry(allFileArr)),
    new BrowserSyncPlugin({
      server: {
        baseDir: pathBase,
      },
    }, {
      reload: true,
    })
  ],
  resolve: {
    modules: [
      path.resolve(projectName),
      path.resolve('node_modules')
    ],
    extensions: ['.js', '.css', '.less']
  },
  module: {
    rules: [{
        test: /\.js$/,
        include: [
          path.resolve(__dirname, `${projectName}`),
        ],
        exclude: [
          path.resolve('node_modules'),
        ],
        loader: 'babel-loader'
      },
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
      }
    ]
  },
  devServer: {
    contentBase: "./dev/" + process.env.npm_config_prd, //本地服务器所加载的页面所在的目录
    noInfo: true,
    host: 'localhost',
    open: 'true',
    port: '8989',
    // proxy: { // 代理
    //   '/api': {
    //     target: 'http://dev.goglbo.com',
    //     // target: 'http://192.168.1.24:9701',
    //     pathRewrite: { '^/api': '' },
    //     ws: false,
    //     changeOrigin: false
    //   }
    // }
  }
}

//将html文件打包
allFileArr.forEach((item) => {
  var re = new RegExp("^" + process.env.npm_config_prd + "/");
  if (re.test(item[3])) {
    var name = item[2];
    if (/\.html$/.test(item[0])) {
      var prex = item[3]
      module.exports.plugins.push(
        new htmlWebpackPlugin({ //根据模板插入css/js等生成最终HTML
          // favicon: './src/images/favicon.ico', //favicon路径，通过webpack引入同时可以生成hash值
          filename: prex + item[0],
          template: name, //html模板路径
          inject: true, //js插入的位置，true, false, 'head', 'body'. （false 不注入， true 注入到body尾部）
          hash: true, //为静态资源生成hash值
          chunks: [...utils.getKey(item),'jquery.js'], //需要引入的chunk，不配置就会引入所有页面的资源
          // minify: { //压缩HTML文件
          //   removeComments: true, //移除HTML中的注释
          //   collapseWhitespace: false, //删除空白符与换行符
          //   ignoreCustomFragments:[
          //       /\{\{[\s\S]*?\}\}/g  //不处理 {{}} 里面的 内容
          //   ]
          // },
          minify: false //不压缩
        })
      )
    }
  }
})

//生产模式打包的时候进行代码压缩合并优化
if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#eval-source-map'
  module.exports.output.publicPath = '/'

  module.exports.output.filename = `[name].js`;

  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    })
  ])
}
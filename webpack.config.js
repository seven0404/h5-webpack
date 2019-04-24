const path = require('path');
const fs = require('fs')
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin')
const devMode = process.env.NODE_ENV !== 'production';
console.log('process.env.NODE_ENV',process.env.NODE_ENV)
const pathBase = devMode ? __dirname +  '/dev' :__dirname +  '/dist'

const utils = require('./webpack.util.js')

//打包之前删除build文件夹
utils.deleteFolderRecursive('./build')

let publicPath = '/'
  , updateTime = new Date().getTime()

module.exports = {
  mode: process.env.NODE_ENV,
  entry: {
    ...utils.getEntry(utils.getAllFileArr('./page')),
    "jquery": 'jquery'
  },
  output: {
    path:pathBase,
    publicPath: publicPath,
    filename: `[name].js`
  },
  plugins: [
    // new webpack.optimize.UglifyJsPlugin({
    //   sourceMap: true,
    //   include: /\.css$/,
    //   compress: {
    //     warnings: false
    //   }
    // }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
    // 公共代码单独打包
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'common', //对外吐出的chuank名
    //   chunks:Object.keys(utils.getEntry(utils.getAllFileArr('./page'))), //数组，需要打包的文件[a,b,c]对应入口文件中的key
    //   minChunks:4, //chunks至少引用4次的时候打包
    //   filename: '[name].js' //打包后的文件名
    // })
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      }
    ]
  },
  devServer: {
    contentBase: "./dev",//本地服务器所加载的页面所在的目录
    noInfo: true,
    host: 'localhost',
    open: 'true',
    port: '8989'
  }
}


/**
 * 读取路径信息
 * @param {string} path 路径
 */
function getStat(path){
  return new Promise((resolve, reject) => {
      fs.stat(path, (err, stats) => {
          if(err){
              resolve(false);
          }else{
              resolve(stats);
          }
      })
  })
}

/**
* 创建路径
* @param {string} dir 路径
*/
function mkdir(dir){
  return new Promise((resolve, reject) => {
      fs.mkdir(dir, err => {
          if(err){
              resolve(false);
          }else{
              resolve(true);
          }
      })
  })
}

/**
* 路径是否存在，不存在则创建
* @param {string} dir 路径
*/
async function dirExists(dir){
  let isExists = await getStat(dir);
  //如果该路径且不是文件，返回true
  if(isExists && isExists.isDirectory()){
      return true;
  }else if(isExists){     //如果该路径存在但是文件，返回false
      return false;
  }
  //如果该路径不存在
  let tempDir = path.parse(dir).dir;      //拿到上级路径
  //递归判断，如果上级目录也不存在，则会代码会在此处继续循环执行，直到目录存在
  let status = await dirExists(tempDir);
  let mkdirStatus;
  if(status){
      mkdirStatus = await mkdir(dir);
  }
  return mkdirStatus;
}


// 复制 css和图片 到 指定目录下
function cpCss(item){
  console.log('item',item)
  if (/\.css$|\.(png|jpg|gif|svg|eot|ttf|woff)$/.test(item[0])) {
    module.exports.plugins.push(async function(){
      await dirExists(pathBase +'/'+ item[3]);
      return this.plugin('done', function() {
            // 创建读取流
            var readable = fs.createReadStream( item[2]);
            // 创建写入流
            var writable = fs.createWriteStream(pathBase +'/'+ item[3]+item[0] );
  
            // 通过管道来传输流
            readable.pipe( writable );
      });
    });
  }
}



//将html文件打包
var html_list = utils.getAllFileArr('./page');
html_list.forEach((item) => {
  var re = new RegExp("^" + process.env.npm_config_prd + "/");
  if (re.test(item[3])) {
    var name = item[2];
    if (/\.html$/.test(item[0])) {
      var prex = item[3]//item[1].indexOf('html')>-1?'html/':''
      module.exports.plugins.push(
        new htmlWebpackPlugin({ //根据模板插入css/js等生成最终HTML
          // favicon: './src/images/favicon.ico', //favicon路径，通过webpack引入同时可以生成hash值
          filename: prex + item[0],
          template: name, //html模板路径
          inject: true, //js插入的位置，true/'head'/'body'/false
          hash: true, //为静态资源生成hash值
          chunks: [utils.getKey(item)],//需要引入的chunk，不配置就会引入所有页面的资源
          minify: { //压缩HTML文件
            removeComments: true, //移除HTML中的注释
            collapseWhitespace: false, //删除空白符与换行符
            // ignoreCustomFragments:[
            //     /\{\{[\s\S]*?\}\}/g  //不处理 {{}} 里面的 内容
            // ]
          },
          minify: false //不压缩
        })
      )
    }
    cpCss(item)
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
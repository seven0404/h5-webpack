const path =require('path');
const fs =require('fs')
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin')
let ExtractTextPlugin = require('extract-text-webpack-plugin')

const utils = require('./webpack.util.js')

//打包之前删除build文件夹
utils.deleteFolderRecursive('./build')

let publicPath='./'
    ,updateTime=new Date().getTime()

console.log(utils.getAllFileArr('./page'))

module.exports={
  entry:{
    "a/a1/":"./page/a/a1/a1.js",
    "a/a2/":"./page/a/a2/a2.js",
    "a/a3/":"./page/a/a3/a3.js",
    react:'react',
    jquery:'jquery'
  },
  output:{
    path:__dirname+'/build',
    publicPath:publicPath,
    filename:`a/[name].js`
  },
  module:{
    rules:[
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },{
        test:/\.(css|scss)$/,
        // loader:"style-loader!css-loader!postcss-loader!sass-loader"
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader!postcss-loader!sass-loader"
        })
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff)$/,
        loader: 'file-loader',
        options: {
          name: 'source/[name].[ext]?[hash]'
        }
      }
    ]
  },
  resolve:{
    extensions:['.scss', '.js','.jsx'],
    alias: {
      'bassCss':__dirname+'/src/css',
      'image':__dirname+'/src/image',
      'components':__dirname+'/src/script/components'
    }
  },
  devServer: {
    // contentBase: "./dist",//本地服务器所加载的页面所在的目录
    // historyApiFallback: true, //不跳转
    noInfo:true,
    host:'192.168.102.103',
    port:'4001'
  },
  plugins:[
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
    // 公共代码单独打包
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common', //对外吐出的chuank名
      chunks:Object.keys(utils.getEntry(utils.getAllFileArr('./src/script'))), //数组，需要打包的文件[a,b,c]对应入口文件中的key
      minChunks:4, //chunks至少引用4次的时候打包
      filename: 'script/[name].js' //打包后的文件名
    })
  ]
}

module.exports.plugins.push(new ExtractTextPlugin("[name].css?[hash]"))

//复制 config.xml 到 build目录下
module.exports.plugins.push(function(){

    return this.plugin('done', function(stats) {
          // 创建读取流
          var readable = fs.createReadStream( './devconfig.xml');
          // 创建写入流
          var writable = fs.createWriteStream( './build/config.xml' );

          // 通过管道来传输流
          readable.pipe( writable );
    });
});


//将html文件打包
var html_list=utils.getAllFileArr('./page');
html_list.forEach((item)=>{
  var name = item[2];

  if(/\.html$/.test(item[0])){
    var prex=''//item[1].indexOf('html')>-1?'html/':''
    module.exports.plugins.push(
      new htmlWebpackPlugin({ //根据模板插入css/js等生成最终HTML
          // favicon: './src/images/favicon.ico', //favicon路径，通过webpack引入同时可以生成hash值
          filename: prex+item[0],
          template: name, //html模板路径
          inject: true, //js插入的位置，true/'head'/'body'/false
          hash: true, //为静态资源生成hash值
          chunks: [item[0].slice(0,-5),'common'],//需要引入的chunk，不配置就会引入所有页面的资源
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
})




//生产模式打包的时候进行代码压缩合并优化
if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#eval-source-map'
  module.exports.output.publicPath='./'

  //发布时给文件名加上时间
  module.exports.plugins[module.exports.plugins.length-1]=new ExtractTextPlugin(`css/${updateTime}_[name].css?[hash]`);
  module.exports.output.filename=`script/${updateTime}_[name].js`;

  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    })
  ])
}
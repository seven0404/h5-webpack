const fs =require('fs')
const devMode = process.env.NODE_ENV !== 'production';
const apiConfig = process.env.npm_config_api

//获取入口文件对象
function getEntry(file_list){
  var entry={};
  file_list.forEach((item)=>{
    if(/.*\.js$|.*\.css$|.*\.less$/.test(item[0])){
        var re =new RegExp("^" + process.env.npm_config_pro + "/");
        if(re.test(item[3])){
            entry[item[2].split("page/")[1].replace(/.less$/,'.css')]=item[2]
        }
    }
  })
  return entry;
  /*entry 看起来就是这样
      {
          a: './src/scripts/a.js',
          b: './src/scripts/b.js',
          index: './src/scripts/index.js'
      }
  */
}

function getKey(item){
    let arr = []
    arr.push(item[2].split("page/")[1].replace(/\.html$/,'.js'))
    arr.push(item[2].split("page/")[1].replace(/\.html$/,'.css'))
    
    return arr
}

function getImgEntry(file_list){
    var imgArray=[];
    var re =new RegExp("^" + process.env.npm_config_pro + "/");
    file_list.forEach((item)=>{
        if(re.test(item[3]) && /\.(jpe?g|png|gif|svg)$/i.test(item[0])){
            let data = {}
            data.from = item[2]
            data.to = item[2].replace('./page', '.')
            imgArray.push(data)
        }
    })
    return imgArray;
    /*entry 看起来就是这样
    [
      { from: 'source', to: 'dest' },
      { from: 'other', to: 'public' },
    ]
  */
}

//  dev1, dev2,test1,test2, prod的请求域名。对应启动服务的请求域名copy 配置文件
function getApiConfigEntry(){
    console.log('apiConfig',apiConfig)
   switch(apiConfig){
       case 'dev1': return  [{ from: './config/dev/zcq-dev1/config.js', to:  process.env.npm_config_pro  +'/config/config.js' }]; break;
       case 'dev2': return  [{ from: './config/dev/zcq-dev2/config.js', to: process.env.npm_config_pro  +'/config/config.js' }]; break;
       case 'test1':  return [{ from: './config/test/zcq-test1/config.js', to: process.env.npm_config_pro  +'/config/config.js' }]; break;
       case 'test2':  return [{ from: './config/dev/zcq-test2/config.js', to: process.env.npm_config_pro  +'/config/config.js' }]; break;
       case 'prod': return  [{ from: './config/prod/config.js', to: process.env.npm_config_pro  +'/config/config.js' }]; break;
       default: return  [{ from: './config/dev/zcq-dev1/config.js', to: process.env.npm_config_pro  +'/config/config.js' }]; break;
   }
    
    /*entry 看起来就是这样
    [
        { from: './page/h5/img/1.jpg', to: 'img/1.jpg' },
        { from: './page/h5/img/2.jpg', to: 'img/2.jpg' },
    ]
  */
}

//递归遍历所有文件
function getAllFileArr(path){
    var AllFileList=[];
    getAllFile(path)
    function getAllFile(path) {
        var files = [];
        if( fs.existsSync(path) ) {   //是否存在此路径
            files = fs.readdirSync(path);
            files.forEach(function(file,index){
                var curPath = path + "/" + file;
                if(fs.statSync(curPath).isDirectory()) { // recurse 查看文件是否是文件夹
                    getAllFile(curPath);
                } else {
                    if(file!=='.DS_Store'){
                        let pa = path.replace('./page/','') + '/'
                        AllFileList.push([file,path,curPath,pa])
                    }
                }
            });
        }
    };
    /*
        最后AllFileList 看起来就是这样
        [ [ 'a.js', './src/scripts/', './src/scripts/a.js' ],
          [ 'b.js', './src/scripts/', './src/scripts/b.js' ],
          [ 'index.js', './src/scripts/', './src/scripts/index.js' ] ]
     */
    return AllFileList;
}

//删除文件夹 ，递归删除
function deleteFolderRecursive(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse 查看文件是否是文件夹
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

module.exports = {
    getApiConfigEntry,
    deleteFolderRecursive,
    getAllFileArr,
    getImgEntry,
    getKey,
    getEntry
} 



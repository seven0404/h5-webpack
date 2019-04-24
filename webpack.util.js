let fs =require('fs')

//获取入口文件对象
function getEntry(file_list){
  var entry={};
  file_list.forEach((item)=>{
    if(/\.js$/.test(item[0])){
        var re =new RegExp("^" + process.env.npm_config_prd + "/");
        if(re.test(item[3])){
            console.log('entry',item[3]+item[0].split('.')[0])
            entry[item[3]+item[0].split('.')[0]]=item[2]
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
exports.getEntry = getEntry;

function getKey(item){
    var re =new RegExp("^" + process.env.npm_config_prd + "/");
    if(re.test(item[3])){
        console.log('getKey',item[3]+item[0].split('.')[0])
        return item[3]+item[0].split('.')[0]
    }
    
}

exports.getKey = getKey;


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
exports.getAllFileArr=getAllFileArr;


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

exports.deleteFolderRecursive=deleteFolderRecursive;
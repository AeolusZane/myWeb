var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

//1.发送文件及错误响应
function send404(response){
    response.writeHead(404,{'Content-Type': 'text/plain'});
    response.write("404err:can't find file");
    response.end();
}//访问的文件不存在，返回404错误

function sendFile(response,filePath,fileContents){
    response.writeHead(
        200,
        {"Content-type":mime.lookup(path.basename(filePath))}
    );
    response.end(fileContents);
}//服务器文件发送到客户端

function serverStatic(response,cache,absPath){
    if(cache[absPath]){                             //检查文件是否缓存在内存中
        sendFile(response,absPath,cache[absPath]);      //从内存中读取文件
    }else{
        fs.exists(absPath,function(exists){              //检查文件是否存在
            if(exists){
                fs.readFile(absPath,function(err,data){     //从硬盘读取文件
                    if(err){
                        send404(response);
                    }else{
                        cache[absPath] = data;
                        sendFile(response,absPath,data);    //从硬盘中读取文件并返回
                    }
                });
            } else{
                send404(response);                      //硬盘文件不存在，返回错误
            }
        });
    }
}

//2.创建http服务器
var server = http.createServer(function(request,response){      //创建http服务器
    var filePath = false;

    if(request.url == '/'){
        filePath = './public/index.html';     //确定返回的默认HTML文件
    }else{
        filePath = './public'+request.url;    //将URL路径转为文件相对路径
    }

    var absPath = './'+filePath;
    serverStatic(response,cache,absPath);   //返回静态文件
});
server.listen(3000,function(){
    console.log("Server listening on port 3000...");
});

var chatServer = require('./lib/chat_server');
chatServer.listen(server);
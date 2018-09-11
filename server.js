var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

//1.�����ļ���������Ӧ
function send404(response){
    response.writeHead(404,{'Content-Type': 'text/plain'});
    response.write("404err:can't find file");
    response.end();
}//���ʵ��ļ������ڣ�����404����

function sendFile(response,filePath,fileContents){
    response.writeHead(
        200,
        {"Content-type":mime.lookup(path.basename(filePath))}
    );
    response.end(fileContents);
}//�������ļ����͵��ͻ���

function serverStatic(response,cache,absPath){
    if(cache[absPath]){                             //����ļ��Ƿ񻺴����ڴ���
        sendFile(response,absPath,cache[absPath]);      //���ڴ��ж�ȡ�ļ�
    }else{
        fs.exists(absPath,function(exists){              //����ļ��Ƿ����
            if(exists){
                fs.readFile(absPath,function(err,data){     //��Ӳ�̶�ȡ�ļ�
                    if(err){
                        send404(response);
                    }else{
                        cache[absPath] = data;
                        sendFile(response,absPath,data);    //��Ӳ���ж�ȡ�ļ�������
                    }
                });
            } else{
                send404(response);                      //Ӳ���ļ������ڣ����ش���
            }
        });
    }
}

//2.����http������
var server = http.createServer(function(request,response){      //����http������
    var filePath = false;

    if(request.url == '/'){
        filePath = './public/index.html';     //ȷ�����ص�Ĭ��HTML�ļ�
    }else{
        filePath = './public'+request.url;    //��URL·��תΪ�ļ����·��
    }

    var absPath = './'+filePath;
    serverStatic(response,cache,absPath);   //���ؾ�̬�ļ�
});
server.listen(3000,function(){
    console.log("Server listening on port 3000...");
});

var chatServer = require('./lib/chat_server');
chatServer.listen(server);
var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

exports.listen = function(server){
    io = socketio.listen(server);   //启动socketio服务器，允许它搭载在已有的http服务器上
    io.set('log level',1);

    io.sockets.on('connection',function(socket){    //定义每个用户连接的处理逻辑
        guestNumber = assignGuestName(socket,guestNumber,nickNames,namesUsed);  //用户连接上来时赋予访客名
        
        joinRoom(socket,'Apple');   //用户连接上时把他放入聊天室Apple

        handleMessageBroadcasting(socket,nickNames);    //处理用户的消息，更名，以及聊天室的创建和变更
        handleNameChangeAttempts(socket,nickNames,namesUsed); 
        handleRoomJoining(socket);

        socket.on('rooms',function(){   //用户发出请求时，向其提供已经被占用的聊天室列表
            socket.emit('rooms',io.sockets.manager.rooms);
        });

        handleClientDisconnection(socket,nickNames,namesUsed);  //定义用户断开连接后的清除逻辑
    });
};


//1.分配昵称
function assignGuestName(socket, guestNumber,nickNames,namesUsed){
    var name = 'Guest' + guestNumber;   //生成新昵称
    nickNames[socket.id] = name;        //把用户昵称跟客户端连接ID关联上
    socket.emit('nameResult',{          //让用户知道他们的昵称
        success:true,
        name:name
    });
    namesUsed.push(name);   //存放已经被占用的昵称
    return guestNumber + 1; //增加用来生成昵称的计数器
}
//2.加入房间
function joinRoom(socket,room){
    socket.join(room);  //让用户进入房间
    currentRoom[socket.id] = room;  //记录用户当前房间
    socket.emit('joinResult',{room:room});  //让用户知道他们进入了新的房间
    socket.broadcast.to(room).emit('message',{   //让房间里其他用户知道新用户进入了房间
        text:nickNames[socket.id] + ' 加入了房间：' + room +'.'
    });

    var usersInRoom = io.sockets.clients(room); //确定有哪些用户在这个房间里
    if(usersInRoom.length>1){   //如果不止一个用户在房间里，汇总一下都有谁
        var usersInRoomSummary = '现在在'+room+'内的用户有'+'： ';
        for(var index in usersInRoom){
            var userSocketId = usersInRoom[index].id;
            if(userSocketId != socket.id){
                if(index > 0){
                    usersInRoomSummary +=', ';
                }
            usersInRoomSummary += nickNames[userSocketId];
            }
        }
        usersInRoomSummary += '.';
        socket.emit('message',{text:usersInRoomSummary});   //将房间里其他用户的汇总发送给这个用户
    }
}

//3.处理昵称变更请求
function handleNameChangeAttempts(socket,nickNames,namesUsed){
    socket.on('nameAttempt',function(name){ //添加nameAttempt事件的监听器
        if(name.indexOf('Guest')==0){   //昵称不能以Guest开头
            socket.emit('nameResult',{
                success:false,
                message:'Names cannot begin with "Guest".'
            });
        }else{
            if(namesUsed.indexOf(name)==-1){ //若昵称没有人使用则注册
                var previousName = nickNames[socket.id];
                var previousNameIndex = namesUsed.indexOf(previousName);
                namesUsed.push(name);
                nickNames[socket.id] = name;
                delete namesUsed[previousNameIndex];    //删掉以前用的昵称，让其他用户可以使用
                socket.emit('nameResult',{
                    success:true,
                    name:name
                });
                socket.broadcast.to(currentRoom[socket.id]).emit('message',{
                    text:previousName + ' 改名为 ' + name + '.'
                });
            }else{
                socket.emit('nameResult',{  //如果昵称已经被占用，给客户端发送错误信息
                    sccess:false,
                    message:'昵称已被占用.'
                });
            }
        }
    });
}

//4.发送聊天消息
function handleMessageBroadcasting(socket){
    socket.on('message', function(message){
        socket.broadcast.to(currentRoom[socket.id]).emit('message',{
            text:nickNames[socket.id] + ': ' + message.text
        });
    });
}

//5.创建房间
function handleRoomJoining(socket){
    socket.on('join',function(room){
        socket.leave(currentRoom[socket.id]);
        joinRoom(socket,room.newRoom);
    });
}

//6.用户断开连接
function handleClientDisconnection(socket){
    socket.on('disconnect',function(){
        var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
        delete namesUsed[nameIndex];
        delete nickNames[socket.id];
    });
}
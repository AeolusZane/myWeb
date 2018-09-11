var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

exports.listen = function(server){
    io = socketio.listen(server);   //����socketio�����������������������е�http��������
    io.set('log level',1);

    io.sockets.on('connection',function(socket){    //����ÿ���û����ӵĴ����߼�
        guestNumber = assignGuestName(socket,guestNumber,nickNames,namesUsed);  //�û���������ʱ����ÿ���
        
        joinRoom(socket,'Apple');   //�û�������ʱ��������������Apple

        handleMessageBroadcasting(socket,nickNames);    //�����û�����Ϣ���������Լ������ҵĴ����ͱ��
        handleNameChangeAttempts(socket,nickNames,namesUsed); 
        handleRoomJoining(socket);

        socket.on('rooms',function(){   //�û���������ʱ�������ṩ�Ѿ���ռ�õ��������б�
            socket.emit('rooms',io.sockets.manager.rooms);
        });

        handleClientDisconnection(socket,nickNames,namesUsed);  //�����û��Ͽ����Ӻ������߼�
    });
};


//1.�����ǳ�
function assignGuestName(socket, guestNumber,nickNames,namesUsed){
    var name = 'Guest' + guestNumber;   //�������ǳ�
    nickNames[socket.id] = name;        //���û��ǳƸ��ͻ�������ID������
    socket.emit('nameResult',{          //���û�֪�����ǵ��ǳ�
        success:true,
        name:name
    });
    namesUsed.push(name);   //����Ѿ���ռ�õ��ǳ�
    return guestNumber + 1; //�������������ǳƵļ�����
}
//2.���뷿��
function joinRoom(socket,room){
    socket.join(room);  //���û����뷿��
    currentRoom[socket.id] = room;  //��¼�û���ǰ����
    socket.emit('joinResult',{room:room});  //���û�֪�����ǽ������µķ���
    socket.broadcast.to(room).emit('message',{   //�÷����������û�֪�����û������˷���
        text:nickNames[socket.id] + ' �����˷��䣺' + room +'.'
    });

    var usersInRoom = io.sockets.clients(room); //ȷ������Щ�û������������
    if(usersInRoom.length>1){   //�����ֹһ���û��ڷ��������һ�¶���˭
        var usersInRoomSummary = '������'+room+'�ڵ��û���'+'�� ';
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
        socket.emit('message',{text:usersInRoomSummary});   //�������������û��Ļ��ܷ��͸�����û�
    }
}

//3.�����ǳƱ������
function handleNameChangeAttempts(socket,nickNames,namesUsed){
    socket.on('nameAttempt',function(name){ //���nameAttempt�¼��ļ�����
        if(name.indexOf('Guest')==0){   //�ǳƲ�����Guest��ͷ
            socket.emit('nameResult',{
                success:false,
                message:'Names cannot begin with "Guest".'
            });
        }else{
            if(namesUsed.indexOf(name)==-1){ //���ǳ�û����ʹ����ע��
                var previousName = nickNames[socket.id];
                var previousNameIndex = namesUsed.indexOf(previousName);
                namesUsed.push(name);
                nickNames[socket.id] = name;
                delete namesUsed[previousNameIndex];    //ɾ����ǰ�õ��ǳƣ��������û�����ʹ��
                socket.emit('nameResult',{
                    success:true,
                    name:name
                });
                socket.broadcast.to(currentRoom[socket.id]).emit('message',{
                    text:previousName + ' ����Ϊ ' + name + '.'
                });
            }else{
                socket.emit('nameResult',{  //����ǳ��Ѿ���ռ�ã����ͻ��˷��ʹ�����Ϣ
                    sccess:false,
                    message:'�ǳ��ѱ�ռ��.'
                });
            }
        }
    });
}

//4.����������Ϣ
function handleMessageBroadcasting(socket){
    socket.on('message', function(message){
        socket.broadcast.to(currentRoom[socket.id]).emit('message',{
            text:nickNames[socket.id] + ': ' + message.text
        });
    });
}

//5.��������
function handleRoomJoining(socket){
    socket.on('join',function(room){
        socket.leave(currentRoom[socket.id]);
        joinRoom(socket,room.newRoom);
    });
}

//6.�û��Ͽ�����
function handleClientDisconnection(socket){
    socket.on('disconnect',function(){
        var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
        delete namesUsed[nameIndex];
        delete nickNames[socket.id];
    });
}
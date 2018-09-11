var Chat = function(socket){
    this.socket = socket;
};
//发送聊天消息
Chat.prototype.sendMessage = function (room, text) {
    var message = {
        room: room,
        text: text
    } ;
    this.socket.emit( 'message', message ) ;
};
//变更房间
Chat.prototype.changeRoom = function(room){
    this.socket.emit('join',{
        newRoom:room
    });
};
//处理聊天命令的函数：join（加入或创建房间）和nick（修改昵称）
Chat.prototype.processCommand = function(command){
    var words = command.split(' ');
    var command = words[0].substring(1,words[0].length).toLowerCase();//从第一个单词开始解析命令
    var message = false;

    switch(command){
        case 'b':
        words.shift();
        var room = words.join(' ');
        this.changeRoom(room);
        break;
        case 'a':
        var name = words.join(' ');
        name=name.replace("/a ","");
        this.socket.emit('nameAttempt',name);
        break;

        default:
        message = '未知命令.';
        break;
    }

    return message;
};
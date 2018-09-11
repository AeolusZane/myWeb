var Chat = function(socket){
    this.socket = socket;
};
//����������Ϣ
Chat.prototype.sendMessage = function (room, text) {
    var message = {
        room: room,
        text: text
    } ;
    this.socket.emit( 'message', message ) ;
};
//�������
Chat.prototype.changeRoom = function(room){
    this.socket.emit('join',{
        newRoom:room
    });
};
//������������ĺ�����join������򴴽����䣩��nick���޸��ǳƣ�
Chat.prototype.processCommand = function(command){
    var words = command.split(' ');
    var command = words[0].substring(1,words[0].length).toLowerCase();//�ӵ�һ�����ʿ�ʼ��������
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
        message = 'δ֪����.';
        break;
    }

    return message;
};
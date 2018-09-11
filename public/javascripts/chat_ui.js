function divEscapedContentElement(message){
    return $('<div></div>').text(message);
}

function divSystemContentElement(message){
    return $('<div></div>').html(message);
}

function processUserInput(chatApp,socket){
    var message = $('#send-message').val();
    var systemMessage;

    if(message.charAt(0) =='/'){    //����û������������б�ܿ�ͷ��������Ϊ��������
        systemMessage = chatApp.processCommand(message);
        if(systemMessage){
            $('#messages').append(divSystemContentElement(systemMessage));
        }
    }else{
        chatApp.sendMessage($('#room').text(),message); //������������㲥�������û�
        $('#messages').append(divEscapedContentElement(message));
        $('#messages').scrollTop($('#messages').prop('scrollHeight'));
    }

    $('#send-message').val('');
}

var socket = io.connect();

$(document).ready(function(){
    var chatApp = new Chat(socket);

    socket.on('nameResult',function(result){    //��ʾ�������ԵĽ��
        var message;

        if(result.success){
            message = '�����ǳ�Ϊ�� ' + result.name + '.';
        }else{
            message = result.message;
        }
        $('#messages').append(divSystemContentElement(message));
    });

    socket.on('joinResult',function(result){    //��ʾ���������
        $('#room').text(result.room);
        $('#message').append(divSystemContentElement('�����Ѹ���'));
    });

    socket.on('message',function(message){      //��ʾ���ܵ�����Ϣ
        var newElement = $('<div></div>').text(message.text);
        $('#messages').append(newElement);
    });
    socket.on('rooms',function(rooms){      //��ʾ���÷�����
        $('#room-list').empty();
        for(var room in rooms){
            room = room.substring(1,room.length);
            if(room!=''){
                $('#room-list').append(divEscapedContentElement(room));
            }
        }

        $('#room-list div').click(function(){   //����ͨ�������������������
            chatApp.processCommand('/b ' + $(this).text());
            $('#send-message').focus();
        });
    });

    setInterval(function(){     //����������÷����б�
        socket.emit('rooms');
    },1000);

    $('#send-message').focus();

    $('#send-form').submit(function(){      //�ύ�����Է���������Ϣ
        processUserInput(chatApp,socket);
        return false;
    });
});
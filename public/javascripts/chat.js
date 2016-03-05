/**
 * Created by NotFound on 05.03.2016.
 */

jQuery(document).ready(function(){
    var socket = io.connect();
    var message = jQuery("#message");
    var messages = jQuery("#chatMessages");
    var messageTemplate = jQuery('#chatMessages > .panel:first');
    var userTemplate = jQuery('<p class="label label-default">New user</p>');
    var userList = jQuery('#users');
    var templateAlert = jQuery('.alert-info');

    jQuery("#sendMessage").submit(function(event){
        event.preventDefault();
        socket.emit("sendMessage", message.val());
        message.val("");
    });

    jQuery("#getName").submit(function(event){
        var name = jQuery("#name").val();
        event.preventDefault();
        socket.emit("newUser", name, function(result) {
            if (result && result === true) {
                jQuery('#username').html(name);
                jQuery('#chatWrapper').show();
                jQuery(event.target).parent().hide();
            } else {
                alert('This name is already taken');
            }
        });

    });

    socket.on('newMessage', function(data){
        var time = new Date().toLocaleTimeString('en-US', {
            hour12: false,
            hour: "numeric",
            minute: "numeric"
        });
        var msg = messageTemplate.clone();
        msg.find('.panel-title').html(time + ' | ' + data.username);
        msg.find('.panel-body').html(data.message);
        msg.show();
        messages.prepend(msg[0].outerHTML);
    });

    socket.on('updateUsers', function(users){
        //show all current users
        userList.html('');
        for (var i in users) {
            userList.prepend(userTemplate.clone().html(users[i]));
        }
    });

    socket.on('initMessages', function(data){
        messages.html('');
        for (var i in data) {
            var time = new Date(parseInt(data[i].time));
            var msg = messageTemplate.clone();
            msg.find('.panel-title').html(time.getHours() + ':' + time.getMinutes() + ' | ' + data[i].username);
            msg.find('.panel-body').html(data[i].text);
            msg.show();
            messages.prepend(msg[0].outerHTML);
        }
    });

    socket.on('exitUser', function(data){
        var msg = templateAlert.clone();
        msg.find('#info-msg').html(data + ' left this chat');
        msg.show();
        jQuery('body').prepend(msg);
    });

});
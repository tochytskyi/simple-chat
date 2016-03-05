var mysql = require("mysql");

// First you need to create a connection to the db
var con = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "nodejs_chat"
});

con.connect(function(err){
    if(err){
        console.log('Error connecting to Db');
        return;
    }
    console.log('Connection established');
});



var socketListener = {
    //all current user in the chat
    usernames: [],

    listener: function (io) {
        io.sockets.on("connection", function (socket) {

            //init all messages
            con.query('SELECT * FROM `message`', function(err, rows){
                if (err) throw err;
                socket.emit("initMessages", rows);
            });

            socket.on("newUser", function (data, callback) {
                socketListener.getUsernames(function(allUsers) {
                    //check for unique username
                    if (allUsers.indexOf(data) == -1){
                        //new user: insert him into the `user` table
                        con.query('SELECT MAX(id) as nextId FROM `user`', function(err, rows){
                            socket.userId = rows[0].nextId;
                        });
                        con.query('INSERT INTO user SET ?', {name: data}, function(err,res){
                            if(err) throw err;
                            socketListener.usernames.push(data);
                            socket.username = data;
                            io.sockets.emit("updateUsers", socketListener.usernames);
                            callback(true);
                        });
                    } else {
                        //find existing user and get his ID
                        con.query('SELECT * FROM `user` WHERE `name`=?', [data], function(err, rows){
                            if (err) throw err;
                            if (rows.length && rows.length == 1) {
                                socket.userId = rows[0].id;
                                socket.username = data;
                                socketListener.usernames.push(data);
                                io.sockets.emit("updateUsers", socketListener.usernames);
                                callback(true);
                            }
                        });
                    }
                });
            });

            socket.on("sendMessage", function (data) {
                var msg = {
                    message: data,
                    username: socket.username
                };
                var messageData = {
                    text: data,
                    user_id: socket.userId,
                    username: socket.username,
                    time: Date.now()
                }
                con.query('INSERT INTO message SET ?', messageData, function(err,res){
                    if(err) throw err;
                    io.sockets.emit("newMessage", msg);
                });
            });

            socket.on('disconnect', function(data){
                if (!socket.userId) {
                    return;
                }
                socketListener.usernames.splice(socket.username, 1);
                io.sockets.emit("exitUser", socket.username);
                io.sockets.emit("updateUsers", socketListener.usernames);
            });
        });
    },

    getUsernames: function(callback) {
        con.query('SELECT * FROM `user`', function(err, rows){
            if(err) throw err;
            var users = [];
            for (var i in rows) {
                users.push(rows[i].name);
            }
            if (callback) {
                callback(users);
            }
            return users;
        });
    }
}
module.exports = socketListener;

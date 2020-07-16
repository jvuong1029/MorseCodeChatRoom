/*
    References:
	https://itnext.io/build-a-group-chat-app-in-30-lines-using-node-js-15bfe7a2417b
	https://medium.com/@bhanushali.mahesh3/creating-a-simple-website-with-node-js-express-and-ejs-view-engine-856382a4578f
	https://www.youtube.com/watch?v=vV28ilGSJGQ
*/

// needed for app and server
const express = require("express");
const app = express(); // init app
const http = require("http").Server(app);
const io = require("socket.io")(http); // socket.io instantiation
var path = require("path");

// pages for app
var index = require("./routes/index");
var chatroom = require("./routes/chatroom");

// view engine setup, ejs
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// set path for static assets
app.use(express.static("./public")); // public folder

// routes
app.use("/", index);
// app.get("/", (req, res) => res.render("index")); // another way of doing the above line
app.use("/chatroom", chatroom);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error("Not Found");
	err.status = 404;
	next(err);
});

// error handler
app.use(function (err, req, res, next) {
	// render the error page
	res.status(err.status || 500);
	res.render("error", { status: err.status, message: err.message });
});

module.exports = app;

// when server is started (seen on terminal)
// viewed at http://localhost:port (ex. http://localhost:8080)
const port = 8080;
const server = http.listen(port, function () {
	console.log(`Listening on *: ${port}`);
});

// clients opened with "http://localhost:8080/"
io.sockets.on("connection", function (socket) {
	// when new user joins the server (new client is opened)
	socket.on("username", function (username) {
		socket.username = username;
		// console.log is what prints on terminal
		console.log("New user on the server, named: " + socket.username);
		// io.emit is what prints on the client
		io.emit("is_online", socket.username + " joined the chat..</i>");
	});

	// when user closes out client
	socket.on("disconnect", function (username) {
		console.log(socket.username + " has left the chat");
		io.emit("is_online", socket.username + " left the chat..</i>");
	});

	// send message to append
	socket.on("chat_message", function (message) {
		io.emit(
			"chat_message",
			"<strong>" + socket.username + "</strong>: " + message
		);
	});

	// communication with p5 sketch background on client
	socket.on("wordPush", function (word) {
		console.log(word);
		io.emit("wordPush", word);
	});
});

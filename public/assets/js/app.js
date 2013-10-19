/**
 * App - Main controller
 * This file handles the control of all game dependencies
 * and acts as the coordinator between all files.
 * 
 * https://github.com/Open-RPG/open-rpg
 * 
 * License: GNU GENERAL PUBLIC LICENSE
 */

define(["jquery", "open_rpg", "chat", "map", "character", "socket"], function($, OpenRPG, ChatOpenRPG, MapOpenRPG,CharacterOpenRPG, io){
	var App = {};
	
	/**
	 * Start setting up the game
	 * @param {Object} DOM object where the game will live (A div element normally)
	 * @param {Object} Size of the container in {w:_,h:_} format 
	 */
	App.init = function(gameContainer, size){
		OpenRPG.container = gameContainer;
		OpenRPG.size = size;
		
		if(!OpenRPG.logged()){
			App.displayLogin();
		}else{
			OpenRPG.start();
		}
	};
	
	/**
	 * Displays a login box and handles its events. 
	 */
	App.displayLogin = function(){
		$(OpenRPG.container).append('<h2>Login:</h2><form action="/" method="post" id="loginForm">Usuario: <input type="text" name="user" id="username" /> Contraseña: <input type="password" name="pass" id="pass" /> <input type="submit" value="Login" /><p>Not a user? <a href="/register.html">Register!</a></p></form>');
		
		// Process the form
		$('#loginForm').submit(function(event){
			event.preventDefault();
			
			App.socketStart($('#username').val(), $('#pass').val());
		});
	};
	
	
	/**
	 * Create a new socket connection with the serve.
	 * The username and password are required for the handshake authorization.
	 * @param {String} User name
	 * @param {String} Password 
	 */
	App.socketStart = function(user, pass){
		console.log("Opening socket connection");
		console.time('Socket connected');
		OpenRPG.socket = io.connect(OpenRPG.socketHost, { query: "user="+user+"&pass="+pass });
		
		// Launch game
		OpenRPG.start();
		
		OpenRPG.socket.on('connect', function () {
			console.timeEnd("Socket connected");
			
			// Setup username
			OpenRPG.user.name = user;
			
			// Server notifications
			OpenRPG.socket.emit('subscribe', 'server');
			
			// Setup map
		 	MapOpenRPG.drawBaseSheet(OpenRPG.canvas.canvasElement, OpenRPG.canvas.size);
		 	
		 	// Setup chat
		 	ChatOpenRPG.init($('#chatOut').get(0), $('#chatIn').get(0));
		});
		
		// Process server messages
		OpenRPG.socket.on('usersOnline', function (data) {
 			if(data.count){
 				$('#usersOnline').text(data.count+' online');
 			}
		});
		
		OpenRPG.socket.on('error', function (err) {
			window.location = '/';
			console.error("Error de conextion: ",err);
		});
	};
	
	return App;
});
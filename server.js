var colors = require("colors");
var forwardPackets = require("./packets");
var mc = require("minecraft-protocol");
module.exports = function(client, swears, argv) {
	var server = mc.createServer({
		"online-mode": false,
		"host": "localhost",
		"port": 25564,
		"max-players": 1,
		"motd": "MCCussFilter Proxy"
	});
	var buffer = [];
	
	forwardPackets.fromserver.forEach(function(v) {
		client.on(parseInt(v), function(e) {
			buffer.push([parseInt(v), e]);
		});
	});
	
	setTimeout(function() {
		console.log("Server ready on localhost:25564".green);
		
		server.on("login", function(player) {
			var going = true;
			console.log("Client connected".green);
			
			client.on("end", function() {
				going = false;
				client.write(0xFF, {
					reason: "Quitting"
				});
				console.log("Client diconnected".orange);
				setTimeout(process.exit, 500);
			});
			
			forwardPackets.fromplayer.forEach(function(v) {
				player.on(parseInt(v), function(e) {
					client.write(parseInt(v), e);
				});
			});
			
			player.on(0x03, function(e) {
				var msg = e.message;
				var clean = true;
				
				msg = msg.split(".").join(" ");
				msg = msg.split(",").join(" ");
				msg = msg.split("!").join(" ");
				msg = msg.split(";").join(" ");
				msg = msg.split(" ");
				msg.forEach(function(v) {
					swears.forEach(function(w) {
						if (v.toLowerCase() == w.toLowerCase()) {
							clean = false;
						}
					});
				});
				
				if (clean) {
					client.write(0x03, e);
				} else {
					client.write(0x03, {
						message: "MCCussFilter: Someone tried to say a naughty word!"
					});
				}
			});
			
			setInterval(function() {
				if (going) {
					buffer.forEach(function(v) {
						player.write(v[0], v[1]);
					});
					buffer = [];
				}
			}, 50);
			
		});
		
	}, 1000 * 10);
};
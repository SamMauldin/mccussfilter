var mc = require("minecraft-protocol");
var argv = require("optimist")
	.usage("$1 -i [server ip] -p [server port(25565)] -u [mc username/email] -c [mc password]")
	.demand(["i", "u", "c"])
	.default("p", 25565)
	.argv;

var colors = require("colors");
console.log("Downloading swear word list".yellow);

var request = require("request");
request("http://files.fluidnode.com/hidden/swear.txt", function (err, res, body) {
	if (err) {
		console.log(("Error: " + err).red);
		return;
	}
	
	console.log("Parsing swear list".yellow);
	var swears = body.split("\n");
	swears.push("cussfiltertest");
	
	console.log("Connecting to server".yellow);
	var c = mc.createClient({
		host: argv.i,
		port: argv.p,
		username: argv.u,
		password: argv.c
	});
	
	c.on("connect", function() {
		console.log("Connected to server".green);
		
		c.on(0x03, function(e) {
			var msg = JSON.parse(e.message);
			console.log(msg);
		});
		
		c.on(0xFF, function(e) {
			console.log(("Kicked: " + e.reason).red);
			process.exit();
		});
		
		console.log("Creating server".yellow);
		require("./server")(c, swears, argv);
	});
});
var room_avail = require("./room-avail.js");
var http = require('http');
var static = require("node-static");
var url = require("url");
var querystring = require("querystring");
var file = new static.Server('html', {
  headers: {
    //"Content-Security-Policy": "default-src 'self'; object-src 'none';",
  }
});

room_avail.startPolling();

const PORT = process.env.PORT || 4000;
require ('http').createServer(function (req, res) {
  req.addListener('end', function () {
    var par = url.parse(req.url);
    if (par.pathname.indexOf("/status") !== 0) {
        file.serve(req, res);
    }    
    else {    
        if (par.query == "overview") {
            var body = JSON.stringify(room_avail.ROOMSTATUS);
            res.writeHead(200, {
                'Content-Length': body.length,
                'Content-Type': 'application/json' });
            res.write(body);
        }
        else if (par.query == "room") {
            var body = room_avail.whatsFree();
            res.writeHead(200, {
                'Content-Length': body.length,
                'Content-Type': 'text/plain' });
            res.write(body);
        }
        else {
            res.statusCode = 400;
            return res.end('I dont know what you want');
            }
    }
  }).resume();
}).listen(PORT);
console.log("listening on "+PORT);
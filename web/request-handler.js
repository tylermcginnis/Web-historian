var http = require('http');
var path = require('path');
var fs = require('fs');
module.exports.datadir = path.join(__dirname, "../data/sites.txt"); // tests will need to override this.

var handleRequest = function (req, res) {
  if(req.method === 'GET'){
    if(req.url === '/' || req.url === '/styles.css'){
      handleStaticRequests(req, res);
    } else{
       handleGet(req, res);
    }
  } else if(req.method === 'POST'){
    handlePost(req, res);
  }
};

var handleGet = function(request, response){
  request.on('error', function(){
    response.writeHead(404);
    response.end();
  });
  var htmlFile = fs.createReadStream('../data/sites.txt');
  htmlFile.pipe(response);
};

var handlePost = function(request, response){
  var result = '';
  request.on('data', function(chunk){
    result+=chunk;
  });
  request.on('end', function(){
    var parsedData = result.toString() + '\n';
    var newParsed = parsedData.slice(4);
    fs.appendFile('../data/sites.txt', newParsed, function(err){
      if(err){
        console.log('there was an error');
        response.writeHead(404);
      } else{
        handleStaticRequests(request, response); 
      }
    });
  });
};

var handleStaticRequests = function(request, response) {
  var filePath = request.url;
  if (filePath === '/') {
    filePath = '/index.html';
  } 
  
  var extname = path.extname(filePath);
  var contentType = 'text/html';
  switch (extname) {
    case '.js':
    contentType = 'text/javascript';
    break;
    case '.css':
    contentType = 'text/css';
    break;
  }

  fs.exists( __dirname + '/public' + filePath, function(exists){
    if(exists) {
      fs.readFile( __dirname + '/public' + filePath, function(error, content) {
        if (error) {
          response.writeHead(500);
          response.end();
        }
        else {
          response.writeHead(200, { 'Content-Type': contentType });
          response.end(content.toString());
        }
      });
    }
    else {
      response.writeHead(404);
      response.end();
    }
  });
};


exports.handleRequest = handleRequest;
exports.handleGet = handleGet;
exports.handlePost = handlePost;
exports.handleStaticRequests = handleStaticRequests;
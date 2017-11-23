'use strict'

var http = require('http'),
    fs = require('fs'), 
    querystring = require('querystring'),
    validExtensions = {
        "css": "text/css",
        "js": "application/javascript",
        "html": "text/html",
        "png": "image/png"
    };

var requestListener = function (request, response) {


    var path = process.cwd();
    var delay = (0.5 + (Math.random() / 2)) * 100;

    if (request.url.indexOf('/api') === 0) {

        path += querystring.unescape(request.url).slice(4);

        var pathStat = fs.lstatSync(path);
        console.log('reqbody', request.body);
        if (request.method == "GET") {
            sendDir(); 
        } else if (request.method == "POST") {
            if (pathStat.isFile()) {
                let body = [];
                request.on('data', (chunk) => {
                    body.push(chunk);
                }).on('end', () => {
                    body = Buffer.concat(body).toString();
                    console.log('body......', body);
                    fs.writeFile(path, body, function (err) {
                        if (err) throw err;
                        console.log("It's saved");
                    }); 
                   }); 
                response.end("Saved....");
            }

        } else {
            response.end("Undefined request .");
        }

        function sendDir() {
            if (pathStat.isDirectory()) {
                fs.readdir(path, function (err, map) {
                    if (!err) {
                        var directories = map.filter(function (dirPath) {
                                return fs.lstatSync(path + '/' + dirPath).isDirectory() && dirPath.indexOf('.') !== 0;
                            }),
                            files = map.filter(function (filePath) {
                                return fs.lstatSync(path + '/' + filePath).isFile() && filePath.indexOf('.') !== 0;
                            });

                        response.writeHead(200, {
                            'Content-Type': 'application/json'
                        });
                        response.write(JSON.stringify({
                            'diretories': directories,
                            'files': files
                        }));
                        response.end();

                    } else {
                        response.wrteHead(400);
                        response.end(err);
                    }
                });
            } else {
                try {
                    response.writeHead(200, {
                        'Content-Type': 'application/octet-stream'
                    });
                    response.write(fs.readFileSync(path));
                    response.end();
                } catch (e) {
                    response.writeHead(500);
                    response.end();
                }
            }
        }

    } else {
        var file = 'public' + (request.url == '/' ? '/index.html' : request.url),
            ext = file.split('.').pop(),
            contentType = validExtensions[ext] || 'application/octet-stream';

        if (fs.existsSync(file)) {
            response.writeHead(200, {
                'Content-Type': contentType
            });
            response.write(fs.readFileSync(file));
            response.end();
        } else {
            response.writeHead(400);
            response.end();
        }
    }
};

var server = http.createServer(requestListener);
server.listen(8080);
console.log('Sever listen on localhost:8080');
//Create the HTTP server instance
const http = require('http');
const PORT = process.env.PORT || 8000;
const fs = require('fs');
const querystring = require('querystring');

const server = http.createServer((req, res) => {
  console.log('\nreq method:', req.method);
  console.log('req.headers:', req.headers);
  console.log('req.url:', req.url);

  let callback = (err, data) => {
    let statusCode = 200;
    res.writeHead(statusCode, { "Content-Type": "text/html" });
    res.write(data);
    res.end();
  }

  if (req.method === "GET") {
    if (req.url === "/css/styles.css") {
      fs.readFile("./public/css/styles.css", "utf-8", (err, data) => {
        res.writeHead(200, { "Content-Type": "text/css" });
        res.write(data);
        res.end();
      });
    }
    else if (req.url === "/helium") {
      fs.readFile("./public/helium.html", "utf-8", callback);
    }
    else if (req.url === "/hydrogen") {
      fs.readFile("./public/hydrogen.html", "utf-8", callback);
    }
    else if (req.url === "/") {
      fs.readFile("./public/index.html", "utf-8", callback);
    }
    else {
      fs.readFile("./public/404.html", "utf-8", (err, data) => {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.write(data);
        res.end();
      })
    }
  }

});

server.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
})

//Create the HTTP server instance
const http = require('http');
const PORT = process.env.PORT || 8000;
const fs = require('fs');
const qs = require('querystring');

const server = http.createServer((req, res) => {
  console.log('\nreq method:', req.method);
  console.log('req.headers:', req.headers);
  console.log('req.url:', req.url);

  /****** POST *****/
  if (req.method === "POST") {

    if (req.url === "/elements") {
      //Store string data into an array
      let body = [];
      //On the 'data' event, push chunk into the body array. 'Chunk' is a Buffer
      req
        .on('data', chunk => {
          //console.log("\nchunk:", chunk);
          body.push(chunk);
          //console.log("data body:", body);
        })
        .on('end', chunk => {
          //'body' has entire request body stored in it as a string. Need to convert buffer to utf-8/to a string
          body = Buffer.concat(body).toString();
          console.log("end body:", body);

          //Parse the body into key value pairs
          let parsedBody = qs.parse(body);
          console.log("parsedBody:\n", parsedBody);

          //Set the content of the response body
          const resBodyContent = `<!DOCTYPE html>
          <html lang="en">
          
          <head>
            <meta charset="UTF-8">
            <title>The Elements - ${parsedBody.elementName}</title>
            <link rel="stylesheet" href="/css/styles.css">
          </head>
          
          <body>
            <h1>${parsedBody.elementName}</h1>
            <h2>${parsedBody.elementSymbol}</h2>
            <h3>Atomic number ${parsedBody.elementAtomicNumber}</h3>
            <p>${parsedBody.elementName} is a chemical element with chemical symbol ${parsedBody.elementSymbol} and atomic number ${parsedBody.elementAtomicNumber}.</p>
            <p><a href="/">back</a></p>
          </body>

          </html>`;

          fs.writeFile(`./public/${parsedBody.elementName}.html`,
            resBodyContent, err => {
              if (err) {
                res.writeHead(500);
                res.write('{status: stay broke}');
                res.end();
              }
              else {
                res.writeHead(200);
                res.write('{status: OK}');
                res.end();
              }
            });
        });
    }
  }

  /****** GET *****/

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
    else if (req.url === "/404") {
      fs.readFile("./public/404.html", "utf-8", (err, data) => {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.write(data);
        res.end();
      })
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

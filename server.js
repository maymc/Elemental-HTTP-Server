//Create the HTTP server instance
const http = require('http');
const PORT = process.env.PORT || 8000;
const fs = require('fs');
const qs = require('querystring');
let givenURLs = ["/", "/hydrogen.html", "/helium.html"];
let elementsArr = [, "Hydrogen", "Helium"];

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
      req.on('data', chunk => {
        //console.log("\nchunk:", chunk);
        body.push(chunk);
        // console.log("data body:", body);

      }).on('end', chunk => {
        //'body' has entire request body stored in it as a string. Need to convert buffer to utf-8/to a string
        body = Buffer.concat(body).toString();
        console.log("end body:", body);

        //Parse the body into key value pairs
        let parsedBody = qs.parse(body);
        console.log("parsedBody:\n", parsedBody);

        givenURLs.push(`/${parsedBody.elementName.toLowerCase()}.html`);
        console.log("new GivenURLs:", givenURLs);

        elementsArr.push(`${parsedBody.elementName}`);
        console.log("new elements arr:", elementsArr);

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
            <p>${parsedBody.elementDescription}</p>
            <p><a href="/">back</a></p>
          </body>
          </html>`;

        /****** NEW INDEX.HTML *****/
        //Function to create a new list of elements on the index.html page. This is for auto updating the index
        let listOfElements = ``; //empty template literal string
        let updatedList = (arr1, arr2) => {
          for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== "/") {
              listOfElements += `
                <li>
                <a href="${arr1[i]}">${arr2[i]}</a>
                </li>\r`;
            };
          };
          return listOfElements;
        };

        //Set the content of the new index body
        let newIndexBody = `<!DOCTYPE html>
          <html lang="en">
          
          <head>
            <meta charset="UTF-8">
            <title>The Elements</title>
            <link rel="stylesheet" href="/css/styles.css">
          </head>
          
          <body>
            <h1>The Elements</h1>
            <h2>These are all the known elements.</h2>
            <h3>These are ${givenURLs.length - 1}</h3>
            <ol>
            ${updatedList(givenURLs, elementsArr)}
            </ol>
          </body>
          
          </html>`;

        //Function to save the new index.html file in the public directory
        let createNewIndex = () => {
          fs.writeFile(`./public/index.html`, newIndexBody, err => {
            if (err) {
              res.writeHead(404, { "Content-Type": "application/json" }, { "Success": false });
              res.write('{Success: false}');
              res.end();
            }
            else {
              res.writeHead(200, { "Content-Type": "application/json" }, { "Success": true });
              res.write('{Success: true}');
              res.end();
            }
          });
        }

        //Save the html file in the public directory and run the createNewIndex function to update the index page
        fs.writeFile(`./public/${parsedBody.elementName.toLowerCase()}.html`, resBodyContent, createNewIndex(), err => {
          if (err) {
            res.writeHead(404, { "Content-Type": "application/json" }, { "Success": false });
            res.write('{Success: false}');
            res.end();
          }
          else {
            res.writeHead(200, { "Content-Type": "application/json" }, { "Success": true });
          }
        });
      });
    }
  }

  /****** GET *****/
  else if (req.method === "GET") {

    let callback = (err, data) => {
      let statusCode = 200;
      res.writeHead(statusCode, { "Content-Type": "text/html" });
      res.write(data);
      res.end();
    }
    let callback404 = (err, data) => {
      let statusCode = 404
      res.writeHead(statusCode, { "Content-Type": "text/html" });
      res.write(data);
      res.end();
    }

    console.log("check givenURLs:", givenURLs);

    // if (req.method === "GET") {
    if (req.url === "/css/styles.css") {
      fs.readFile("./public/css/styles.css", "utf-8", (err, data) => {
        res.writeHead(200, { "Content-Type": "text/css" });
        res.write(data);
        res.end();
      });
    }
    else if (givenURLs.includes(req.url)) {
      if (req.url === "/") {
        fs.readFile(`./public/index.html`, "utf-8", callback);
      }
      else {
        fs.readFile(`./public/${req.url}`, "utf-8", callback);
      }
    }
    else if (req.url === "/404.html") {
      fs.readFile("./public/404.html", "utf-8", callback404);
    }
    else {
      fs.readFile("./public/404.html", "utf-8", callback404);
    }
  }

});

server.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
})

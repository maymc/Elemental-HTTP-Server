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

  /****** GET *****/
  if (req.method === "GET") {

    //Callback function for files that pass
    let callback = (err, data) => {
      let statusCode = 200;
      res.writeHead(statusCode, { "Content-Type": "text/html" });
      res.write(data);
      res.end();
    }

    //Error callback function
    let callback404 = (err, data) => {
      let statusCode = 404;
      res.writeHead(statusCode, { "Content-Type": "text/html" });
      res.write(data);
      res.end();
    }

    //DEBUG - check the givenURLs
    console.log("Check givenURLs:", givenURLs);

    //If the file is a css file, get the css file
    if (req.url === "/css/styles.css") {
      fs.readFile("./public/css/styles.css", "utf-8", (err, data) => {
        res.writeHead(200, { "Content-Type": "text/css" });
        res.write(data);
        res.end();
      });
    }
    //Else if user requested for a specific element page, get the element page
    else if (givenURLs.includes(req.url)) {
      //If no uri is given, provide the index page
      if (req.url === "/") {
        fs.readFile(`./public/index.html`, "utf-8", callback);
      }
      //Else provide the specified page
      else {
        fs.readFile(`./public/${req.url}`, "utf-8", callback);
      }
    }
    //Else if user requests for 404 page, call the error callback function and provide the 404 page
    else if (req.url === "/404.html") {
      fs.readFile("./public/404.html", "utf-8", callback404);
    }
    //Else, if the user types in anything else, call the 404 page
    else {
      fs.readFile("./public/404.html", "utf-8", callback404);
    }
  }

  /****** POST *****/
  else if (req.method === "POST") {

    //HTTP client can issue POST Requests to a specific route using uri: /elements. So if the user types in /elements, this will run
    if (req.url === "/elements") {

      //Based on 'https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/', if we know the data will be a string, store string data into an array
      let body = [];
      //On the 'data' event, push chunk into the body array. 'Chunk' is a Buffer so expect numbers and letters
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

        //Push the new element html page into the givenURLs, make sure it is lowercase
        givenURLs.push(`/${parsedBody.elementName.toLowerCase()}.html`);
        console.log("new GivenURLs:", givenURLs);

        //Push the new element name into the elementsArr for the index
        elementsArr.push(`${parsedBody.elementName}`);
        console.log("new elements arr:", elementsArr);

        //Set the content of the response body for the new element html file
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
            <p>${parsedBody.elementName} is a chemical element with symbol ${parsedBody.elementSymbol} and atomic number ${parsedBody.elementAtomicNumber}. Because ${parsedBody.elementName.toLowerCase()} is produced entirely by cosmic ray spallation and not by stellar nucleosynthesis it is a low-abundance element in both the Solar system and the Earth's crust.[12] ${parsedBody.elementName} is concentrated on Earth by the water-solubility of its more common naturally occurring compounds, the borate minerals. These are mined industrially as evaporites, such as borax and kernite. The largest proven boron deposits are in Turkey, which is also the largest producer of ${parsedBody.elementName.toLowerCase()} minerals.</p>
            <p><a href="/">back</a></p>
          </body>
          </html>`;

        //Save the new element html file in the public directory
        fs.writeFile(`./public/${parsedBody.elementName.toLowerCase()}.html`, resBodyContent, err => {
          if (err) {
            res.writeHead(404, { "Content-Type": "application/json" }, { "Success": false });
            res.write('{Success: false}');
            res.end();
          }
          else {
            //Cannot include res.write() or res.end() as we want to fs.writeFile to update a new index.html. You cannot do a 'write after end' meaning you cannot write a second file
            res.writeHead(200, { "Content-Type": "application/json" }, { "Success": true });
          }
        });

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
      });
    }
  }
  else if (req.method === "PUT") {
    //If the requested url exists
    if (givenURLs.includes(req.url)) {
      let bodyPUT = [];

      req.on('data', chunk => {
        bodyPUT.push(chunk);

      }).on('end', () => {
        bodyPUT = Buffer.concat(bodyPUT).toString();

        let parsedBodyPUT = qs.parse(bodyPUT);
        console.log("parsedBodyPUT:\n", parsedBodyPUT);

        //Set the updated content to populate the requested html file
        const resBodyContentPUT = `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>The Elements - ${parsedBodyPUT.elementName}</title>
          <link rel="stylesheet" href="/css/styles.css">
        </head>
        <body>
          <h1>${parsedBodyPUT.elementName}</h1>
          <h2>${parsedBodyPUT.elementSymbol}</h2>
          <h3>Atomic number ${parsedBodyPUT.elementAtomicNumber}</h3>
          <p>${parsedBodyPUT.elementName} is a chemical element with symbol ${parsedBodyPUT.elementSymbol} and atomic number ${parsedBodyPUT.elementAtomicNumber}. Because ${parsedBodyPUT.elementName.toLowerCase()} is produced entirely by cosmic ray spallation and not by stellar nucleosynthesis it is a low-abundance element in both the Solar system and the Earth's crust.[12] ${parsedBodyPUT.elementName} is concentrated on Earth by the water-solubility of its more common naturally occurring compounds, the borate minerals. These are mined industrially as evaporites, such as borax and kernite. The largest proven boron deposits are in Turkey, which is also the largest producer of ${parsedBodyPUT.elementName.toLowerCase()} minerals.</p>
          <p><a href="/">back</a></p>
        </body>
        </html>`;

        //writeFile to update the requested html file
        fs.writeFile(`./public/${req.url}`, resBodyContentPUT, err => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" }, { "error": "resource /carbon.html does not exist" });
            res.write('{Success: false}');
            res.end();
          }
          else {
            res.writeHead(200, { "Content-Type": "application/json" }, `{ "Success": true }`);
            res.write('{Success: true}');
            res.end();
          }
        });
      });
    }
    //Else, if requested url doesn't exist, return 500 server error
    else {
      res.writeHead(500, { "Content-Type": "application/json" }, { "error": "requested url does not exist" });
      res.write('{Success: false}');
      res.end();
    }
  }
  else if (req.method === "DELETE") {
    if (givenURLs.includes(req.url)) {
      fs.unlink(`./public/${req.url}`, err => {
        if (err) throw err;
        else {
          console.log(`${req.url} was deleted`);
          console.log("givenURLs after delete:", givenURLs);
          console.log("elements after delete:", elementsArr);
          let URLIndex = givenURLs.indexOf(req.url);
          givenURLs.splice(URLIndex, 1);
          let elementIndex = elementsArr.indexOf(req.url);
          elementsArr.splice(elementIndex, 1);
          console.log("givenURLs after delete:", givenURLs);
          console.log("elements after delete:", elementsArr);
        }
      })
    }
    else {
      res.writeHead(500, { "Content-Type": "application/json" }, { "error": "requested url does not exist" });
      res.write('{Success: false}');
      res.end();
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
})

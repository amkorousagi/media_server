var express = require("express");
var bodyParser = require('body-parser');
var request = require("request");
var fs = require('fs');
var multer = require('multer');
var path = require('path');
const HTTPS = require('https');


const get_media = require("./get_media");

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

const get_media_instance = new get_media();
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'media/');
        },
        filename: function (req, file, cb) {
            console.log(file);
            cb(null, new Date().valueOf() + "_" + file.originalname);
        }
    }),
});
//test
app.get("/", (req,res)=>{
    /*
     request.post(
        {
            url:"https://knulmsmodule2.cf:5002/set_media",
            formData : {
                file: fs.createReadStream('dog.jpeg')
            }
        },
        function optionalCallback(err, httpResponse, body){
            if(err){
                return console.error('upload failed:',err);
            }
            console.log('upload successfully,',body);
        }
    );
    */
    res.send("hi");
});
/*
app.get("/test", (req,res)=>{
    res.send("hi");
});
*/
//get
/*
app.get("/help", (req,response)=>{
    const resourcePath = "media/"+req.query.resource;
    // 1. stream 생성
    var stream = fs.createReadStream(resourcePath);
    // 2. 잘게 쪼개진 stream 이 몇번 전송되는지 확인하기 위한 count
    var count = 0;
    // 3. 잘게 쪼개진 data를 전송할 수 있으면 data 이벤트 발생 
    stream.on('data', function(data) {
      count = count + 1;
      console.log('data count='+count);
      // 3.1. data 이벤트가 발생되면 해당 data를 클라이언트로 전송
      response.write(data);
    });

    // 4. 데이터 전송이 완료되면 end 이벤트 발생
    stream.on('end', function () {
      console.log('end streaming');
      // 4.1. 클라이언트에 전송완료를 알림
      response.end();
    });

    // 5. 스트림도중 에러 발생시 error 이벤트 발생
    stream.on('error', function(err) {
      console.log(err);
      // 5.2. 클라이언트로 에러메시지를 전달하고 전송완료
      response.end('500 Internal Server '+err);
    });
});

app.get("/get_media", (req,res) =>{
    console.log("meida");
    const resource = req.query.resource;
    console.log(resource);
    get_media_instance.execute(resource, res);
});
*/
app.get("/set_media", upload.single('file'), (req,res) =>{
    console.log(req.file);
    res.json(req.file.path);
});

app.get("/get_media", function (req, res) {
    // Listing 3.
    const options = {};
    const {resource} = req.query;
    const filePath = 'media/' + resource;

    let start;
    let end;

    const range = req.headers.range;
    if (range) {
        const bytesPrefix = "bytes=";
        if (range.startsWith(bytesPrefix)) {
            const bytesRange = range.substring(bytesPrefix.length);
            const parts = bytesRange.split("-");
            if (parts.length === 2) {
                const rangeStart = parts[0] && parts[0].trim();
                if (rangeStart && rangeStart.length > 0) {
                    options.start = start = parseInt(rangeStart);
                }
                const rangeEnd = parts[1] && parts[1].trim();
                if (rangeEnd && rangeEnd.length > 0) {
                    options.end = end = parseInt(rangeEnd);
                }
            }
        }
    }

    res.setHeader("content-type", "image");

    fs.stat(filePath, (err, stat) => {
        if (err) {
            console.error(`File stat error for ${filePath}.`);
            console.error(err);
            res.sendStatus(500);
            return;
        }

        let contentLength = stat.size;

        // Listing 4.
        if (req.method === "HEAD") {
            res.statusCode = 200;
            res.setHeader("accept-ranges", "bytes");
            res.setHeader("content-length", contentLength);
            res.end();
        }
        else {      
            // Listing 5.
            let retrievedLength;
            if (start !== undefined && end !== undefined) {
                retrievedLength = (end+1) - start;
            }
            else if (start !== undefined) {
                retrievedLength = contentLength - start;
            }
            else if (end !== undefined) {
                retrievedLength = (end+1);
            }
            else {
                retrievedLength = contentLength;
            }

            // Listing 6.
            res.statusCode = start !== undefined || end !== undefined ? 206 : 200;

            res.setHeader("content-length", retrievedLength);

            if (range !== undefined) {  
                res.setHeader("content-range", `bytes ${start || 0}-${end || (contentLength-1)}/${contentLength}`);
                res.setHeader("accept-ranges", "bytes");
            }

            // Listing 7.
            const fileStream = fs.createReadStream(filePath, options);
            fileStream.on("error", error => {
                console.log(`Error reading file ${filePath}.`);
                console.log(error);
                res.sendStatus(500);
            });


            fileStream.pipe(res);
        }
    });
});

//post

app.post("/get_media", (req,res) =>{
    const {resource} = req.query;
    get_media_instance.execute(resource, res);
});

app.post("/set_media", upload.single('file'), (req,res) =>{
    console.log(req.file);
    res.json(req.file.filename);
});

try {
    const option = {
      ca: fs.readFileSync('/etc/letsencrypt/live/knulmsmodule2.cf/fullchain.pem'),
      key: fs.readFileSync(path.resolve(process.cwd(), '/etc/letsencrypt/live/knulmsmodule2.cf/privkey.pem'), 'utf8').toString(),
      cert: fs.readFileSync(path.resolve(process.cwd(), '/etc/letsencrypt/live/knulmsmodule2.cf/cert.pem'), 'utf8').toString(),
    };
  
    HTTPS.createServer(option, app).listen(5002, () => {
      console.log(`[HTTPS] Soda Server is started on port 5002`);
    });
  } catch (error) {
    console.log(error.toString());
  }

//media server

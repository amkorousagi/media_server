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

app.get("/set_media", upload.single('file'), (req,res) =>{
    console.log(req.file);
    res.json(req.file.path);
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

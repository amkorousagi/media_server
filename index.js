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
     request.post(
        {
            url:"https://15.164.216.57:5002/set_media",
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
    res.send("ok");
});

app.get("/test", (req,res)=>{
    res.send("hi");
});

//get

app.get("/get_media", (req,res) =>{
    const {resource} = req.query;
    get_media_instance.execute(resource, res);
});

app.get("/set_media", upload.single('file'), (req,res) =>{
    console.log(req.file);
    res.json(req.file.path);
});

//post

app.post("/get_media", (req,res) =>{
    const resource = req.body.resource;
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

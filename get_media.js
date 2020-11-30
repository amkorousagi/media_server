const fs = require('fs');
class Get_Media{
    
    execute = async (resource, response) =>{
        try {
            
	    console.log("fd",resource);
            response.setHeader("content-type", "video/mp4");
            var resourcePath = './media/'+resource;
            // 1. stream 생성
            var stream = fs.createReadStream(resourcePath);
            // 2. 잘게 쪼개진 stream 이 몇번 전송되는지 확인하기 위한 count
            /*
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
            */
            stream.on("error", error => {
                console.log(`Error reading file ${resourcePath}.`);
                console.log(error);
                response.sendStatus(500);
            });
            stream.pipe(response);

        } catch(err) {
            //db error
            console.log(err.toString());
            response.status(400).json(err.toString());
        }
    }
   

    
}

module.exports  = Get_Media;
/*
app.get("/video", function (req, res) {
      // Listing 3.
      const options = {};
      const filePath = "./bigbuck.mp4";

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
 
      res.setHeader("content-type", "video/mp4");
 
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
*/

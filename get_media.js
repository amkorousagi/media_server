const fs = require('fs');
class Get_Media{
    
    execute = async (resource, response) =>{
        try {
            var resourcePath = './media/'+resource;
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
            
        } catch(err) {
            //db error
            console.log(err.toString());
            response.status(400).json(err.toString());
        }
    }
   

    
}

module.exports  = Get_Media;
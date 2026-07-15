const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors()); // CORS 허용

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  // 클라이언트가 처음 접속하면 아무것도 안 함 (이름 입력 전까지 기다림)
  console.log('소켓 연결됨');

  // 클라이언트가 이름을 입력하고 'join' 이벤트를 보냈을 때 처리
  socket.on('join', (userName) => {
    // 소켓 자체에 이름 저장 (나중에 disconnect 시 사용)
    socket.userName = userName; 
    
    // 접속한 유저에게 환영 메시지 전달
    socket.emit('bot message', `${userName}님, 채팅방에 오신 것을 환영합니다!`);
    // 다른 사람들에게 알림
    socket.broadcast.emit('bot message', `${userName}님이 입장하셨습니다.`);
    console.log(`${userName} 입장`);
  });

  // 메시지를 받았을 때 처리
  socket.on('chat message', (msg) => {
    // ⚠️ 중요: [object Object] 방지를 위해 이름과 텍스트를 담은 객체로 전송
    if(socket.userName) { // 이름을 입력한 유저만 메시지 전송 가능
      io.emit('chat message', { 
        name: socket.userName, 
        text: msg 
      });
    }
  });

  // 접속 종료 시
  socket.on('disconnect', () => {
    if(socket.userName) {
      io.emit('bot message', `${socket.userName}님이 퇴장하셨습니다.`);
      console.log(`${socket.userName} 퇴장`);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`서버 작동 중: ${PORT}`);
});

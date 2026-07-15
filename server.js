const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  const userName = "익명_" + Math.floor(Math.random() * 1000);
  
  socket.emit('bot message', `${userName}님, 채팅방에 오신 것을 환영합니다!`);
  socket.broadcast.emit('bot message', `${userName}님이 입장하셨습니다.`);

  socket.on('chat message', (msg) => {
    io.emit('chat message', { name: userName, text: msg });
  });

  socket.on('disconnect', () => {
    io.emit('bot message', `${userName}님이 퇴장하셨습니다.`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`서버 작동 중: ${PORT}`);
});

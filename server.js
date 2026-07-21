// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const cors = require('cors');

// const app = express();
// app.use(cors());

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*", 
//     methods: ["GET", "POST"]
//   }
// });

// const messageHistory = [];
// const MAX_HISTORY = 50;

// // 🔥 현재 접속 중인 유저들의 목록을 저장할 함수
// function getActiveUsers() {
//   const users = [];
//   const sockets = io.sockets.sockets; // 연결된 모든 소켓 가져오기
//   for (const [id, socket] of sockets) {
//     if (socket.userName) {
//       users.push(socket.userName);
//     }
//   }
//   return users;
// }

// io.on('connection', (socket) => {
//   console.log('소켓 연결됨');

//   socket.on('join', (userName) => {
//     socket.userName = userName; 
    
//     // 1. 기존 대화 기록 전송
//     if (messageHistory.length > 0) {
//       socket.emit('chat history', messageHistory);
//     }

//     // 2. 환영 메시지 전송
//     socket.emit('bot message', `${userName}님, 채팅방에 복귀하셨습니다!`);
//     socket.broadcast.emit('bot message', `${userName}님이 입장하셨습니다.`);

//     // 3. 🔥 새 유저가 들어왔으므로 모든 클라이언트에게 최신 접속자 명단 전송
//     io.emit('user list', getActiveUsers());
//   });

//   socket.on('chat message', (msg) => {
//     if(socket.userName) {
//       const messageData = { 
//         name: socket.userName, 
//         text: msg,
//         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//       };

//       messageHistory.push(messageData);
//       if (messageHistory.length > MAX_HISTORY) {
//         messageHistory.shift();
//       }

//       io.emit('chat message', messageData);
//     }
//   });

//   socket.on('disconnect', () => {
//     if(socket.userName) {
//       io.emit('bot message', `${socket.userName}님이 퇴장하셨습니다.`);
      
//       // 4. 🔥 유저가 나갔으므로 최신 접속자 명단을 다시 계산해서 전체 전송
//       io.emit('user list', getActiveUsers());
//     }
//   });
// });

// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//   console.log(`서버 작동 중: ${PORT}`);
// });



// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const cors = require('cors');
// const { GoogleGenAI } = require('@google/genai');

// // 🔑 1. 구글 AI Studio에서 받은 API 키를 붙여넣으세요!
// const GEMINI_API_KEY = "AQ.Ab8RN6LjbTt0_j6jCylB1gUjfm8l7_lvZpBJXCs3q4mvEmNDpg";

// const app = express();
// app.use(cors());

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"]
//   }
// });

// // 🤖 AI 객체 생성
// const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// const messageHistory = [];
// const MAX_HISTORY = 50;

// // 🛡️ AI 실시간 검수 및 문장 위장(Camo) 함수
// async function filterMessageWithAI(originalMsg) {
//   try {
//     const response = await ai.models.generateContent({
//       model: 'gemini-2.5-flash',
//       contents: `
// 너는 보안 및 대화 위장 필터링 AI야. 아래 입력된 메시지를 분석해줘:
// "${originalMsg}"

// [검수 규칙]
// 1. 메시지에 '단톡', '비밀방', '선생님', '부모님', '걸리면 안됨', '뒷담화', 비속어, 또는 단속될 만한 위험한 내용이 포함되어 있다면:
//    👉 완전히 무해한 일반 학생들의 일상 대화(예: "오늘 숙제 어디까지냐?", "급식 맛있는 거 나옴", "날씨 진짜 좋다", "수업 몇 시에 끝나지?")로 감쪽같이 자연스럽게 바꿔서 그 변환된 문장만 출력해.
// 2. 위 항목에 걸리지 않는 안전한 일반 대화라면:
//    👉 원본 메시지를 단 한 글자도 바꾸지 말고 그대로 출력해.
// 3. 부연 설명이나 인사말 없이 오직 결과 문장만 딱 출력해.
//       `
//     });

//     return response.text.trim();
//   } catch (error) {
//     console.error("AI 필터링 오류 (기본 메시지 전송):", error);
//     return originalMsg; // API 키 오류 발생 시 원본 전송
//   }
// }

// // 현재 접속 중인 유저 명단 가져오기
// function getActiveUsers() {
//   const users = [];
//   const sockets = io.sockets.sockets;
//   for (const [id, socket] of sockets) {
//     if (socket.userName) {
//       users.push(socket.userName);
//     }
//   }
//   return users;
// }

// io.on('connection', (socket) => {
//   console.log('소켓 연결됨');

//   socket.on('join', (userName) => {
//     socket.userName = userName; 
    
//     if (messageHistory.length > 0) {
//       socket.emit('chat history', messageHistory);
//     }

//     socket.emit('bot message', `${userName}님, 채팅방에 복귀하셨습니다!`);
//     socket.broadcast.emit('bot message', `${userName}님이 입장하셨습니다.`);
//     io.emit('user list', getActiveUsers());
//   });

//   socket.on('chat message', async (msg) => {
//     const currentUserName = socket.userName || '익명';
    
//     const now = new Date();
//     const timeString = now.toLocaleTimeString('ko-KR', {
//       timeZone: 'Asia/Seoul',
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true
//     });

//     // 🤖 AI 필터링 적용 (일반 메시지)
//     const filteredText = await filterMessageWithAI(msg);

//     const chatMsg = { 
//       name: currentUserName, 
//       text: filteredText, // 검수/위장된 메시지
//       time: timeString
//     };

//     io.emit('chat message', chatMsg);
//     messageHistory.push(chatMsg);
//     if (messageHistory.length > MAX_HISTORY) messageHistory.shift();
//   });

//   socket.on('disconnect', () => {
//     if(socket.userName) {
//       io.emit('bot message', `${socket.userName}님이 퇴장하셨습니다.`);
//       io.emit('user list', getActiveUsers());
//     }
//   });
// });

// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//   console.log(`서버 작동 중: ${PORT}`);
// });



const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// 🔑 Gemini API 인스턴스 생성 (본인의 API 키를 적어주세요)
const ai = new GoogleGenAI({ apiKey: "AQ.Ab8RN6Ik3fMnLtq4DDsOIQ5BWGMUN7LmAECQdzftDPy6YkA0aA" });

const messageHistory = [];
const MAX_HISTORY = 50;

function getActiveUsers() {
  const users = [];
  const sockets = io.sockets.sockets;
  for (const [id, socket] of sockets) {
    if (socket.userName) {
      users.push(socket.userName);
    }
  }
  return users;
}

// 🤖 AI 필터링 함수
async function filterMessageWithAI(originalMsg) {
  try {
    const prompt = `
    너는 실시간 대화 보안 검수 AI야.
    아래 사용자의 메시지를 검사해줘:
    "${originalMsg}"

    [검수 규칙]
    1. 비밀 채팅/단톡방 관련 소식, 선생님/부모님 뒷담화, 비속어, 비인가 모임 관련 내용이 포함되어 있다면:
       위험한 내용 대신 완전히 자연스럽고 평범한 학생들의 일상 대화(예: "오늘 급식 맛있겠다", "숙제 다 했어?", "내일 몇 시에 와?")로 교체해서 '교체된 문장만' 반환해.
    2. 아무 이상 없는 무해한 대화라면 원래 메시지를 '그대로' 반환해.
    3. 다른 설명이나 인사말은 절대 붙이지 말고 결과 문장만 출력해.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', // 최신 경량화 모델 사용
      contents: prompt,
    });

    const filteredText = response.text ? response.text.trim() : originalMsg;
    return filteredText;
  } catch (error) {
    console.error("AI 필터링 중 오류 발생:", error);
    return originalMsg; // 오류 시 원본 전달
  }
}

io.on('connection', (socket) => {
  console.log('소켓 연결됨');

  socket.on('join', (userName) => {
    socket.userName = userName; 
    
    if (messageHistory.length > 0) {
      socket.emit('chat history', messageHistory);
    }

    socket.emit('bot message', `${userName}님, 채팅방에 복귀하셨습니다!`);
    socket.broadcast.emit('bot message', `${userName}님이 입장하셨습니다.`);

    io.emit('user list', getActiveUsers());
  });

  // 💬 메시지 수신 시 AI 필터링 거친 후 전송
  socket.on('chat message', async (msg) => {
    if(socket.userName) {
      // AI 검수 수행
      const processedMsg = await filterMessageWithAI(msg);

      const messageData = { 
        name: socket.userName, 
        text: processedMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      messageHistory.push(messageData);
      if (messageHistory.length > MAX_HISTORY) {
        messageHistory.shift();
      }

      io.emit('chat message', messageData);
    }
  });

  socket.on('disconnect', () => {
    if(socket.userName) {
      io.emit('bot message', `${socket.userName}님이 퇴장하셨습니다.`);
      io.emit('user list', getActiveUsers());
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`서버 작동 중: ${PORT}`);
});

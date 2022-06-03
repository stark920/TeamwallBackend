const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const ChatRoom = require("../models/chatRoomModel");
const User = require("../models/userModel");
const console = require("./console");

dotenv.config({ path: "../config.env" });

module.exports = (server) => {
  const idPath = "_id";
  const io = new Server(server, {
    path: "/socket.io/",
    cors: {
      origin: "*",
    },
  });

  // 驗證token
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("請重新登入"));
    }

    const decodedData = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, (error, payload) => {
        if (error) {
          reject(next(new Error("請重新登入")));
        } else {
          resolve(payload);
        }
      });
    });

    /* eslint no-param-reassign: ["error", { "props": false }] */
    socket.decoded = decodedData;

    return next();
  });

  const getUserId = async (token) => {
    const decodedToken = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, (error, payload) => {
        if (error) {
          reject(error);
        } else {
          resolve(payload);
        }
      });
    });
    const currentUser = await User.findById(decodedToken.id);
    return currentUser?.[idPath];
  };

  const getHistory = async (room, lastTime) => {
    let msgList = [];
    if (lastTime) {
      const [queryResult] = await ChatRoom.aggregate([
        { $match: { $expr: { $eq: ["$_id", { $toObjectId: room }] } } },
        {
          $project: {
            messages: 1,
          },
        },
        {
          $project: {
            messages: {
              $slice: [
                {
                  $filter: {
                    input: "$messages",
                    as: "item",
                    cond: {
                      $lt: ["$$item.createdAt", new Date(lastTime)],
                    },
                  },
                },
                30,
              ],
            },
          },
        },
      ]);
      msgList = queryResult.messages;
    } else {
      msgList = await ChatRoom.find(
        { _id: room },
        { messages: { $slice: -30 } }
      );
      msgList = msgList[0]?.messages;
    }
    return msgList;
  };

  // 建立連接
  io.of("/chat").on("connection", async (socket) => {
    const room = socket.handshake.query?.room;
    const token = socket.handshake.auth?.token;
    let userId = await getUserId(token);
    userId = userId.toString();
    console.log("connection----", room);
    if (room) {
      socket.join(room);
    }

    const msgList = await getHistory(room);
    socket.emit("history", msgList);
    socket.use(([payload], next) => {
      console.log("payload", payload);
      if (payload?.message?.length > 100) {
        return next(new Error("您輸入的內容過長"));
      }
      return next();
    });

    // 監聽 client發來的訊息
    socket.on("chatMessage", async (msg) => {
      const { message } = msg;
      const createdAt = Date.now();
      await ChatRoom.findByIdAndUpdate(room, {
        $push: { messages: { sender: userId, message, createdAt } },
      });
      // 針對該房間廣播訊息
      io.of("/chat")
        .to(room)
        .emit("chatMessage", { message, sender: userId, createdAt });
    });

    // 使用者輸入中
    socket.on("typing", (boolean) => {
      socket.broadcast.in(room).emit("typing", boolean);
    });

    // 歷史訊息
    socket.on("history", async (info) => {
      const { lastTime } = info;
      const msgList = await getHistory(room, lastTime);
      socket.emit("history", msgList);
    });

    socket.on("leaveRoom", (currentRoom) => {
      console.log("leaveRoom~~~", currentRoom);
      socket.leave(currentRoom);
    });
    // 錯誤處理
    socket.on("error", (err) => {
      socket.emit("error", err.message);
    });
    // 斷開連接
    socket.on("disconnect", (currentSocket) => {
      console.log("socket-disconnect", currentSocket);
    });
  });

  io.of("/chat").on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });

  return io;
};

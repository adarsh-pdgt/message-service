const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io'); 
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-streams-adapter");
const mongoose = require('mongoose');
const config = require("./config/db.config");
const {createOneToOneMessageRoom} = require("./services/addParticipant.service")
const {sendMesage} = require("./services/message.service");
const {ObjectRooms, Message} = require("./models/messages.models");
const { instrument } = require("@socket.io/admin-ui");
const redisClient = createClient({ host: "localhost", port: 6379 });
redisClient.connect();

mongoose.connect(config.mongoose.url).then(() => {
  console.info('Connected to MongoDB');
});

const server = http.createServer(app);

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
  adapter: createAdapter(redisClient)
});

instrument(io, {
  auth: false
});



io.on('connection', (socket) => {
  user = socket.handshake.headers["x-authenticated-user"];

  socket.on("join-room", (data) => {
    const {userId} = data;
    ObjectRooms.findOne({objectId: userId}).exec().then(
      (res) => {
        try{
          const allRooms = res.approvedRooms;
          socket.join(allRooms);
        }
        catch (err){
          console.error(err);
        }
      }
    );
  });

  socket.on("create-dm-room", (data) => {
    const {room, userId, participantId} = data;
    createOneToOneMessageRoom(userId, room, participantId);
  });

  socket.on("send-message", (data) => {
    const {roomId, message, sender} = data;
    const response = sendMesage(roomId, sender, message);
    console.log(response);
    io.sockets.in(roomId).emit('live-messages', response);
  });

  socket.on("list-message", (data)=> {
    const limitResponse = 5;
    const {roomId} = data;
    Message.find({roomId: roomId}).limit(limitResponse).exec().then(
      (objects) => {
        io.sockets.in(roomId).emit('all-messages', objects);
      }
    );
  });

  socket.on('unapproved-rooms', (data) => {
    
  });

  socket.on("approve-room", (data)=> {
    // approve an unapproved rooms
  });

  socket.on("approved-rooms", (data)=> {
    const {userId} = data;
    ObjectRooms.findOne({objectId: userId}).exec().then(
      (res) => {
        try{
          const allRooms = res.approvedRooms;
          io.sockets.emit("approved-rooms", allRooms);
        }
        catch (err){
          console.error(err);
        }
      }
    );
  });

  socket.on("room-participants", (data)=> {
    // all members added in rooms
  });

});

server.listen(3001, () => 'Server is running on port 3000');
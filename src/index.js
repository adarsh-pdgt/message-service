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
const {sendMesage, isValidRoomId} = require("./services/message.service");
const {ObjectRooms, Message} = require("./models/messages.models");
const { v4: uuidv4 } = require('uuid');
const {dmRoomValidation, listMessageValidation, sendMessageValidation} = require('./validations/message.validations');
const redisClient = createClient(config.redis.url);
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


io.on('connection', (socket) => {
  let user = socket.handshake.headers["x-authenticated-user"];
  user = JSON.parse(user)
  const userId = user.id;

  socket.on("join", () => {
    ObjectRooms.findOne({objectId: userId}).exec().then(
      (res) => {
        try{
          const allRooms = res.approvedRooms;
          socket.join(allRooms);
        }
        catch (err){
          socket.emit("error", err);
        }
      }
    );
  });

  socket.on("create-dm-room", (data) => {
    const {error, value} = dmRoomValidation.validate(data);
    if(error){
      socket.emit("error", error);
      return;
    }
    const {participantId} = value;
    if(participantId == userId){
      socket.emit("error", "Cannot add yourself as participant");
      return;
    }
    roomId = uuidv4();
    createOneToOneMessageRoom(userId, roomId, participantId);
  });

  socket.on("send-message", (data) => {
    const {error, value} = sendMessageValidation.validate(data);
    if(error){
      socket.emit("error", error);
      return;
    }
    const {roomId, message} = value;
    console.log("userId " + userId);
    const canSendMessage = isValidRoomId(roomId, userId);
    if(canSendMessage==false){
      socket.emit("error", "roomId doesn't exists");
      return;
    }
    const response = sendMesage(roomId, userId, message);
    io.sockets.in(roomId).emit('live-messages', response);
  });

  socket.on("list-message", (data)=> {
    const {error, value} = listMessageValidation.validate(data);
    if(error){
      socket.emit("error", error);
      return;
    }
    const {roomId, limitResponse=5} = value;
    Message.find({roomId: roomId}).sort('-createdAt').limit(limitResponse).exec().then(
      (objects) => {
        io.sockets.in(roomId).emit('all-messages', objects);
      }
    );
  });

  socket.on('unapproved-rooms', (data) => {
    ObjectRooms.findOne({objectId: userId}).exec().then(
      (res) => {
        try{
          const allRooms = res.unapprovedRooms;
          io.sockets.emit("unapproved-rooms", allRooms);
        }
        catch (err){
          socket.emit("error", err);
        }
      }
    );
  });

  socket.on("approve-room", (data)=> {
    // approve an unapproved rooms
  });

  socket.on("rooms", ()=> {
    ObjectRooms.findOne({objectId: userId}).exec().then(
      (res) => {
        try{
          const allRooms = res.approvedRooms;
          io.sockets.emit("approved-rooms", allRooms);
        }
        catch (err){
          socket.emit("error", err);
        }
      }
    );
  });

  socket.on("room-participants", (data)=> {
    // all members added in rooms
  });

});

server.listen(config.port, () => 'Server is running on port 3000');
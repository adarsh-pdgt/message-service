const {Message} = require("../models/messages.models");

function sendMesage(roomId, sender, message) {
    const msg = new Message({message: message, sender: sender, roomId: roomId});
    msg.save();
    return msg;
}

module.exports = {
    sendMesage
}
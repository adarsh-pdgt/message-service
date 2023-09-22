const {Message, ObjectRooms} = require("../models/messages.models");

function sendMesage(roomId, sender, message) {
    const msg = new Message({message: message, sender: sender, roomId: roomId});
    msg.save();
    return msg;
}

function isValidRoomId(roomId, participantId){
    const messageRoom = ObjectRooms.findOne({objectId: participantId}).exec().then((object) => {
        if(object){
            const allRooms = object.approvedRooms;
            return allRooms.includes(roomId);
        }
        return false;
    });
}

module.exports = {
    sendMesage,
    isValidRoomId
}
const {MessageRoom, ObjectRooms} = require("../models/messages.models");

async function createObjectRooms(userId, roomId, isApprovedRoom){
    const objectRooms = await ObjectRooms.findOne({objectId: userId});
    if(objectRooms == null){
        if(isApprovedRoom){
            const objectRooms = ObjectRooms({objectId: userId, approvedRooms: [roomId]});
            objectRooms.save();
        }
        else{
            const objectRooms = ObjectRooms({objectId: userId, unapprovedRooms: [roomId]});
            objectRooms.save();
        }
    }
    else{
        if(isApprovedRoom){
            objectRooms.approvedRooms.push(roomId);
            objectRooms.unapprovedRooms.pull(roomId);
            objectRooms.save();
        }
        else{
            objectRooms.unapprovedRooms.push(roomId);
            objectRooms.save();
        }
    }
}


async function createOneToOneMessageRoom(createdBy, roomId, participantId){
    const room = await MessageRoom.findOne({roomId});
    if(room == null){
        const messageRoom = MessageRoom({roomId: roomId, createdBy: createdBy, roomType: "DM"});
        messageRoom.participants.push({
            _id: participantId
        },{
            _id: createdBy
        }
        );
        await messageRoom.save();
    }
    await createObjectRooms(createdBy, roomId, true);
    await createObjectRooms(participantId, roomId, false);
}


async function createGroupMessageRoom(createdBy, room, participantId) {

}

module.exports = {
    createGroupMessageRoom,
    createOneToOneMessageRoom
}
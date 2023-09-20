const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: String,
            required: true
        },
        roomId: {
            type: String, 
            required: true
        },
        message: {
            type: String
        },
    },
    {
        timestamps: true,
    }
);

const messageRoomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true
    },
    participants: [
        {
            _id: {
                type: String,
                required: false
            },
            metaData: {
                type: JSON,
                required: false
            }
        }
    ],
    createdBy: {
        type: String, 
        required: true
    },
    roomType: {
        type: String,
        required: true,
        enum: ['DM', 'GROUP'],
    }
  },
  {
    timestamps: true,
  }
);

const objectRoomsSchema = new mongoose.Schema(
    {
        objectId: {
            type: String,
            unique: true
        },
        approvedRooms: [
            String
        ],
        unapprovedRooms: [
            String
        ],
    },
    {
        timestamps: true,
    }
);

const Message = mongoose.model("Message", messageSchema);
const MessageRoom = mongoose.model('MessageRoom', messageRoomSchema);
const ObjectRooms = mongoose.model("ObjectRoom", objectRoomsSchema);
module.exports = {
    Message, 
    MessageRoom,
    ObjectRooms
}
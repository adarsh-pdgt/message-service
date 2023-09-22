const Joi = require('joi');


const sendMessageValidation = Joi.object().keys({
    roomId: Joi.string().guid({ version : 'uuidv4' }).required(),
    message: Joi.string().min(1).required()
});


const listMessageValidation = Joi.object().keys({
    roomId: Joi.string().guid({ version : 'uuidv4' }).required(),
    limitResponse: Joi.number().min(1).default(5)
});


const dmRoomValidation = Joi.object().keys({
    participantId : Joi.string().guid({ version : 'uuidv4' }).required()
})


module.exports = {
    dmRoomValidation, 
    sendMessageValidation,
    listMessageValidation
}
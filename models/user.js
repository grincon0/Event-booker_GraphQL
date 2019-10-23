const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type:String,
        required: true
    },

    createdEvents: [
        {
            //sets what we will get back from mongoose on related events
            //ref = 'Event , this connects this schema with the Event schema, sice we called the events chems, Event.
            type: Schema.Types.ObjectId,
            ref: 'Event'
        }
    ]
});

module.exports = mongoose.model('User', userSchema);
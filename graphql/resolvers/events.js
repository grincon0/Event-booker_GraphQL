const Event = require('../../models/event');
const User = require('../../models/user');
const { dateToString } = require('../../helpers/date');
const { transformEvent } = require('./merge');




module.exports = {
    events: async () => {
        //populate = gets all data from refs
        try {
            const events = await Event.find();
            return events.map(event => {
                return transformEvent(event);
            /*     return {
                    ...event._doc,
                    _id: event.id.toString(),
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event._doc.creator)
                } */
            })
        } catch (err) {
            throw err;
        }
    },
    createEvent: async (args, req) => {

        if(!req.isAuth){
            throw new Error('Unauthenticated!');
        }
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            //+ CONVERT TO FLOAT
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: req.userId
        });

        let createdEvent;
        //hits mongoose and save entity to DB
        //return this block of code so that it GraphQL will wait for it to complete
        try {
            const result = await event.save()

            console.log(result);

            createdEvent = transformEvent(result);
            /* createdEvent = {
                ...result._doc,
                id: result._doc._id.toString(),
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, result._doc.creator)
            } */ 
            const creator = await User.findById(req.userId);

            if (!creator) {
                throw new Error("User not found");
            }
            //after finding creator, push event to his lsit of created events
            creator.createdEvents.push(event);
            //saved change to db
            await creator.save();

            return createdEvent;

        } catch (err) {
            throw err;
        }


    }

}
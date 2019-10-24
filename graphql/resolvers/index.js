const bcrypt = require('bcryptjs');
const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');


//get all events where one of the event's Id is on of the followingin the array at $in
const events = async eventIds => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } })
        events.map(event => {
            return {
                ...events._doc,
                _id: event.id,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event.creator)
            };
        });
        return events;

    } catch (err) {
        throw err;
    }

};

//find all events by user
const user = async userId => {
    try {
        const user = await User.findById(userId)
        return {
            ...user._doc,
            _id: user.id,
            createdEvents: events.bind(this, user._doc.createdEvents)
        }
    } catch (err) {
        throw err;
    }
};

const singleEvent = async eventId => {
    try{

        const event = await Event.findById(eventId);

        return {
            ...event._doc,
            _id: event.id,
            creator: user.bind(this, event.creator)
        };

    } catch(err){
        throw err;
    }
}

module.exports = {
    events: async () => {
        //populate = gets all data from refs

        try {
            const events = await Event.find();
            return events.map(event => {
                return {
                    ...event._doc,
                    _id: event.id.toString(),
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event._doc.creator)
                }
            })
        } catch (err) {
            throw err;
        }


    },
    bookings: async () => {
        try {
          const bookings = await Booking.find();
          return bookings.map(booking => {
            return {
              ...booking._doc,
              _id: booking.id,
              //get user who booked through userId
              user: user.bind(this, booking._doc.user),
              //get event booked through eventId
              event: singleEvent.bind(this, booking._doc.event),
              createdAt: new Date(booking._doc.createdAt).toISOString(),
              updatedAt: new Date(booking._doc.updatedAt).toISOString()
            };
          });
        } catch (err) {
          throw err;
        }
      },

    //create booking
    bookEvent: async args => {
        const fetchedEvent = await Event.findOne({ _id: args.eventId });
        const booking = new Booking({
            user: '5db062778b45cb30e23ce064',
            event: fetchedEvent
        });

        const result = await booking.save();

        return {
            ...result._doc,
            _id: result.id,
            createdAt: new Date(result._doc.createdAt).toISOString(),
            updatedAt: new Date(result._doc.updatedAt).toISOString()
        }
    },
    cancelBooking: async args => {
        try{
            const booking = await Booking.findById(args.bookingId).populate('event');
            const event = {
                ...booking.event._doc,
                _id: booking.event.id,
                creator: user.bind(this, booking.event._doc.creator)
            }

            await Booking.deleteOne({ _id: args.bookingId });

            return event;
        } catch(err){
            throw err;
        }
    },
    createEvent: async (args) => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            //+ CONVERT TO FLOAT
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: '5db062778b45cb30e23ce064'
        })

        let createdEvent;
        //hits mongoose and save entity to DB
        //return this block of code so that it GraphQL will wait for it to complete

        try {
            const result = await event.save()

            console.log(result);
            createdEvent = {
                ...result._doc,
                id: result._doc._id.toString(),
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, result._doc.creator)
            }
            const creator = await User.findById('5db062778b45cb30e23ce064');

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


    },
    createUser: async (args) => {
        try {
            const existingUser = await User.findOne({ email: args.userInput.email })
            if (existingUser) {
                throw new Error("User already exists");
            }
            const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

            const user = new User({
                email: args.userInput.email,
                password: hashedPassword
            })
            //save to db
            const result = await user.save();

            return { ...result._doc, password: null, id: result.id }
        } catch (err) {
            throw err;
        }
    }
}
const Event = require('../../models/event');
const Booking = require('../../models/booking');
const { transformBooking , transformEvent} = require('../resolvers/merge');

module.exports = {
    bookings: async () => {
        try {
          const bookings = await Booking.find();
          return bookings.map(booking => {
            return transformBooking(booking);
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

        return transformBooking(result);
    },
    cancelBooking: async (args, req) => {

        if(!req.isAuth){
            throw new Error('Unathentication');
        }
        try{
            const booking = await Booking.findById(args.bookingId).populate('event');
            const event = transformEvent(booking._doc.event);
           /*  const event = {
                ...booking.event._doc,
                _id: booking.event.id,
                creator: user.bind(this, booking.event._doc.creator)
            } */

            await Booking.deleteOne({ _id: args.bookingId });

            return event;
        } catch(err){
            throw err;
        }
    }
}
const express = require('express');
const bodyParser = require('body-parser');
//exports a function we can use in the place where express expected a middle function
//will take incoming requests and funnel them to the right resolvers
const graphqlHttp = require('express-graphql');
//get method to create shcema for models and mutations
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = express();

const Event = require('./models/event');
const User = require('./models/user');

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    //query = Get
    //Mutation = changing (Create, Update, Delete)
    //! next to type = required field / cannot be null
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String! 
            price: Float!
            date: String!
        }

        type User {
            _id: ID!
            email: String!
            password: String
        }
        type RootQuery {
            events: [Event!]!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }
        schema {
            query: RootQuery 
            mutation: RootMutation
        }
    `),
    //bundle of all resolvers
    rootValue: {
        events: () => {
            return Event.find().then(events => {
                return events.map(event => {
                    return { ...event._doc, _id: event.id.toString() }
                })
            }).catch(err => {
                throw err;
            });
        },
        createEvent: (args) => {
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
            return event
            .save()
            .then((result) => {
                console.log(result)
                createdEvent = { ...result._doc, id: result._doc._id.toString()}
                return User.findById('5db062778b45cb30e23ce064');
             
            }).then(user => {
                if (!user){
                    throw new Error("User not found");
                }
                user.createdEvents.push(event);
                return user.save();

            }).then(result => {
                return createdEvent;
            }).catch((err) => {
                console.log(err);
            });

        },
        createUser: (args) => {
           return User.findOne({email: args.userInput.email}).then( user =>  {
                if (user){
                    throw new Error("User already exists");
                }
                return bcrypt
                .hash(args.userInput.password, 12);
            }).then(hashedPassword => {
                    const user = new User({
                        email: args.userInput.email,
                        password: hashedPassword
                    });
                    //save to db
                    return user.save();
                }).then(result => {
                    return { ...result._doc, password: null, id: result.id }
                })
                .catch(err => {
                    throw err;
                })

        }

    },
    graphiql: true
}))
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${
    process.env.MONGO_PASSWORD
    }@cluster0-odqw0.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`).then(() => {
        app.listen(3000, () => {
            console.log('Mongo cluster successfully connected \n Serving application on port 3000!');
        });

    }).catch((err) => {
        console.log(err)
    });

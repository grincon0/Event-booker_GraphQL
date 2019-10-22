const express = require('express');
const bodyParser = require('body-parser');
//exports a function we can use in the place where express expected a middle function
//will take incoming requests and funnel them to the right resolvers
const graphqlHttp = require('express-graphql');
//get method to create shcema for models and mutations
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const mongo = require('mongodb').MongoClient;
const app = express();

const Event = require('./models/event');

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
        type RootQuery {
            events: [Event!]!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }
        schema {
            query: RootQuery 
            mutation: RootMutation
        }
    `),
    //bundle of all resolvers
    rootValue: {
        events: () => {
            Event.find().then( events => {
                return events.map( event => {
                    return {...events._doc}
                })
            }).catch( err => {
                throw err;
            });
        },
        createEvent: (args) => {  
          /*   const event = {
                _id: Math.random().toString(),
                title: args.eventInput.title,
                description: args.eventInput.description,
                //+ CONVERT TO FLOAT
                price: +args.eventInput.price,
                date: args.eventInput.date
            }; */
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                //+ CONVERT TO FLOAT
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date)
            })
            //hits mongoose and save entity to DB
            //return this block ofcode so that it GraphQL will wait for it
            return event.save().then((result)=>{
                console.log(result)
                //returns pure tentity object without metadata
                return { ...result._doc};
            }).catch(()=>{
                console. log(err);
            });
            
        }

    },
    graphiql: true
}))
//mongodb+srv://grincon:<password>@cluster0-odqw0.mongodb.net/test?retryWrites=true&w=majority
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${
    process.env.MONGO_PASSWORD
}@cluster0-odqw0.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`).then(()=> {
    app.listen(3000); 
}).catch((err)=> {
    console.log(err)
});

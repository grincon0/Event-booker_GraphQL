const express = require('express');
const bodyParser = require('body-parser');
//exports a function we can use in the place where express expected a middle function
//will take incoming requests and funnel them to the right resolvers
const graphqlHttp = require('express-graphql');
//get method to create shcema for models and mutations
const { buildSchema } = require('graphql')
const app = express();

const events = [];
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
            return events
        },
        createEvent: (args) => {
            const event = {
                _id: Math.random().toString(),
                title: args.eventInput.title,
                description: args.eventInput.description,
                //+ CONVERT TO FLOAT
                price: +args.eventInput.price,
                date: args.eventInput.date
            };
            events.push(event);

            return event;
        }

    },
    graphiql: true
}))


app.listen(3000);
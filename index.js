const express = require('express');
const bodyParser = require('body-parser');
//exports a function we can use in the place where express expected a middle function
//will take incoming requests and funnel them to the right resolvers
const graphqlHttp = require('express-graphql');

const { buildSchema } = require('graphql')
const app = express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    //query = Get
    //Mutation = changing (Create, Update, Delete)
    schema: buildSchema(`
        type RootQuery {
            events: [String!]!
        }

        type RootMutation {
            createEvent(name: String): String
        }
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    //bundle of all resolvers we have
    rootValue: { 
        events: () => {
            return ['Romantic Cooking', 'Sailing', 'Coding']
        },
        createEvent: (args) => {
            const eventName = args.name;
            return eventName;
            
        },
        graphiql: true
    }
}))

app.get('/', (req, res, next) => {
    res.send('Hello Universe!');
})

app.listen(3000);
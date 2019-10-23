const express = require('express');
const bodyParser = require('body-parser');
//exports a function we can use in the place where express expected a middle function
//will take incoming requests and funnel them to the right resolvers
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');

const app = express();

const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');


app.use(bodyParser.json());




app.use('/graphql', graphqlHttp({
    //query = Get
    //Mutation = changing (Create, Update, Delete)
    //! next to type = required field / cannot be null
    schema: graphQlSchema,
    //bundle of all resolvers
    rootValue: graphQlResolvers,
    graphiql: true
}))
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${
    process.env.MONGO_PASSWORD
    }@cluster0-odqw0.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`).then(() => {
        app.listen(3000, () => {
            console.log('\n \n \n Mongo cluster successfully connected. \n Serving application on port 3000!');
        });

    }).catch((err) => {
        console.log(err)
    });

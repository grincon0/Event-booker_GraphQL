const express = require('express');
const bodyParser = require('body-parser');
//exports a function we can use in the place where express expected a middle function
//will take incoming requests and funnel them to the right resolvers
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');


const app = express();

const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');
const isAuth = require('./middleware/is-auth');


app.use(bodyParser.json());

//set headers to allow cross origin + methods
app.use((req, res, next)=> {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if( req.method === 'OPTIONS'){
        return res.sendStatus(200);
    }
    next();
})


app.use(isAuth);


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
        app.listen(8080, () => {
            console.log('\n \n \n Mongo cluster successfully connected. \n Serving application on port 3000!');
        });

    }).catch((err) => {
        console.log(err)
    });

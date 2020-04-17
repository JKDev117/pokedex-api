//17.6 Working with datasets

/* https://www.uuidgenerator.net/version1
UUID:
Our application needs to use this UUID (universally unique identifier) 
when it's validating every request by checking the request's headers.
We want to store this value in an environmental variable, 
we can call the variable API_TOKEN */

//require the dotenv module and invoke it's config() method to read 
//the .env file. We should do this as early in our application as possible.
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet'); //pg. 27
const cors = require('cors'); //pg. 24
const POKEDEX = require('./pokedex.json');

const app = express();

//check to see if the NODE_ENV is set to "production" or not
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny': 'common'; //17.7
//set the value for morgan as appropriate
app.use(morgan(morganSetting)); //17.7


app.use(helmet()); //make sure to place helmet before cors in the pipeline (p. 27)
app.use(cors());

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN; //see 17.6 pg. 15
  const authToken = req.get("Authorization");

  //console.log('validate bearer token middleware'); //console.log's should be removed for production code (17.7)
})

  //pg. 17
  if(!authToken || authToken.split(' ')[1] !== apiToken){
    return res.status(401).json({error: 'Unauthorized request'})
  }

  //debugger //(p. 16)

  // next() = move to the next middleware (p. 12)
  next();
})

const validTypes = [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, 
`Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, 
`Psychic`, `Rock`, `Steel`, `Water`]


/*
In previous checkpoints, we've built our endpoints by writing the callback 
as an anonymous function. That approach is still valid, but here we'll begin
to separate the callback out into a named function (e.g. handleGetTypes [see below]) 
as the modularity and reusability of our code become more important.
*/
app.get('/types', handleGetTypes);

function handleGetTypes(req,res){
  res.json(validTypes); //validTypes is an array
}

app.get('/pokemon', handleGetPokemon);

function handleGetPokemon(req, res) {
  let response = POKEDEX.pokemon;

  //filter our pokemon by name if name query param is present
  if(req.query.name){
    response = response.filter(pokemon => 
      //case insensitive searching
      pokemon.name.toLowerCase().includes(req.query.name.toLowerCase())
    )
  }
 
  //filter out pokemon by type if type query param is present
  if(req.query.type){
    response = response.filter(pokemon => 
      pokemon.type.includes(req.query.type)
    )
  }

  res.json(response);
}

// 4 parameters in middleware, express knows to treat this as error handler (17.7)
app.use((error, req, res, next) => {
  let response
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response)
})


const PORT = process.env || 8000;

app.listen(PORT, () => {
  //console.log(`Server listening at http://localhost:${PORT}`) //console.log's should be removed for production code (17.7)
})


/* Notes

NODE_ENV is a standard environmental variable for Node applications that determines if the application is running in production 
or some other environment. When we deploy to production, Heroku will set this environmental variable to a value of "production". 
So, we can check to see if the NODE_ENV is set to "production" or not, and set the value for morgan as appropriate. (17.7, pg. 6)




*/



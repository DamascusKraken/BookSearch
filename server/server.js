const express = require('express');
//Apollo Server import
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('apollo/server/express4');
const path = require('path');

//import typeDefs and resolvers
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');
//routes
const routes = require('./routes');

const PORT = process.env.PORT || 3001;
const app = express();

//Apollo Server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

//start Apollo Server
const startApolloServer = async () => {
  await server.start();
 
//middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  // serve up static assets
  app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });
  };

//routes
app.use(routes);

//MERN SETUP, client-side routing beginning with the /graphql endpoint will be hanfles by Apollo Server
app.use('/graphql', expressMiddleware({ server }));

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`🌍 Now listening on localhost:${PORT}`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
};

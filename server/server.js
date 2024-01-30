const express = require('express');
//Apollo Server import
const { ApolloServer } = require('@apollo/server');
const path = require('path');

//import typeDefs and resolvers
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');
//routes
const routes = require('./routes');
//import middleware
const { authMiddleware } = require('./utils/auth');

const PORT = process.env.PORT || 3001;
const app = express();

//Apollo Server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // Apollo Server will use the context to populate the user object that's accessible in our resolvers.
  // Authenticated user's information will be accessible through req.user
  context: authMiddleware,
});

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Server index.html for all page routes and handle React routing
  app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });
  };

//start Apollo Server
const startApolloServer = async () => {
  await server.start();
 

// Apollo Server will use the middleware we define here to set each request's context
server.applyMiddleware({ app });

//routes
app.use(routes);

//MERN SETUP, client-side routing beginning with the /graphql endpoint will be hanfles by Apollo Server
app.use('/graphql', expressMiddleware({ server }));

//connect to the database and server
db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`🌍 Now listening on localhost:${PORT}`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
};

//start server
startApolloServer();
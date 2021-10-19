// Import Apollo Azure integration library
const { ApolloServer, gql } = require('apollo-server-azure-functions');
const { CosmosClient } = require('@azure/cosmos');

const connectionString = "AccountEndpoint=https://localhost:8081/;AccountKey=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==";
const databaseName = "gql-db";
const containerName = "gql-container";

const client = new CosmosClient(connectionString);

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type User {
    id: Int,
    first_name: String
    last_name: String,
    email: String
  },

  type Query {
      user(id: Int!): User,
      users: [User]
    }
`;

getUser = async (_, { id }) => {
  let query = "SELECT * FROM c WHERE c.id = @userId";
  let params = [{ name: "@userId", value: id.toString() }];
  let { resources: items } = await client.database("gql-db").container("gql-container")
    .items.query({ query: query, parameters: params }).fetchAll();
  if (items.length > 0) {
    return items[0];
  }
  return null;
};

getAllUser = async () => {
  let { resources: items } = await client.database("gql-db").container("gql-container")
    .items.query({ query: "SELECT * from c" }).fetchAll();
  return items;
};

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    user: getUser,
    users: getAllUser
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

exports.graphqlHandler = server.createHandler();
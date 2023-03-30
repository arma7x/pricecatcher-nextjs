import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { gql } from 'graphql-tag';

const books = [
  {
    title: 'The Awakening',
    author: 'Kate Chopin',
  },
  {
    title: 'City of Glass',
    author: 'Paul Auster',
  },
];

const typeDefs = gql`#graphql
  type Book {
    title: String
    author: String
  }

  type Query {
    books: [Book]
    findBook(title: String!): Book
  }
`;

const resolvers = {
  Query: {
    books: () => books,
    findBook: (_, args) => {
      return books.find(book => book.title == args.title);
    }
  }
};

const apolloServer = new ApolloServer({ typeDefs, resolvers });

export default startServerAndCreateNextHandler(apolloServer);

import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { gql } from 'graphql-tag';
import { databaseInstance, itemGroups, itemCategories, premisesNestedLocations, searchItems, searchPremises, getPriceListJoinItems, getPriceListJoinPremises } from '../../database';

const typeDefs = gql`#graphql

  type Location {
    state: String
    district: String
    premise_type: [String]
  }

  type Item {
    item_code: Int
    item: String
    unit: String
    item_group: String
    item_category: String
  }

  type Premise {
    premise_code: Int
    premise: String
    address: String
    premise_type: String
    state: String
    district: String
  }

  type SearchPremisesQueryOutput {
    premises: [Premise]
    previous: Int
    current: Int
    next: Int
    total: Int
    limit: Int
  }

  type PriceJoinPremise {
    date: String
    premise_code: Int
    item_code: Int
    price: Float
    premise: String
    address: String
    premise_type: String
    state: String
    district: String
  }

  type PriceJoinItem {
    premise_code: Int
    date: String
    price: Float
    item_code: Int
    item: String
    unit: String
    item_group: String
    item_category: String
  }

  type Query {
    itemGroups: [String]
    itemCategories: [String]
    premisesNestedLocations: [Location]
    searchItems(item_group: String, item_category: String, limit: Int): [Item]
    searchPremises(state: String, district: String, premise_type: String, page: Int, limit: Int): SearchPremisesQueryOutput
    getPriceListJoinPremises(item_code: Int!, state: String, district: String, premise_type: String): [PriceJoinPremise]
    getPriceListJoinItems(premise_code: Int, item_group: String, item_category: String): [PriceJoinItem]
  }
`;

const resolvers = {
  Query: {
    itemGroups: async () => {
      return await itemGroups;
    },
    itemCategories: async () => {
      return await itemCategories;
    },
    premisesNestedLocations: async () => {
      const result = [];
      const locations = await premisesNestedLocations;
      for (let state in locations) {
        for (let district in locations[state]) {
          result.push({
            state: state,
            district: district,
            premise_type: locations[state][district]
          });
        }
      }
      return result;
    },
    searchItems: async (_, args) => {
      let query = {};
      if (args.item_group != null)
        query.item_group = args.item_group;
      if (args.item_category != null)
        query.item_category = args.item_category;
      return searchItems(databaseInstance, query, args.limit);
    },
    searchPremises: async (_, args) => {
      let query = {};
      if (args.state != null)
        query.state = args.state;
      if (args.district != null)
        query.district = args.district;
      if (args.premise_type != null)
        query.premise_type = args.premise_type;
      if (args.page != null)
        query.page = args.page;
      return searchPremises(databaseInstance, query, args.limit);
    },
    getPriceListJoinPremises: async (_, args) => {
      let query = {
        item_code: args.item_code
      };
      if (args.state != null)
        query.state = args.state;
      if (args.district != null)
        query.district = args.district;
      if (args.premise_type != null)
        query.premise_type = args.premise_type;
      return getPriceListJoinPremises(databaseInstance, query);
    },
    getPriceListJoinItems: async (_, args) => {
      let query = {};
      if (args.premise_code != null)
        query.premise_code = args.premise_code;
      if (args.item_group != null)
        query.item_group = args.item_group;
      if (args.item_category != null)
        query.item_category = args.item_category;
      return getPriceListJoinItems(databaseInstance, query);
    }
  }
};

const apolloServer = new ApolloServer({ typeDefs, resolvers });

export default startServerAndCreateNextHandler(apolloServer);

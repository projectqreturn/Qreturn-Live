import mongoose from "mongoose";
import { MongoClient } from 'mongodb';

const MONGODB_URL = process.env.MONGODB_URL;

/**
 * @typedef {Object} MongooseConn
 * @property {mongoose.Mongoose|null} conn - Mongoose connection
 * @property {Promise<mongoose.Mongoose>|null} promise - Connection promise
 */

/**
 * Cached connection to avoid multiple connections
 * @type {MongooseConn}
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

/**
 * Connect to MongoDB and return the connection
 * @returns {Promise<mongoose.Mongoose>} Mongoose connection
 */
export const connect = async () => {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URL) {
    throw new Error("MONGODB_URL is not defined in environment variables");
  }

  cached.promise = 
    cached.promise || 
    mongoose.connect(MONGODB_URL, {
      dbName: "qreturn-db",
      bufferCommands: false,
      connectTimeoutMS: 30000,
    });

  cached.conn = await cached.promise;
  return cached.conn;
};

/**
 * Cached MongoDB native client connection
 */
let cachedClient = global.mongoClient;

if (!cachedClient) {
  cachedClient = global.mongoClient = {
    client: null,
    promise: null,
  };
}

/**
 * Connect to MongoDB using native driver and return database instance
 * Used for push notification subscriptions and other native operations
 * @returns {Promise<import('mongodb').Db>} MongoDB database instance
 */
const connectToDatabase = async () => {
  if (cachedClient.client) {
    return cachedClient.client.db('qreturn-db');
  }

  if (!MONGODB_URL) {
    throw new Error("MONGODB_URL is not defined in environment variables");
  }

  if (!cachedClient.promise) {
    const options = {
      maxPoolSize: 10,
      minPoolSize: 5,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    };

    cachedClient.promise = MongoClient.connect(MONGODB_URL, options);
  }

  cachedClient.client = await cachedClient.promise;
  return cachedClient.client.db('qreturn-db');
};

export default connectToDatabase;
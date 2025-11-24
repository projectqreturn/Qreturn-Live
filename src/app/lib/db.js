import mongoose from "mongoose";

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
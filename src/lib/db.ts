import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

function getMongoUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }
  return uri;
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(getMongoUri(), {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 20,
      minPoolSize: 2,
      retryWrites: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // A rejected promise would otherwise be reused forever, pinning this instance to a dead connection.
    cached.promise = null;
    cached.conn = null;
    throw err;
  }
  return cached.conn;
}

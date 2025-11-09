import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

// Database name
const DB_NAME = 'wallet-health';

// Collections
export const COLLECTIONS = {
  WALLET_SCANS: 'walletScans',
  USER_PREFERENCES: 'userPreferences',
  SCAN_HISTORY: 'scanHistory',
};

// Helper to get database
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db(DB_NAME);
}

// Helper functions for wallet scans
export async function saveWalletScan(data: {
  walletAddress: string;
  chainId: number;
  score: number;
  riskLevel: string;
  approvals: any[];
  tokens: any[];
  alerts: any[];
  timestamp: number;
}) {
  const db = await getDatabase();
  const collection = db.collection(COLLECTIONS.WALLET_SCANS);
  
  return await collection.insertOne({
    ...data,
    createdAt: new Date(),
  });
}

export async function getLatestScan(walletAddress: string, chainId?: number) {
  const db = await getDatabase();
  const collection = db.collection(COLLECTIONS.WALLET_SCANS);
  
  const query: any = { walletAddress: walletAddress.toLowerCase() };
  if (chainId) {
    query.chainId = chainId;
  }
  
  return await collection.findOne(query, {
    sort: { timestamp: -1 },
  });
}

export async function getScanHistory(walletAddress: string, limit = 10) {
  const db = await getDatabase();
  const collection = db.collection(COLLECTIONS.WALLET_SCANS);
  
  return await collection
    .find({ walletAddress: walletAddress.toLowerCase() })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
}

// Helper functions for user preferences
export async function getUserPreferences(walletAddress: string) {
  const db = await getDatabase();
  const collection = db.collection(COLLECTIONS.USER_PREFERENCES);
  
  return await collection.findOne({
    walletAddress: walletAddress.toLowerCase(),
  });
}

export async function saveUserPreferences(data: {
  walletAddress: string;
  hiddenTokens?: string[];
  notifications?: boolean;
  theme?: string;
}) {
  const db = await getDatabase();
  const collection = db.collection(COLLECTIONS.USER_PREFERENCES);
  
  return await collection.updateOne(
    { walletAddress: data.walletAddress.toLowerCase() },
    { $set: { ...data, updatedAt: new Date() } },
    { upsert: true }
  );
}


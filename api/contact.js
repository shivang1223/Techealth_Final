const { MongoClient } = require('mongodb');

let cachedDb = null;

async function connectDB() {
  if (cachedDb) return cachedDb;
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  cachedDb = client.db(process.env.DB_NAME || 'techealth');
  return cachedDb;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  try {
    const body = req.body;

    if (!body.name || !body.email) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields.' });
    }

    const db = await connectDB();

    // Route to correct collection based on form type
    const collection = body.type === 'Demo Request' ? 'demo_requests' : 'contact_messages';

    const doc = {
      ...body,
      created_at: new Date(),
    };

    const result = await db.collection(collection).insertOne(doc);

    console.log(`Saved ${body.type} — _id: ${result.insertedId}`);
    return res.status(200).json({ status: 'ok', insertedId: result.insertedId });

  } catch (err) {
    console.error('Contact form error:', err);
    return res.status(500).json({ status: 'error', message: 'Database error. Please try again.' });
  }
}

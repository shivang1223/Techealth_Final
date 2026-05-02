const { MongoClient } = require('mongodb');

// Reuse DB connection across warm Lambda invocations
let cachedDb = null;

async function connectDB() {
  if (cachedDb) return cachedDb;
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  cachedDb = client.db(process.env.DB_NAME || 'techealth');
  return cachedDb;
}

export default async function handler(req, res) {
  // ── CORS ──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  try {
    const {
      ref_id, date_signed, full_name, address, city,
      state_pin, vehicle_no, vehicle_type, phone, email, signature,
    } = req.body;

    if (!full_name || !vehicle_no || !vehicle_type || !phone || !address) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields.' });
    }

    const db = await connectDB();

    const doc = {
      ref_id,
      date_signed,
      full_name,
      address,
      city,
      state_pin,
      vehicle_no: vehicle_no?.toUpperCase(),
      vehicle_type,
      phone,
      email: email || null,
      signature,
      created_at: new Date(),
    };

    const result = await db.collection('consent_forms').insertOne(doc);

    console.log(`Saved — ref: ${ref_id} | _id: ${result.insertedId}`);
    return res.status(200).json({ status: 'ok', insertedId: result.insertedId });

  } catch (err) {
    console.error('Submission error:', err);
    return res.status(500).json({ status: 'error', message: 'Database error. Please try again.' });
  }
}

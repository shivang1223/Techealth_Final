require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' })); // signature is a base64 PNG — needs higher limit

/* ── MongoDB connection ── */
const client = new MongoClient(process.env.MONGODB_URI);
let db;

async function connectDB() {
  await client.connect();
  db = client.db(process.env.DB_NAME || 'techealth');
  console.log(`✅ Connected to MongoDB — database: "${db.databaseName}"`);
}

/* ── POST /api/submit ── */
app.post('/api/submit', async (req, res) => {
  try {
    const {
      ref_id, date_signed, full_name, address, city,
      state_pin, vehicle_no, vehicle_type, phone, email, signature,
    } = req.body;

    // Basic server-side validation
    if (!full_name || !vehicle_no || !vehicle_type || !phone || !address) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields.' });
    }

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
      signature,          // base64 PNG data URL
      created_at: new Date(),
    };

    const result = await db.collection('consent_forms').insertOne(doc);

    console.log(`📄 New submission saved — ref: ${ref_id} | _id: ${result.insertedId}`);
    res.json({ status: 'ok', insertedId: result.insertedId });

  } catch (err) {
    console.error('❌ Submission error:', err);
    res.status(500).json({ status: 'error', message: 'Database error. Please try again.' });
  }
});

/* ── Health check ── */
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

/* ── Start ── */
const PORT = process.env.PORT || 3000;
connectDB()
  .then(() => app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`)))
  .catch(err => { console.error('Failed to connect to MongoDB:', err); process.exit(1); });

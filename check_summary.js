const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: 'backend/.env' });

async function check() {
    const client = new MongoClient(process.env.DATABASE_URL);
    await client.connect();
    const db = client.db('summpdf');
    const summary = await db.collection('pdf_summaries').findOne({ _id: new ObjectId('69cd4e5ca48b6cd247c42421') });
    console.log('Summary Text length:', summary.summary_text ? summary.summary_text.length : 'null');
    // console.log('Summary Text preview:', summary.summary_text ? summary.summary_text.substring(0, 500) : 'null');
    await client.close();
}

check().catch(console.error);

import clientPromise from '../../lib/mongo/index'

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('MyPage'); // Replace with your database name

    // Example: Query a collection
    const data = await db.collection('YtUrls').find({}).limit(10).toArray();

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}
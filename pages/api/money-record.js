// pages/api/money-record.js
import {clientPromise, ObjectId} from '../../lib/mongodb';

export default async function handler(req, res) {
//   try {
//     const client = await clientPromise;
//     const db = client.db('MyPage'); // Replace with your database name

//     // Example: Query a collection
//     const data = await db.collection('YtUrls').find({}).limit(10).toArray();

//     res.status(200).json({ success: true, data });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, error: 'Server error' });
//   }

  switch(req.method) {
    case 'GET':
        try {
            const client = await clientPromise;
            const db = client.db('MyPage'); // Replace with your database name

            // Example: Query a collection
            const data = await db.collection('moneyRecord').find({}).limit(10).toArray();

            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: 'Server error' });
        }
        break;
    case 'POST':
        try {
            const client = await clientPromise;
            const db = client.db('MyPage'); // Replace with your database name

            const newData = await db.collection('moneyRecord').insertOne(JSON.parse(req.body));

            res.status(201).json(newData);
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: 'Server error' });
        }
        break;
    case 'DELETE':
        try {
            const client = await clientPromise;
            const db = client.db('MyPage'); // Replace with your database name

            const deleteData = await db.collection('moneyRecord').deleteOne({_id: new ObjectId(req.body)});
            console.log(req.body);

            res.status(201).json(deleteData);
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: 'Server error' });
        }
        break;
    default:
        res.status(405).json({ error: 'Method not allowed' });
  }
}
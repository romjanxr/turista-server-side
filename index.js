const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mhdj2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('TuristaDB');
        const packageCollection = database.collection('packages');
        const bookingCollection = database.collection('bookings');

        // GET API
        app.get('/packages', async (req, res) => {
            const cursor = packageCollection.find({});
            const packages = await cursor.toArray();
            res.send(packages);
        })

        // Package Post API
        app.post('/packages', async (req, res) => {
            const package = req.body;
            const result = await packageCollection.insertOne(package);
            res.json(result);
        });

        // single Package Get API
        app.get('/packages/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const package = await packageCollection.findOne(query);
            res.json(package);
        });;

        // POST API FOR ORDERS
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.json(result);
        })

        // Get My Order Details API
        app.get('/myorders', async (req, res) => {
            const email = req.query.email;
            let bookings;
            if (email) {
                const query = { email: email }
                bookings = await bookingCollection.find(query).toArray();
            }
            else {
                bookings = await bookingCollection.find({}).toArray();
            }
            res.send(bookings);
        })

        //Update Single Order Status
        app.put('/myorders/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body.status;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: status
                },
            };
            const result = await bookingCollection.updateOne(filter, updateDoc, options)

            res.json(result);
        })

        // DELETE A ORDERS
        app.delete('/myorders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await bookingCollection.deleteOne(query);
            res.json(result);
        })


    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('tourism server is running')
})

app.listen(port, () => {
    console.log('tourism server is running on port', port);
})
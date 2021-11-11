const express = require('express')
const app = express()
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const { MongoClient } = require('mongodb');

const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
const uri = "mongodb+srv://assignment-12:REpfrOMtFRHMrMz7@cluster0.faszq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        const database = client.db("superCarShop");
        const servicesCollection = database.collection('services');
        const reviewsCollection = database.collection('reviews');
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users');
        //--------============ get services ==================
        app.get("/services", async (req, res) => {
            const cursor = servicesCollection.find();
            const services = await cursor.toArray();
            res.json(services);

        })
        //================= add a service ====================
        app.post("/services", async (req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            res.json(result)
        })
        // ==========================get orders ========================
        app.get("/orders", async (req, res) => {
            const cursor = ordersCollection.find();
            const orders = await cursor.toArray();
            res.json(orders)
        })
        // ===========send email and name =============
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
        // ==========================delete a single order================ 
        app.delete("/orders/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result)
        })
        // ==================get a data by id =========================
        app.get("/services/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await servicesCollection.findOne(query);

            res.json(result)

        })
        //====================== get order by email ======================
        app.get("/orders/:email", async (req, res) => {
            const emails = req.params.email;
            const query = { email: { $regex: emails } }
            const result = await ordersCollection.find(query).toArray();
            res.json(result)
        })
        //=================== get reviews ========================
        app.get("/reviews", async (req, res) => {
            const cursor = reviewsCollection.find();
            const reviews = await cursor.toArray();
            res.json(reviews);
        })
        // =====================send reviews to database =======================
        app.post("/reviews", async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result)
        })
        // =============================purchase order==================== 
        app.post("/orders", async (req, res) => {
            const order = req.body;

            const result = await ordersCollection.insertOne(order);
            res.json(result)
        })


    }
    finally {
        // await client.close();
    }

}

run().catch(console.dir);
app.get('/', (req, res) => {
    res.send(' hello Super car shop!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})
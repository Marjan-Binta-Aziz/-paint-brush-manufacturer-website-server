const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const jwt = require("jsonwebtoken");
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;



DB_USER=manufacturerWebsite
DB_PASS=rFg2jMVERm6n8LSK

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ie7h5.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(403).send({ message: "Unauthorized Access" });
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
      if (error) {
        return res.status(401).send({ message: "Forbidden Access" });
      } else {
        req.verified = decoded;
        next();
      }
    });
  }
async function run(){
    try{
        await client.connect();
        const toolCollection = client.db("manufacturer-website").collection("tools");
        const bookingCollection = client.db("manufacturer-website").collection("bookings");
        const reviewCollection = client.db("manufacturer-website").collection("reviews");
        const userCollection = client.db("manufacturer-website").collection("users");
        

        app.put("/users", async (req, res) => {
            const email = req.query.email;
            const user = req.body;
            const filter = { email };
            const options = { upsert: true };
            const updatedDoc = {
              $set: user,
            };
            const result = await userCollection.updateOne(
              filter,
              updatedDoc,
              options
            );
            const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
              expiresIn: "1d",
            });
            res.send({ result, accessToken: token });
          });
          app.get("/users", async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
          });
          app.put("/usersById", async (req, res) => {
            const id = req.query.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
              $set: {
                role: "admin",
              },
            };
            const result = await userCollection.updateOne(
                filter,
                updatedDoc,
                options
              );
              res.send(result);
            });

            app.put("/usersByEmail", async (req, res) => {
                const email = req.query.email;
                const mobile = req.body;
                const filter = { email };
                const updatedDoc = {
                $set: mobile,
                };
                const result = await userCollection.updateOne(filter, updatedDoc);
                res.send(result);
            });
            app.get("/usersByEmail", async (req, res) => {
                const email = req.query.email;
                const result = await userCollection.findOne({ email });
                res.send(result);
            });


        app.get('/tool', async(req, res) =>{
            const query = {};
            const cursor = toolCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);
        });


        app.post("/booking", async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
          });

          app.get("/bookingByEmail", verifyJWT, async (req, res) => {
            const email = req.query.email;
            const result = await bookingCollection.find({ email }).toArray();
            res.send(result);
          });
          app.get("/bookingById/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await purchaseCollection.findOne(query);
            res.send(result);
          });
          app.delete("/bookingById/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await purchaseCollection.deleteOne(query);
            res.send(result);
          });
          app.put("/bookingById/:id", async (req, res) => {
            const id = req.params.id;
            const item = req.body;
            const filter = { _id: ObjectId(id) };
            const updatedDoc = {
              $set: item,
            };
            const result = await purchaseCollection.updateOne(filter, updatedDoc);
            res.send(result);
          });

          app.get("/toolsById", async (req, res) => {
            const id = req.query.id;
            const query = { _id: ObjectId(id) };
            const result = await toolCollection.findOne(query);
            res.send(result);
          });

          app.delete("/toolsById", async (req, res) => {
            const id = req.query.id;
            const query = { _id: ObjectId(id) };
            const result = await toolCollection.deleteOne(query);
            res.send(result);
        });

        
        
        

        // Add review to database collection
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
        })

        // Find review to database collection
        app.get('/review/', async (req, res) => {
            const result = await reviewCollection.find({}).toArray();
            res.send(result);
        })
    }
    finally {    }
}
run().catch(console.dir);


//middle wire
app.use(cors());
app.use(express.json());

 
app.get('/' , (req, res) => {
    res.send('Paint-Brush')
})
 
app.listen(port,()=>{
    console.log('Brush to Rush:', port);
})

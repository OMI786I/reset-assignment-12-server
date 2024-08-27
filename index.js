const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
// middleware

app.use(cors());
app.use(express.json());

console.log(process.env.MONGO_USER_NAME);
const uri = `mongodb+srv://${process.env.MONGO_USER_NAME}:${process.env.MONGO_PASSWORD}@cluster0.ymyoldm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const donorCollection = client.db("FinalAssignment").collection("donor");

    //donor related apis
    //sending on server
    app.post("/donor", async (req, res) => {
      const newDonor = req.body;
      console.log(newDonor);
      const result = await donorCollection.insertOne(newDonor);
      res.send(result);
    });

    //for reading from mongodb

    app.get("/donor", async (req, res) => {
      let query = {};
      if (req.query?.district) {
        query = { district: req.query.district };
      }
      if (req.query?.upazilla) {
        query.upazilla = req.query.upazilla;
      }
      if (req.query?.blood) {
        query.blood = req.query.blood;
      }
      if (req.query?.email) {
        query.email = req.query.email;
      }

      const cursor = donorCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/donor/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await donorCollection.findOne(query);
      res.send(result);
    });

    //updating data of mongodb data

    app.put("/donor/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDonor = req.body;

      const donor = {
        $set: {
          name: updatedDonor.name,
          image: updatedDonor.image,
          district: updatedDonor.district,
          upazilla: updatedDonor.upazilla,
          blood: updatedDonor.blood,
        },
      };
      const result = await donorCollection.updateOne(filter, donor, options);
      res.send(result);
      console.log(result);
    });

    const donorRequestCollection = client
      .db("FinalAssignment")
      .collection("requestDonor");

    //collection related apis
    //sending on server
    app.post("/requestDonor", async (req, res) => {
      const newDonor = req.body;
      console.log(newDonor);
      const result = await donorRequestCollection.insertOne(newDonor);
      res.send(result);
    });

    //for reading from mongodb

    app.get("/requestDonor", async (req, res) => {
      let query = {};

      if (req.query?.requesterEmail) {
        query.requesterEmail = req.query.requesterEmail;
      }

      const cursor = donorRequestCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();
    // Send a ping to confirm a successful connection
    //await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(" server is running");
});

app.listen(port, () => {
  console.log(` server is running on port: ${port}`);
});

const express = require("express");
const router = express.Router();
const { client } = require("../config/db");
const { ObjectId } = require('mongodb');
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const usersCollection = client.db("LaptopGallery").collection("users");

// Show all Users
router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  const result = await usersCollection.find().toArray();
  res.send(result);
});

// User account create
router.post('/', async (req, res) => {
  const user = req.body;
  user.status = 'user';
  // insert email id users doesn't exist
  const query = { email: user.email };
  const existingUser = await usersCollection.findOne(query);
  if (existingUser) {
    // console.log(existingUser);
    return res.send({ message: 'user already exists', insertedId: null })
  }
  const result = usersCollection.insertOne(user);
  res.send(result);
})


// Admin Check Api (valid Admin Or UnValid Admin)
router.get('/admin/:email', verifyToken, verifyAdmin, async (req, res) => {
  const email = req.params.email;
  // console.log(email)
  const query = { email: email }
  const user = await usersCollection.findOne(query);
  let admin = false;
  if (user) {
    admin = user?.status === 'admin'
  }
  res.send({ admin });
})




// Dashboard users delete
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await usersCollection.deleteOne(query);
  res.send(result);
})



module.exports = router;
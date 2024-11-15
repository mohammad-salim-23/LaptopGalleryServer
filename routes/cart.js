const express = require("express");
const router = express.Router();
const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const cartsCollection = client.db("LaptopGallery").collection("carts");

// cart information post on mongo db

router.post("/", async (req, res) => {
  try {
    const cart = req.body;
    const result = await cartsCollection.insertOne(cart);
    res.send(result)
  } catch (error) {
    // console.error("Error adding laptop:", error);
    res.status(500).send();
  }
});

router.get('/', async (req, res) => {
  const cartInfo = await cartsCollection.find(req.body).toArray();
  res.send(cartInfo)
})

router.get('/:email', async (req, res) => {
  const query = { email: req.params.email }
  const result = await cartsCollection.find(query).sort({ _id: -1 }).toArray();
  res.send(result)
})



router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await cartsCollection.deleteOne(query);
  res.send(result);
})

module.exports = router;
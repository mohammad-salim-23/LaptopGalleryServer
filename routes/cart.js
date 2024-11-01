const express = require("express");
const router = express.Router();
const { client } = require("../config/db");

const cartsCollection = client.db("LaptopGallery").collection("carts");

// cart information post on mongo db

router.post("/", async (req, res) => {
  try {
    const cart = req.body;
    const result = await cartsCollection.insertOne(cart);
    res.send(result)
  } catch (error) {
    console.error("Error adding laptop:", error);
    res.status(500).send();
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const { client } = require("../config/db");
const { ObjectId } = require('mongodb');

const productsCollection = client.db("LaptopGallery").collection("products");

// show all products Data
router.get("/", async (req, res) => {
  const result = await productsCollection.find().toArray();
  res.send(result);
});



// Save Products in mongodb with random productsId
router.post('/', async (req, res) => {
  const products = req.body;
  const productsId = new ObjectId().toString().slice(0, 8);

  const formattedProductsId = productsId.split('').map(char => {
    return Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase();
  }).join('');

  const lgProductsId = `LG${formattedProductsId}`;
  products.productId = lgProductsId;
  const result = await productsCollection.insertOne(products);
  res.send(result);
  // console.log(lgProductsId);
});




module.exports = router;

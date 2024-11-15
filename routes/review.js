const express = require("express");
const router = express.Router();
const { client } = require("../config/db");


const reviewCollection = client.db("LaptopGallery").collection("review");

router.get("/", async (req, res) => {
  const result = await reviewCollection.find().sort({ _id: -1 }).toArray();
  res.send(result);
});


router.post('/', async (req, res) => {
  const query = req.body;
 
  
 
  const result = reviewCollection.insertOne(query);
  res.send(result);
})










module.exports = router;
const express = require("express");
const router = express.Router();
const { client } = require("../config/db");

const LaptopCollection = client.db("LaptopGallery").collection("laptop");

// Fetch all laptop

router.get("/laptops", async (req, res) => {
  const result = await LaptopCollection.find().toArray();
  res.send(result);
});

 


module.exports = router;

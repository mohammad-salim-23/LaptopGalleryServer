const express = require("express");
const router = express.Router();
const { client } = require("../config/db");

const usersCollection = client.db("LaptopGallery").collection("laptop");

// Fetch all users
router.get("/", async (req, res) => {
  const result = await usersCollection.find().toArray();
  res.send(result);
});

 
 


module.exports = router;

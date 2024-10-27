const express = require("express");
const router = express.Router();
const { client } = require("../config/db");

const LaptopCollection = client.db("LaptopGallery").collection("laptop");

// Fetch all laptop
router.post("/laptops", async (req, res) => {
  try {
    const newLaptop = req.body;
    const result = await LaptopCollection.insertOne(newLaptop);
    res.status(201).send({ laptopId: result.insertedId });
  } catch (error) {
    console.error("Error adding laptop:", error);
    res.status(500).send();
  }
});

router.get("/laptops", async (req, res) => {
  const result = await LaptopCollection.find().toArray();
  res.send(result);
});

 


module.exports = router;

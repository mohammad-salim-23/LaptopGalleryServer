const express = require("express");
const router = express.Router();
const { client } = require("../config/db");

const productsCollection = client.db("LaptopGallery").collection("products");

// show all products Data
router.get("/", async (req, res) => {
    const result = await productsCollection.find().toArray();
    res.send(result);
  });
  
   


// Add a new laptop
// router.post("/", async (req, res) => {
//   try {
//     const newLaptop = req.body;
//     const result = await productsCollection.insertOne(newLaptop);
//     res.status(201).send({ laptopId: result.insertedId });
//   } catch (error) {
//     console.error("Error adding laptop:", error);
//     res.status(500).send();
//   }
// });

module.exports = router;

const express = require("express");
const router = express.Router();
const { client } = require("../config/db");
const { ObjectId } = require("mongodb");


const compareCollection = client.db("LaptopGallery").collection("compare");

router.get('/', async (req, res) => {
    const email = req.query.email;
    console.log(email)
    const query = { userEmail: email }
    const result = await compareCollection.find(query).toArray();
    res.send(result)
  })


router.post('/', async (req, res) => {
  const query = req.body;
 
  
 
  const result = compareCollection.insertOne(query);
  res.send(result);
})


router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: (id) };
  const result = await compareCollection.deleteOne(query);
  res.send(result);
})







module.exports = router;
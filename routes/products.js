const express = require("express");
const router = express.Router();
const { client } = require("../config/db");
const { ObjectId } = require('mongodb');
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const productsCollection = client.db("LaptopGallery").collection("products");

// Show All Laptop or Mobile or All Products
router.get('/', async (req, res) => {
  const { type, graphics, storage, ram, processor, model, brand } = req.query;
  // Create a dynamic filter object based on the query parameters
  const filter = {};

  if (type) filter.type = type;
  if (graphics) filter.graphics = graphics;
  if (storage) filter.storage = storage;
  if (ram) filter.ram = ram;
  if (processor) filter.processor = processor;
  if (model) filter.model = model;
  if (brand) filter.brand = brand;

  try {
    // Use the dynamic filter to fetch products from the collection
    const products = await productsCollection.find(filter).toArray();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});


// Save Products in mongodb with random productsId
router.post('/', async (req, res) => {
  const products = req.body;
  // console.log(products.model)
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

// Dashboard Laptop delete
router.delete('/:id',async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await productsCollection.deleteOne(query);
  res.send(result);
})

// Admin Dashboard Laptop update
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  // console.log(id)
  const query = { _id: new ObjectId(id) };
  const result = await productsCollection.findOne(query);
  res.send(result);
});


// ?Update Products
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const products = req.body;

  // Check if `id` is a valid ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ error: 'Invalid ID format' });
  }
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updateDoc = {
    $set: {
      title: products.title,
      brand: products.brand,
      model: products.model,
      processor: products.processor,
      ram: products.ram,
      storage: products.storage,
      display: products.display,
      color: products.color,
      operating_System: products.operating_System,
      price: products.price,
      regularPrice: products.regularPrice,
      status: products.status,
      description: products.description,
      warranty: products.warranty,
    },
  };

  try {
    const result = await productsCollection.updateOne(filter, updateDoc, options);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: 'An error occurred while updating the product.' });
  }
});


module.exports = router;

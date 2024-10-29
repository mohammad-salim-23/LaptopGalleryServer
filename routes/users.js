const express = require("express");
const router = express.Router();
const { client } = require("../config/db");

const UserCollection = client.db("LaptopGallery").collection("users");

// Show all Users
router.get("/", async (req, res) => {
  const result = await UserCollection.find().toArray();
  res.send(result);
});

 

router.post('/',async(req,res)=>{
    const user = req.body;
      user.status = 'user';
      // insert email id users doesn't exist
      const query = {email:user.email};
      const existingUser = await UserCollection.findOne(query);
      if(existingUser){
        console.log(existingUser);
        return res.send({message:'user already exists',insertedId:null})
      }
      const result = UserCollection.insertOne(user);
      res.send(result);
})

module.exports = router;
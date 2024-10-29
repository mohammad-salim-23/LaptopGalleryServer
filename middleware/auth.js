
const jwt = require("jsonwebtoken");
const verifyToken = (req,res,next)=>{
    console.log("inside verify Token",req.headers);
    if(!req.headers.authorization){
      return res.status(401).send({message:'unauthorized access'})
    }
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
      if(err){
        return res.status(401).send({message:'unauthorized access'})
      }
      req.decoded = decoded;
      next();
     })
    
  }
  const verifyAdmin = async(req,res,next)=>{
    const email = req.decoded.email;
    const query = {email:email};
    const user = await userCollection.findOne(query);
    const isAdmin = user?.role==='admin';
    if(!isAdmin){
      return res.status(403).send({message:'forbidden access true'});
    }
    next();
  }

  module.exports = { verifyToken,verifyAdmin }; 
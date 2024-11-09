const express = require("express");
const cors = require("cors");
require("dotenv").config();
// const jwt = require("jsonwebtoken");
const { connectDB } = require("./config/db");

const http = require("http");
const userRoutes = require("./routes/users")
const productsRoutes = require("./routes/products")
const cartRoutes = require("./routes/cart")
const paymentRoutes = require("./routes/payment")


const reviewRoutes = require("./routes/review")
const compareRoutes = require("./routes/Compare")

const app = express();
const port = process.env.PORT || 5000;


// Create an HTTP server
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://laptop-gallery.netlify.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to the database
connectDB();

// jwt related api
// app.post("/jwt", async (req, res) => {
//   const user = req.body;
//   console.log("jwt...", user);
//   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
//     expiresIn: "1h",
//   });
//   res.send({ token });
// });


// Use routes
app.use("/users", userRoutes);
app.use("/products", productsRoutes);
app.use("/cart", cartRoutes);
app.use("/payment", paymentRoutes);
app.use("/review", reviewRoutes);
app.use("/compare", compareRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("LaptopGallery Server Running");
});




// Start the server
server.listen(port, () => {
  console.log(`LaptopGallery sitting on server port ${port}`);
});


// Handle unhandled rejections and uncaught exceptions
process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason:", reason);
});


process.on("uncaughtException", (err) => {
  console.error("There was an uncaught error:", err);
});

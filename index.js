const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB } = require("./config/db");

const http = require("http");
const laptopRoutes = require("./routes/laptop");






const app = express();
const port = process.env.PORT || 5000;


// Create an HTTP server
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174"
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
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      console.log("jwt...", user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });
// Use routes
app.use("/laptop", laptopRoutes);


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

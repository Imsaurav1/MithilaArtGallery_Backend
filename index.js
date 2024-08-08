require('dotenv').config();

const initializeDatabase = require("./db"); // Path to your initializeDatabase.js
const cors=require("cors")

// Define global variables
global.foodItems = [];
global.categories = [];

initializeDatabase()
  .then((data) => {
    global.foodItems = data.foodItems;
    global.categories = data.categories;
    console.log("Database initialized with food data.");
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
  });

console.log(global);
const express = require("express");
const app = express();
const port = 5000;
app.use(cors({
  origin:"https://66b495a22d7b89d52c068235--beamish-meerkat-4fa116.netlify.app"
}))
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://66b495a22d7b89d52c068235--beamish-meerkat-4fa116.netlify.app");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", require("./routes/Auth"));

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});

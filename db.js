
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from a .env file

const mongoURI ='mongodb+srv://skjha9th:Saurabhjha@cluster0.ewg8cxv.mongodb.net/Gofoodmerarn?retryWrites=true&w=majority'; // Store your MongoDB URI in an environment variable

// const mongoURI = 'mongodb://localhost:27017/GoFoodmeranrn'; // Store your MongoDB URI in an environment variable



const initializeDatabase = async () => {
    if(!mongoURI){
        console.log('No MongoDB URI found');
    }
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to MongoDB");

        const db = mongoose.connection.db;

        const foodCollection = db.collection("foods_item");
        const categoryCollection = db.collection("food_category");

        const [foodItems, categories] = await Promise.all([
            foodCollection.find({}).toArray(),
            categoryCollection.find({}).toArray()
        ]);

        return { foodItems, categories };

    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        throw err;
    }
};

module.exports = initializeDatabase;

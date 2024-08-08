const express = require('express');
const User = require('../model/user');
const Order = require('../model/Orders');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetch = require('../middleware/fetchdetails');
const jwtSecret = "HaHa";
const axios = require("axios");

// Creating a user and storing data to MongoDB Atlas, No Login Required
router.post('/createuser', [
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
    body('name').isLength({ min: 3 })
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }
    const salt = await bcrypt.genSalt(10);
    let securePass = await bcrypt.hash(req.body.password, salt);

    try {
        await User.create({
            name: req.body.name,
            password: securePass,
            email: req.body.email,
            location: req.body.location
        }).then(user => {
            const data = {
                user: {
                    id: user.id
                }
            };
            const authToken = jwt.sign(data, jwtSecret);
            success = true;
            res.json({ success, authToken });
        }).catch(err => {
            //console.log(err);
            res.status(400).json({ success, error: "Please enter a unique value." });
        });
    } catch (error) {
       // console.error(error.message);
        res.status(500).send("Server Error");
    }
});

// Authentication a User, No login Required
router.post('/login', [
    body('email', "Enter a valid email").isEmail(),
    body('password', "Password cannot be blank").exists()
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success, error: "Try logging in with correct credentials" });
        }

        const pwdCompare = await bcrypt.compare(password, user.password);
        if (!pwdCompare) {
            return res.status(400).json({ success, error: "Try logging in with correct credentials" });
        }
        const data = {
            user: {
                id: user.id
            }
        };
        success = true;
        const authToken = jwt.sign(data, jwtSecret);
        res.json({ success, authToken, email });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

// Get logged in User details, Login Required
router.post('/getuser', fetch, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

// Get location, No login required
router.post('/getlocation', async (req, res) => {
    try {
        let lat = req.body.latlong.lat;
        let long = req.body.latlong.long;
        let location = await axios
            .get(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${long}&key=74c89b3be64946ac96d777d08b878d43`)
            .then(async res => {
                let response = res.data.results[0].components;
                let { village, county, state_district, state, postcode } = response;
                return `${village}, ${county}, ${state_district}, ${state}\n${postcode}`;
            }).catch(error => {
                //console.error(error);
                throw new Error('Location fetch error');
            });
        console.log(location);
        res.send({ location });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

// Fetch food data, No login required
router.post('/foodData', async (req, res) => {
    try {
        res.send([global.foodItems, global.categories]);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

// Place order, No login required
router.post('/orderData', async (req, res) => {
    let data = req.body.order_data;
    data.splice(0, 0, { Order_date: req.body.order_date });

    try {
        let eId = await Order.findOne({ 'email': req.body.email });
        if (eId === null) {
            await Order.create({
                email: req.body.email,
                order_data: [data]
            }).then(() => {
                res.json({ success: true });
            });
        } else {
            await Order.findOneAndUpdate(
                { email: req.body.email },
                { $push: { order_data: data } }
            ).then(() => {
                res.json({ success: true });
            });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

// Fetch order data, No login required
router.post('/myOrderData', async (req, res) => {
    try {
        const { email } = req.body;
        console.log("Received request for orders of email:", email); // Log incoming email

        let eId = await Order.findOne({ email });

        if (!eId) {
            return res.status(404).json({ message: 'No orders found for this email.' });
        }

        const formattedOrderData = eId.order_data.map(orderGroup => {
            const [date, ...items] = orderGroup;
            return { Order_date: date.Order_date, items };
        });

        res.json({ orderData: formattedOrderData });
    } catch (error) {
        console.error("Error fetching orders:", error); // Detailed error logging
        res.status(500).send("Server Error");
    }
});


module.exports = router;

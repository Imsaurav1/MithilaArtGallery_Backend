const jwt = require('jsonwebtoken');
const jwtSecret = "HaHa";

const fetch = (req, res, next) => {
    // Get the user from the JWT token and add id to req object
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ error: "No Auth Token Provided" });
    }
    try {
        const data = jwt.verify(token, jwtSecret);
        req.user = data.user;
        next();
    } catch (error) {
        return res.status(401).send({ error: "Invalid Auth Token" });
    }
};

module.exports = fetch;

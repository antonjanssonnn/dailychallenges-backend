const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const auth = (req, res, next) => {
  const token = req.headers.authorization;
  console.log("Token received:", token);

  if (!token) {
    return res.status(401).json({ message: 'Authorization denied. No token provided.' });
  }
  const updatedToken = token.split(' ')[1]; // Extract the token from the authHeader

  try {
    const decoded = jwt.verify(updatedToken, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    req.user = decoded.id;
    next();
  } catch (error) {
    console.error("Error while decoding token:", error);
    res.status(401).json({ message: 'Authorization denied. Invalid token.' });
  }
};

module.exports = auth;

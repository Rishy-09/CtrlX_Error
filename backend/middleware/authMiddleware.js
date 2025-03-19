import jwt from 'jsonwebtoken';
import User from "../models/User.js"

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization');

  if(!token) return res.status(401).json({message: 'Access denied. No token provided. '})

  try{
    const decoded = jwt.verify(token.replace('Bearer ', '').trim(), process.env.JWT_SECRET)
    
    // check if the user still exits
    const user = await User.findById(decoded.id)
    if(!user) return res.status(401).json({message: "User no longer exists."})
      
    req.user = user; // add user data to request object
    next()
  }
  catch(err){
    res.status(400).json({ message: 'Invalid token'})
  }
}

export default authMiddleware
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // No need to manually hash the password; pre('save') will handle it
    user = new User({ 
      name, 
      email, 
      password: password.trim(), // Pass raw password; schema middleware will hash it
      role: role || "Tester" 
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔍 Searching for User with email:", email);

    let user = await User.findOne({ email }).select("+password");
    console.log("🔍 Retrieved User from DB:", user);

    if (!user) return res.status(400).json({ message: "Invalid credentials (email)" });

    console.log("Entered password:", password);
    console.log("Stored hash:", user.password);

    const isMatch = await bcrypt.compare(password.trim(), user.password);
    console.log("Password Comparison Result:", isMatch);

    if (!isMatch) return res.status(400).json({ message: "Invalid credentials (passcode)" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "6h" });
    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }

};

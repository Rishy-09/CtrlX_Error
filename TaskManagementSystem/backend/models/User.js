import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        profileImageURL: {
            type: String,
            default: null,
        },
        role: {
            type: String,
            enum: ["admin", "developer", "tester"], // Updated roles for bug tracking
            default: "tester", // Default role is tester
        },
        department: {
            type: String,
            default: "General",
        },
        title: {
            type: String,
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLogin: {
            type: Date,
            default: null,
        }
    },
    { 
        timestamps: true 
    }
);

const User = mongoose.model("User", UserSchema);
export default User;
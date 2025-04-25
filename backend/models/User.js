import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: [50, "Name cannot be more than 50 characters"]
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please add a valid email"
            ]
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"]
        },
        profileImageURL: {
            type: String,
            default: "https://res.cloudinary.com/dykjpvgga/image/upload/v1674645487/a9ljktjl3o8f2fbwm2kt.jpg"
        },
        role: {
            type: String,
            enum: ["admin", "developer", "tester"],
            default: "tester"
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
            default: Date.now
        },
        resetPasswordToken: {
            type: String
        },
        resetPasswordExpires: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", UserSchema);

export default User;
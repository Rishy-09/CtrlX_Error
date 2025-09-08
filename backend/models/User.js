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
            enum: ["admin", "tester", "developer"], 
            default: "tester",
        }
    },
    { 
        timestamps: true 
    }
);

const User = mongoose.model("User", UserSchema);
export default User;
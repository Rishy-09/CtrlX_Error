import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGODB_URI,{
            // useNewUrlParser: true, // makes Mongoose use the new, improved parser.
            // useUnifiedTopology: true, // Removes old connection management logic and improves performance.
        });
        console.log("MongoDB Connected")
    }
    catch(err){
        console.log("DB Connection Error: ", err)
        process.exit(1)     // exit process with failure
    }
}

export default connectDB
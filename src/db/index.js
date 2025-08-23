
import mongoose from "mongoose";
import { db_name } from "../constants.js";

async function connectdb() {
    try {
        const connectionInsence=await mongoose.connect(`${process.env.MONGODB_URI}/${db_name}`)
        console.log(`\n DATABASE CONNECTED SUCESSFULLY!!! DB HOST ; ${connectionInsence.connection.host}`)
    } catch (error) {
        console.error("DATABASE CONNECTION FAILED",error)
        process.exit(1)
    }
}

export default connectdb
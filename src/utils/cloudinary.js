import dotenv from "dotenv"
dotenv.config()
import { v2 as cloudinary } from "cloudinary";
import fs from "fs"


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary=async (localfilepath)=>{
    try {
        if (!localfilepath) return null

        // uplaod file on cloudinary
        const response = await cloudinary.uploader.upload(localfilepath,{
            resource_type: "auto"
        })

        // file has been successfully uploaded
        // console.log(response)
        // console.log("file uploaded on cloudinary",response.secure_url)
        fs.unlinkSync(localfilepath)
        return response
    } catch (error) {
        console.log("cloudinary upload error",error)
        fs.unlinkSync(localfilepath) //remove the locally saved temporary file as the upload operation got failed
        return null
    }
}

export {uploadOnCloudinary}
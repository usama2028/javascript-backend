import { v2 as cloudinary } from cloudinary
import fs from "fs"


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudnary=async (localfilepath)=>{
    try {
        if (!localfilepath) return null

        // uplaod file on cloudinary
        let response = await cloudinary.uploader.upload(localfilepath,{
            resource_type: "auto"
        })

        // file has been sucssfully uploaded
        console.log("file is uploaded on cloudinary",response.url)
        return response
    } catch (error) {
        fs.unlinkSync(localfilepath) //remove the locally saved temporary file as the upload opertaion got failed    }
    }
}
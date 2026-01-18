const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (filePath) => {
    try {
        if (!filePath) return null;

        // Upload the file on cloudinary
        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto",
            folder: "mibcs_events"
        });

        // file has been uploaded successfully
        console.log("file is uploaded on cloudinary ", response.url);

        // remove the locally saved temporary file
        fs.unlinkSync(filePath);

        return response;
    } catch (error) {
        // remove the locally saved temporary file as the upload operation got failed
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return null;
    }
};

module.exports = { uploadToCloudinary };

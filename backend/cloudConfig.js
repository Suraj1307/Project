const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const requiredCloudinaryEnvVars = ["CLOUD_NAME", "CLOUD_API_KEY", "CLOUD_API_SECRET"];
const missingCloudinaryEnvVars = requiredCloudinaryEnvVars.filter((key) => !process.env[key]);

if (missingCloudinaryEnvVars.length) {
  throw new Error(`Missing Cloudinary configuration: ${missingCloudinaryEnvVars.join(", ")}`);
}

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "StaySpot",
    allowed_formats: ["jpeg", "png", "jpg"],
  },
});

module.exports = { cloudinary, storage };

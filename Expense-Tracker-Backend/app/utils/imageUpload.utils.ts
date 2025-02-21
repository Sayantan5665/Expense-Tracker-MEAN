import multer, { StorageEngine, diskStorage, Multer } from "multer";
import { existsSync, mkdirSync, unlink } from "fs";
import path, { extname } from "path";
import { Request } from "express";

// Checking if the uploads folder exists or no, if not then create one
const uploadDir:string = './uploads';
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

const storage:StorageEngine = diskStorage({
  destination: function (req:Request, file:Express.Multer.File, cb) {
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req:Request, file:Express.Multer.File, cb) {
    const uniqueSuffix:string = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext:string = extname(file.originalname);
    cb(null, uniqueSuffix+ext);
  }
})

const fileFilterImage = (req:Request, file:Express.Multer.File, cb:any) => {
  const allowedFiles = ['image/jpeg', 'image/jpg', 'image/apng', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (allowedFiles.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only images are allowed!'));
  }
}

export const uploadImage:Multer = multer({ 
  storage: storage, 
  limits: { fileSize: 1024 * 1024 * 10 },   // limit 10MB
  fileFilter: fileFilterImage 
});


/**
 * Deletes an uploaded image from the server.
 *
 * @remarks
 * This function checks if the provided `existingImageName` is not empty and not equal to the `defaultImageName`.
 * If these conditions are met, it attempts to delete the corresponding image from the server's 'uploads' directory.
 * If an error occurs during the deletion process, it logs the error to the console.
 * If the deletion is successful, it logs a success message to the console.
 *
 * @param existingImageName - The name of the existing image to be deleted.
 * @param defaultImageName - The name of the default image. If `existingImageName` is equal to this, the image will not be deleted.
 *
 * @returns {void}
 */
export const deleteUploadedImage = (existingImageName: string, defaultImageName:string): void => {
  if (existingImageName && existingImageName !== defaultImageName) {
    unlink(path.join(__dirname, '..', '..', 'uploads', existingImageName), (err) => {
      if (err) console.error(`Error deleting image: ${err}`);
      else {
        console.log('image deleted successfully');
      }
    });
  }
}
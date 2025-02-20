import multer, { StorageEngine, diskStorage, Multer } from "multer";
import { existsSync, mkdirSync, unlink } from "fs";
import path, { extname } from "path";
import { Request } from "express";

// Checking if the uploads folder exists or no, if not then create one
const uploadDir:string = './uploads';
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}

const storage:StorageEngine = diskStorage({
  destination: function (req:Request, file:Express.Multer.File, cb) {
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
const fileFilterDoc = (req:Request, file:Express.Multer.File, cb:any) => {
  const allowedFiles = [
    'image/jpeg', 
    'image/png', 
    'image/jpg', 
    'image/gif', 
    'image/svg+xml', 
    'image/webp', 
    'image/apng', 
    'application/pdf', 
    'application/msword', 
    'application/vnd.ms-excel',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  if (allowedFiles.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Image, PDF, DOC(X), XLS(X), CSV are allowed!'));
  }
}

export const uploadImage:Multer = multer({ 
  storage: storage, 
  limits: { fileSize: 1024 * 1024 * 10 },   // limit 10MB
  fileFilter: fileFilterImage 
});

export const uploadDoc:Multer = multer({ 
  storage: storage, 
  limits: { fileSize: 1024 * 1024 * 50 },   // limit 50MB
  fileFilter: fileFilterDoc 
});


/**
 * Deletes an uploaded file from the server.
 *
 * @remarks
 * This function checks if the provided `existingFileName` is not empty and not equal to the `defaultFileName`.
 * If these conditions are met, it attempts to delete the corresponding file from the server's 'uploads' directory.
 * If an error occurs during the deletion process, it logs the error to the console.
 * If the deletion is successful, it logs a success message to the console.
 *
 * @param existingFileName - The name of the existing file to be deleted.
 * @param defaultFileName - The name of the default file. If `existingFileName` is equal to this, the file will not be deleted.
 *
 * @returns {void}
 */
export const deleteUploadedFile = (existingFileName: string, defaultFileName:string): void => {
  if (existingFileName && existingFileName !== defaultFileName) {
    unlink(path.join(__dirname, '..', '..', 'uploads', existingFileName), (err) => {
      if (err) console.error(`Error deleting file: ${err}`);
      else {
        console.log('file deleted successfully');
      }
    });
  }
}
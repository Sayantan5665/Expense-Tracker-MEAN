import multer, { StorageEngine, diskStorage, Multer } from "multer";
import { existsSync, mkdirSync, unlink } from "fs";
import path, { extname } from "path";
import { Request } from "express";

// Checking if the uploads folder exists or no, if not then create one
const uploadDir:string = './uploads/expense';
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

const storage:StorageEngine = diskStorage({
  destination: function (req:Request, file:Express.Multer.File, cb) {
    const userDir = path.join(uploadDir, req.user?.id.toString() || 'common');
    console.log("userDir: ", userDir);
    if (!existsSync(userDir)) {
      mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: function (req:Request, file:Express.Multer.File, cb) {
    const uniqueSuffix:string = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext:string = extname(file.originalname);
    cb(null, uniqueSuffix+ext);
  }
})

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
    'application/wps-office.xlsx',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'application/wps-office.docx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  if (allowedFiles.includes(file.mimetype)) {
    cb(null, true)
  } else {
    console.log('File not supported!', file);
    cb(new Error('Only image, PDF, DOC(X), XLS(X), CSV are allowed!'));
  }
}


export const uploadDoc:Multer = multer({ 
  storage: storage, 
  limits: { fileSize: 1024 * 1024 * 25 },   // limit 25MB
  fileFilter: fileFilterDoc 
});


/**
 * Deletes an uploaded doc from the server.
 *
 * @remarks
 * This function checks if the provided `existingDocName` is not empty and not equal to the `defaultDocName`.
 * If these conditions are met, it attempts to delete the corresponding doc from the server's 'uploads' directory.
 * If an error occurs during the deletion process, it logs the error to the console.
 * If the deletion is successful, it logs a success message to the console.
 *
 * @param existingDocName - The name of the existing doc to be deleted.
 * @param defaultDocName - The name of the default doc. If `existingDocName` is equal to this, the doc will not be deleted.
 *
 * @returns {void}
 */
export const deleteUploadedDoc = (userID:string, existingDocName: string): void => {
  if (existingDocName && existingDocName.length) {
    unlink(path.join(__dirname, '..', '..', uploadDir, userID, existingDocName), (err) => {
      if (err) console.error(`Error deleting File: ${err}`);
      else {
        console.log('File deleted successfully');
      }
    });
  }
}
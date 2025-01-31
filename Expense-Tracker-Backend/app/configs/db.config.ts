import { connect } from "mongoose";

export const connectDB = () => {
    const pass = ':'+(process.env.MONGO_PASS)  //?.replace(/[\/\\-]/g, '')
    const mongodb_uri:string = 'mongodb+srv://'+process.env.MONGO_USER+pass+'@cluster0.wmkkeag.mongodb.net/'+process.env.MONGO_NAME;
    
    connect(mongodb_uri).then((res) => {
        console.log('Database connected successfully... 🎉');
    }).catch((err) => {
        console.log('Error while connecting database... 😢', err);
    });
}
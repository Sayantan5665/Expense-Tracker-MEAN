import "tsconfig-paths/register";
import express, { Express, Request, Response } from "express";
import { connectDB, agenda } from "./app/configs/index";
import { json, urlencoded } from "body-parser";
import cors from "cors";
import { config } from "dotenv";
import { join } from "path";
import cookieParser from "cookie-parser";
import routes from './app/routes/main.routes';
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import SwaggerOptions from './swagger.json';
import flash from 'connect-flash';
import session from 'express-session';
import createMemoryStore from 'memorystore';

// Initialize Express app
const app: Express = express();

// Load environment variables from.env file
config();

// Connect to MongoDB
connectDB();
// Middleware to parse JSON and URL-encoded data
app.use(json());
app.use(urlencoded({ extended: true }));


// configuration for connect-flash
const MemoryStore = createMemoryStore(session);
app.use(
    session({
        secret: process.env.SESSION_KEY || 'MyVerySecretKey.IWontLetYouKnow.',  // Used to sign session ID cookie
        resave: false,             // Avoid resaving session if unmodified
        saveUninitialized: true,   // Save new sessions unmodified
        store: new MemoryStore({   // Use memoryStore to store session data
            checkPeriod: 86400000  // prune expired entries every 24h
        }) as any,
        cookie: { secure: false, maxAge: 86400000 }  // Set true for HTTPS
    })
);
app.use(flash());
/* this code for checking session START*/
// declare module 'express-session' {
//     interface SessionData {
//         views?: number;
//     }
// }
// app.get('/', (req: Request, res: Response) => {
//     if (!req.session.views) req.session.views = 1;
//     else req.session.views++;

//     res.send(`You have visited this page ${req.session.views} times`);
// });
/* this code for checking session END*/


// Middleware to parse cookies
app.use(cookieParser());

// Enable CORS for cross-origin requests
app.use(cors());

// Set up EJS as the templating engine for views.
app.set('view engine', 'ejs');

// static folder
app.use(express.static(join(__dirname, 'public')));
app.use('/views', express.static(join(__dirname, '/views')));
app.use('/uploads', express.static(join(__dirname, 'uploads')))


// Swagger documentation
const swaggerDocument = swaggerJSDoc(SwaggerOptions as any);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// routers
app.use(routes);

const port = process.env.PORT || 5503;
app.listen(port, () => {
    console.log(`Server running on  http://localhost:${port}  🔥`);
});

// Graceful shutdown agenda
process.on('SIGTERM', async () => {
    await agenda.stop();
    process.exit(0);
});
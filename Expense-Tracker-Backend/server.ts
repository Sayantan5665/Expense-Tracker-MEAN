import "tsconfig-paths/register";
import express, { Express } from "express";
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


// Initialize Express app
const app: Express = express();

// Load environment variables from.env file
config();

// Connect to MongoDB
connectDB();

// Middleware to parse JSON and URL-encoded data
app.use(json());
app.use(urlencoded({ extended: true }));

// Middleware to parse cookies
app.use(cookieParser());

// Enable CORS for cross-origin requests
app.use(cors());

// static folder
app.use(express.static(__dirname + '/public'));
app.use('/views', express.static(join(__dirname, '/views')));
app.use('/uploads', express.static(join(__dirname, 'uploads')))

// routers
app.use(routes);

// Swagger documentation
const swaggerDocument = swaggerJSDoc(SwaggerOptions as any);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const port = process.env.PORT || 5503;
app.listen(port, () => {
    console.log(`Server running on  http://localhost:${port}  🔥`);
});

// Graceful shutdown agenda
process.on('SIGTERM', async () => {
    await agenda.stop();
    process.exit(0);
});
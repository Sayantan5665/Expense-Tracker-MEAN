import express, { Express } from "express";
import { connectDB } from "@configs";
import { json, urlencoded } from "body-parser";
import cors from "cors";
import { config } from "dotenv";
import { join } from "path";
import cookieParser from "cookie-parser";
import routes from '@routes';
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import SwaggerOptions from './swagger.json';
const swaggerDocument = swaggerJSDoc(SwaggerOptions as any);

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
app.use('/uploads', express.static(join(__dirname, 'uploads')))

// routers
app.use(routes);

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const port = process.env.PORT || 5503;
app.listen(port, () => {
    console.log(`Server running on  http://localhost:${port}  🔥`);
});
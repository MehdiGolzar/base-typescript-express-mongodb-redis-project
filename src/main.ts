import "reflect-metadata";
import { getLogger } from "./shared/logger/winston.logger";
import express, { Express } from "express";
import http, { Server as HttpServer } from "http";
import morgan from "morgan";
import cors from "cors";
import configs from "./config";
import compression from "compression";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import xssClean from "xss-clean";
import dnsPrefetchControl from "dns-prefetch-control";
import helmet from "helmet";
import Container from "typedi";
import { SharedErrorMessages } from "./shared/enums/shared-messages.enum";
import { errorHandler } from "./shared/middlewares/error-handler.middleware";
import baseRouter from "./shared/router/base.routes";
import MongoDBService from "./database/service/mongodb.service";
import SeederService from "./seeder/service/seeder.service";

async function bootstrap() {
  // Logger
  const logger = getLogger("Bootstrap");

  try {
    // Create Express Aplication Instance
    const app: Express = express();

    // --------------------------- Middlewares ---------------------------
    // Request Logger
    app.use(morgan("dev"));

    // Security Headers
    app.use(
      helmet({
        contentSecurityPolicy: false, // Adjust as needed
      })
    );

    // Manage CORS
    app.use(
      cors({
        origin: configs.app.cors.origin,
        methods: configs.app.cors.methods,
        credentials: false,
      })
    );

    // Enable compression
    app.use(compression());

    // Rate Limiting to prevent abuse (e.g., DoS attacks)
    const limiter = rateLimit({
      windowMs: configs.app.rateLimit.windowMs,
      max: configs.app.rateLimit.maxRequests, // Limit each IP to 100 requests per window
      message: SharedErrorMessages.TOO_MANY_REQUESTS,
      headers: true,
    });
    app.use(limiter);

    // Body Parser
    app.use(express.json({ limit: "10kb" })); // Limit body size to prevent abuse
    app.use(express.urlencoded({ extended: false, limit: "10kb" }));

    // Prevent HTTP Parameter Pollution
    app.use(hpp());

    // Prevent Cross-Site Scripting (XSS) Attacks
    app.use(xssClean());

    // Prevent HTTP Host Header Attacks
    app.use(dnsPrefetchControl());

    // --------------------------- Routing ---------------------------
    // Base Router
    app.use("/", baseRouter);

    // Global error handler (must be at the end)
    app.use(errorHandler);

    // --------------------------- Servers ---------------------------
    // Http Server
    const httpServer: HttpServer = http.createServer(app);

    // Prevent from slowloris attacks
    httpServer.keepAliveTimeout = 5000; // 5 seconds

    // --------------------------- Database ---------------------------
    // Connect to MongoDB
    const mongoDBService = Container.get(MongoDBService);
    await mongoDBService.connect();

    // --------------------------- Seeder ---------------------------
    // Run App Seeder
    const seederService = Container.get(SeederService);
    await seederService.run();

    // --------------------------- Run App ---------------------------
    httpServer.listen(configs.app.port, () => {
      logger.info(`🌐 Server Running On Port ${configs.app.port}`);
    });
  } catch (error) {
    logger.error("Failed to bootstrap application", { error });
    process.exit(1);
  }
}

// Start App
bootstrap();

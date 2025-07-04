import dotenv from "dotenv";
import Joi from "joi";

// Load environment variables
dotenv.config();

const jwtTtlRegex = /^(\d+)([smhd])$/; // e.g., 15m, 1h, 7d, 3600s

// Define the schema for validation
const envSchema = Joi.object({
  // --------------------------- Application ---------------------------
  // Application environment
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),

  // Server Port
  PORT: Joi.number().default(4000),

  // --------------------------- CORS ---------------------------
  // CORS Origin
  CORS_ORIGIN: Joi.string().default("*"),
  // CORS Methods
  CORS_METHODS: Joi.array()
    .items(Joi.string())
    .default(["GET", "POST", "PUT", "PATCH", "DELETE"]),

  // --------------------------- Rate Limit ---------------------------
  // Rate Limit Window
  RATE_LIMIT_WINDOW_MS: Joi.number().default(60 * 1000), // 1 minute
  // Rate Limit Max Requests
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(50),

  // --------------------------- Super Admin ---------------------------
  // Super Admin Username
  SUPER_ADMIN_USERNAME: Joi.string()
    .min(3)
    .max(16)
    .pattern(/^[a-z0-9_]+$/) // Allow only lowercase letters, numbers, and underscores
    .lowercase()
    .default("superadmin"),
  // Super Admin Password
  SUPER_ADMIN_PASSWORD: Joi.string()
    .min(8)
    .max(32)
    .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .default("123456@Qaz")
    .messages({
      password:
        "Password must contain at least one uppercase letter, one number, and one special character.",
    }),

  // --------------------------- Databases ---------------------------
  // MongoDB
  // MongoDB URI
  MONGODB_URI: Joi.string().required(),
  // MongoDB DB Name
  MONGODB_DB_NAME: Joi.string().required(),

  // Redis
  // Redis URL
  REDIS_URL: Joi.string().required(),
  // Redis Port
  REDIS_PORT: Joi.number().required(),
  // Redis Password
  REDIS_PASSWORD: Joi.string().optional(),

  // --------------------------- JWT ---------------------------
  // JWT Secret
  JWT_SECRET: Joi.string().required(),
  // JWT Access Token TTL
  JWT_ACCESS_TTL: Joi.string().pattern(jwtTtlRegex).default("15m").messages({
    "string.pattern.base":
      "JWT_ACCESS_TTL must be a valid time format like '15m', '1h', or '7d'.",
  }),
  // JWT Refresh Token TTL
  JWT_REFRESH_TTL: Joi.string().pattern(jwtTtlRegex).default("7d").messages({
    "string.pattern.base":
      "JWT_REFRESH_TTL must be a valid time format like '15m', '1h', or '7d'.",
  }),
})
  .unknown()
  .required();

// Validate the environment variables
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Define the configuration interface
interface IConfigs {
  app: {
    nodeEnv: "development" | "production" | "test";
    port: number;
    cors: {
      origin: string;
      methods: string[];
    };
    superAdmin: {
      username: string;
      password: string;
    };
    rateLimit: {
      windowMs: number;
      maxRequests: number;
    };
  };
  db: {
    mongodb: {
      uri: string;
      dbName: string;
    };
    redis: {
      url: string;
      port: number;
      password: string;
    };
  };
  jwt: {
    secret: string;
    accessTtl: string;
    refreshTtl: string;
  };
}

// Define and export the validated configuration
const configs: IConfigs = {
  // --------------------------- Application ---------------------------
  app: {
    nodeEnv: envVars.NODE_ENV,
    port: envVars.PORT,
    cors: {
      origin: envVars.CORS_ORIGIN,
      methods: envVars.CORS_METHODS,
    },
    superAdmin: {
      username: envVars.SUPER_ADMIN_USERNAME,
      password: envVars.SUPER_ADMIN_PASSWORD,
    },
    rateLimit: {
      windowMs: envVars.RATE_LIMIT_WINDOW_MS,
      maxRequests: envVars.RATE_LIMIT_MAX_REQUESTS,
    },
  },
  // --------------------------- Databases ---------------------------
  db: {
    mongodb: {
      uri: envVars.MONGODB_URI,
      dbName: envVars.MONGODB_DB_NAME,
    },
    redis: {
      url: envVars.REDIS_URL,
      port: envVars.REDIS_PORT,
      password: envVars.REDIS_PASSWORD,
    },
  },
  // --------------------------- JWT ---------------------------
  jwt: {
    secret: envVars.JWT_SECRET,
    accessTtl: envVars.JWT_ACCESS_TTL,
    refreshTtl: envVars.JWT_REFRESH_TTL,
  },
};

export default configs;

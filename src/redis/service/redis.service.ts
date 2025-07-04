import { Service } from "typedi";
import Redis from "ioredis";
import { Logger } from "winston";
import { getLogger } from "../../shared/logger/winston.logger";
import configs from "../../config";
import AppError from "../../shared/classes/app-error.class";
import httpStatus from "http-status";

// Interface for Redis configuration
interface RedisConfig {
  host: string; // Redis host address
  port: number; // Redis port number
  password?: string; // Optional Redis password
  retryStrategy?: (times: number) => number | null; // Retry strategy for failed connections
  maxRetriesPerRequest?: number; // Maximum retries per request
  connectTimeout?: number; // Connection timeout in milliseconds
}

@Service() // Register as a typedi service
export class RedisService {
  private logger: Logger = getLogger(RedisService.name);
  private client: Redis; // Main Redis client for general operations
  private publisher: Redis; // Dedicated client for publishing messages
  private subscriber: Redis; // Dedicated client for subscribing to messages
  private subscriptions: Map<string, ((message: string) => void)[]> = new Map(); // Store channel subscriptions

  // Constructor with dependency injection
  constructor(
    redisConfigs: RedisConfig = {
      host: configs.db.redis.url, // Redis host from config
      port: configs.db.redis.port, // Redis port from config
      password: configs.db.redis.password, // Redis password from config
      retryStrategy: (times) => Math.min(times * 100, 5000), // Exponential backoff for retries
      maxRetriesPerRequest: 2, // Limit retries per request
      connectTimeout: 10000, // 10s timeout for connections
    }
  ) {
    this.client = new Redis(redisConfigs); // Initialize main client
    this.publisher = new Redis(redisConfigs); // Initialize publisher client
    this.subscriber = new Redis(redisConfigs); // Initialize subscriber client
    this.handleErrors(); // Set up error handlers
    this.handleEvents(); // Set up evnet handlers
    this.setupSubscriber(); // Set up message subscription handler
  }

  // Handle Redis client connection events
  private handleEvents(): void {
    // Iterate over all Redis clients (main, publisher, subscriber)
    [this.client, this.publisher, this.subscriber].forEach((client, index) => {
      // Log when TCP connection is established (but not necessarily ready for commands)
      client.on("connect", () => {
        this.logger.debug(`Redis client ${index} established TCP connection`);
      });

      // Log when the Redis client is fully ready (authenticated and able to send commands)
      client.on("ready", () => {
        this.logger.info(`💿 Redis client ${index} is ready and connected`);
      });
    });
  }

  // Handle errors for all Redis clients
  private handleErrors(): void {
    // Log client errors
    [this.client, this.publisher, this.subscriber].forEach((client, index) => {
      client.on("error", (error: Error) => {
        this.logger.error(`Redis client ${index} error: ${error.message}`, {
          error,
        });
      });
    });
  }

  // Set up message handler for subscriber
  private setupSubscriber(): void {
    this.subscriber.on("message", (channel, message) => {
      // Get callbacks for channel
      const callbacks = this.subscriptions.get(channel) || [];

      // Execute callbacks
      callbacks.forEach((callback) => callback(message));

      // Log received message
      this.logger.debug(`Received message on channel ${channel}`, { message });
    });
  }

  // Set a key-value pair in Redis with optional TTL
  async set<T>(key: string, value: T, expireInSeconds?: number): Promise<void> {
    try {
      // Validate value
      if (
        value === undefined ||
        value === null ||
        typeof value === "function"
      ) {
        throw new AppError(
          "Invalid value: must be JSON-serializable and not undefined/null",
          httpStatus.INTERNAL_SERVER_ERROR
        );
      }

      // Serialize value to JSON
      const stringValue = JSON.stringify(value);

      // Set with TTL
      if (expireInSeconds) {
        await this.client.set(key, stringValue, "EX", expireInSeconds);
      } else {
        // Set without TTL
        await this.client.set(key, stringValue);
      }

      // Log successful set
      this.logger.info(`Set key ${key} in Redis`, { key, expireInSeconds });
    } catch (error) {
      // Log error
      this.logger.error(`Failed to set key ${key}`, { error });

      // Throw custom error
      throw new AppError(
        `Failed to set key ${key}`,
        httpStatus.INTERNAL_SERVER_ERROR,
        error
      );
    }
  }

  // Set multiple key-value pairs in Redis with optional TTL
  async mset<T>(
    keyValuePairs: { key: string; value: T }[],
    expireInSeconds?: number
  ): Promise<void> {
    try {
      // Validate values
      const pairs = keyValuePairs
        .map(({ key, value }) => {
          if (
            value === undefined ||
            value === null ||
            typeof value === "function"
          ) {
            throw new AppError(
              `Invalid value for key ${key}: not JSON-serializable`,
              httpStatus.INTERNAL_SERVER_ERROR
            );
          }
          return [key, JSON.stringify(value)]; // Serialize values
        })
        .flat(); // Flatten array for mset

      // Set multiple keys
      await this.client.mset(pairs);

      // Apply TTL to each key
      if (expireInSeconds) {
        for (const { key } of keyValuePairs) {
          await this.client.expire(key, expireInSeconds);
        }
      }

      // Log successful mset
      this.logger.info(`Set ${keyValuePairs.length} keys in Redis`, {
        count: keyValuePairs.length,
        expireInSeconds,
      });
    } catch (error) {
      // Log error
      this.logger.error(`Failed to mset keys in Redis`, { error });

      // Throw custom error
      throw new AppError(
        "Failed to mset keys in Redis",
        httpStatus.INTERNAL_SERVER_ERROR,
        error
      );
    }
  }

  // Get a value from Redis by key
  async get<T>(key: string): Promise<T | null> {
    try {
      // Retrieve data
      const data = await this.client.get(key);

      // Parse JSON or return null
      const result = data ? (JSON.parse(data) as T) : null;

      // Log fetch result
      this.logger.debug(`Fetched key ${key} from Redis`, { found: !!data });

      // Return parsed data
      return result;
    } catch (error) {
      // Log error
      this.logger.error(`Failed to get key ${key}`, { error });

      // Throw custom error
      throw new AppError(`Failed to get key ${key}`, 404, error);
    }
  }

  // Get multiple values from Redis by keys
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      // Retrieve multiple keys
      const data = await this.client.mget(...keys);

      // Parse JSON or null
      const results = data.map((item) =>
        item ? (JSON.parse(item) as T) : null
      );

      // Log fetch result
      this.logger.debug(`Fetched ${keys.length} keys from Redis`, {
        count: keys.length,
      });

      // Return parsed data
      return results;
    } catch (error) {
      // Log error
      this.logger.error(`Failed to mget keys`, { error });

      // Throw custom error
      throw new AppError(
        "Failed to mget keys from Redis",
        httpStatus.INTERNAL_SERVER_ERROR,
        error
      );
    }
  }

  // Delete one or more keys from Redis
  async delete(keys: string | string[]): Promise<void> {
    try {
      // Normalize to array
      const keyArray = Array.isArray(keys) ? keys : [keys];

      // Delete keys
      await this.client.del(keyArray);

      // Log successful deletion
      this.logger.info(`Deleted ${keyArray.length} keys from Redis`, {
        count: keyArray.length,
      });
    } catch (error) {
      // Log error
      this.logger.error(`Failed to delete keys`, { error });

      // Throw custom error
      throw new AppError(
        `Failed to delete keys from Redis`,
        httpStatus.INTERNAL_SERVER_ERROR,
        error
      );
    }
  }

  // Check if a key exists in Redis
  async exists(key: string): Promise<boolean> {
    try {
      // Check key existence
      const result = await this.client.exists(key);

      // Log result
      this.logger.debug(`Checked existence of key ${key}`, {
        exists: result === 1,
      });

      // Return boolean
      return result === 1;
    } catch (error) {
      // Log error
      this.logger.error(`Failed to check existence of key ${key}`, { error });

      // Throw custom error
      throw new AppError(
        `Failed to check existence of key ${key}`,
        httpStatus.INTERNAL_SERVER_ERROR,
        error
      );
    }
  }

  // Get all keys matching a pattern
  async keys(pattern: string): Promise<string[]> {
    try {
      // Retrieve matching keys
      const results = await this.client.keys(pattern);

      // Log result
      this.logger.info(
        `Retrieved ${results.length} keys for pattern ${pattern}`,
        { count: results.length }
      );

      // Return keys
      return results;
    } catch (error) {
      // Log error
      this.logger.error(`Failed to retrieve keys for pattern ${pattern}`, {
        error,
      });

      // Throw custom error
      throw new AppError(
        `Failed to retrieve keys for pattern ${pattern}`,
        httpStatus.INTERNAL_SERVER_ERROR,
        error
      );
    }
  }

  // Publish a message to a Redis channel
  async publish(channel: string, message: string): Promise<void> {
    try {
      // Publish message
      await this.publisher.publish(channel, message);

      // Log successful publish
      this.logger.info(`Published message to channel ${channel}`, { message });
    } catch (error) {
      // Log error
      this.logger.error(`Failed to publish to channel ${channel}`, { error });

      // Throw custom error
      throw new AppError(
        `Failed to publish to channel ${channel}`,
        httpStatus.INTERNAL_SERVER_ERROR,
        error
      );
    }
  }

  // Subscribe to a Redis channel
  async subscribe(
    channel: string,
    callback: (message: string) => void
  ): Promise<void> {
    try {
      if (!this.subscriptions.has(channel)) {
        // Initialize subscription array
        this.subscriptions.set(channel, []);

        // Subscribe to channel
        await this.subscriber.subscribe(channel);

        // Log successful subscription
        this.logger.info(`Subscribed to channel ${channel}`);
      }

      // Get existing callbacks
      const callbacks = this.subscriptions.get(channel) || [];

      // Add new callback
      callbacks.push(callback);

      // Update subscriptions
      this.subscriptions.set(channel, callbacks);
    } catch (error) {
      // Log error
      this.logger.error(`Failed to subscribe to channel ${channel}`, { error });

      // Throw custom error
      throw new AppError(
        `Failed to subscribe to channel ${channel}`,
        httpStatus.INTERNAL_SERVER_ERROR,
        error
      );
    }
  }

  // Unsubscribe from a Redis channel
  async unsubscribe(
    channel: string,
    callback?: (message: string) => void
  ): Promise<void> {
    try {
      // Get callbacks
      let callbacks = this.subscriptions.get(channel) || [];

      if (callback) {
        // Remove specific callback
        callbacks = callbacks.filter((cb) => cb !== callback);

        // Update subscriptions
        this.subscriptions.set(channel, callbacks);

        // Log callback removal
        this.logger.debug(`Removed callback from channel ${channel}`);
      }
      if (callbacks.length === 0) {
        // Clear subscriptions
        this.subscriptions.delete(channel);

        // Unsubscribe from channel
        await this.subscriber.unsubscribe(channel);

        // Log successful unsubscription
        this.logger.info(`Unsubscribed from channel ${channel}`);
      }
    } catch (error) {
      // Log error
      this.logger.error(`Failed to unsubscribe from channel ${channel}`, {
        error,
      });

      // Throw custom error
      throw new AppError(
        `Failed to unsubscribe from channel ${channel}`,
        httpStatus.INTERNAL_SERVER_ERROR,
        error
      );
    }
  }

  // Disconnect all Redis clients
  async disconnect(): Promise<void> {
    try {
      // Disconnect all clients
      await Promise.all([
        // Disconnect main client
        this.client.quit(),

        // Disconnect publisher client
        this.publisher.quit(),

        // Disconnect subscriber client
        this.subscriber.quit(),
      ]);

      // Log successful disconnection
      this.logger.info("All Redis clients disconnected successfully");
    } catch (error) {
      // Log error
      this.logger.error(`Failed to disconnect Redis clients`, { error });

      // Throw custom error
      throw new AppError(
        "Failed to disconnect Redis clients",
        httpStatus.INTERNAL_SERVER_ERROR,
        error
      );
    }
  }
}

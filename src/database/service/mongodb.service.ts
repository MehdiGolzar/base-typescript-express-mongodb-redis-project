// import { connect } from "mongoose";
// import configs from "../config";
// import logger from '../shared/logger/winston.logger';

// const connectToDB = async () => {
//   try {
//     // Get MongoDB configs
//     const mongoConfig = configs.db.mongodb;

//     // Connect to MongoDB
//     await connect(mongoConfig.uri, { dbName: mongoConfig.dbName });
//     logger.info("🛢  MongoDB Connected...");
//   } catch (err: any) {
//     logger.error("🛑 MongoDB Not Connected...");
//     logger.error(err.message);

//     // Exit process with failure
//     process.exit(1);
//   }
// };

// export default connectToDB;

import { Service, Inject } from "typedi";
import { connect } from "mongoose";
import { Logger } from "winston";
import configs from "../../config";
import { getLogger } from "../../shared/logger/winston.logger";

@Service()
export default class MongoDBService {
  private logger: Logger = getLogger(MongoDBService.name);

  /**
   * Connects to MongoDB using configured settings
   * @throws Error if connection fails
   */
  async connect(): Promise<void> {
    try {
      // Get MongoDB configs
      const mongoConfig = configs.db.mongodb;

      // Connect to MongoDB
      await connect(mongoConfig.uri, { dbName: mongoConfig.dbName });
      this.logger.info("🛢  MongoDB Connected");
    } catch (error: any) {
      this.logger.error("🛑 MongoDB Not Connected");
      this.logger.error(error.message, { error });

      // Exit process with failure
      process.exit(1);
    }
  }
}

import { Inject, Service } from "typedi";
import bcrypt from "bcrypt";
import configs from "../../config";
import { Logger } from "winston";
import { getLogger } from "../../shared/logger/winston.logger";
import { UserRepository } from "../../user/repository/user.repository";
import { UserRoles } from "../../user/enums/user-roles.enum";

@Service()
export default class SeederService {
  private logger: Logger = getLogger(SeederService.name);

  constructor(@Inject() private readonly userRepository: UserRepository) {}

  async run(): Promise<void> {
    // Execute seeders
    // Super Admin
    await this.superAdminUserSeeder();

    // Log
    this.logger.info("🌱 Seeder Executed...");
    return;
  }

  // Function to seed super admin user
  private async superAdminUserSeeder(): Promise<void> {
    // Check if super admin user already exists
    const superAdminUserFound = await this.userRepository.findOne({
      username: configs.app.superAdmin.username,
      role: UserRoles.SUPER_ADMIN,
    });

    // If super admin user does not exist create it
    if (!superAdminUserFound) {
      const username = configs.app.superAdmin.username;
      const password = configs.app.superAdmin.password;
      const hashedPassword = await bcrypt.hash(password, 10);

      const createSuperAdminData = {
        username,
        password: hashedPassword,
        role: UserRoles.SUPER_ADMIN,
      };

      // Create super admin user in database
      await this.userRepository.create(createSuperAdminData);
    }
  }
}

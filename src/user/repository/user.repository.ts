import { Service } from "typedi";
import { UserModel } from '../model/user.schema';
import BaseRepository from '../../shared/repository/base.repository';
import { IUser } from '../interfaces/user.interface';

// Use Service decorator to register this class as a service
@Service()
// Define the user repository
export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(UserModel);
  }
}

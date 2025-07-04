import { Service } from "typedi";
import IBaseDocument from "../interfaces/base-document.interface";
import IBaseService from "../interfaces/base-service.interface";
import IBaseRepository from "../interfaces/base-repository.interface";

@Service()
export default class BaseService<T extends IBaseDocument>
  implements IBaseService<T>
{
  constructor(protected readonly repository: IBaseRepository<T>) {
    this.repository = repository;
  }

  async create(...args: any): Promise<T | T[] | any> {
    return this.repository.create(args);
  }

  async findOne(...args: any): Promise<T | null> {
    return this.repository.findOne(args);
  }

  async findAll(...args: any): Promise<T[]> {
    return this.repository.findAll(args);
  }

  async updateOne(...args: any): Promise<T | null> {
    return this.repository.updateOne(args, args, args);
  }

  async softDelete(...args: any): Promise<T | null> {
    return this.repository.softDelete(args, args);
  }

  async hardDelete(...args: any): Promise<T | null> {
    return this.repository.hardDelete(args);
  }
}

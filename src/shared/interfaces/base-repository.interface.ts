import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import IBaseDocument from './base-document.interface';

// Define the base repository interface 
export default interface IBaseRepository<Document extends IBaseDocument> {
  create(data: Partial<Document>): Promise<Document>;
  findOne(filterQuery: FilterQuery<Document>, queryOptions?: QueryOptions<Document>): Promise<Document | null>;
  findAll(filterQuery: FilterQuery<Document>, queryOptions?: QueryOptions<Document>): Promise<Document[]>;
  updateOne(filterQuery: FilterQuery<Document>, updateQuery: UpdateQuery<Document>, queryOptions?: QueryOptions<Document>): Promise<Document | null>;
  softDelete(filterQuery: FilterQuery<Document>, queryOptions?: QueryOptions<Document>): Promise<Document | null>;
  hardDelete(filterQuery: FilterQuery<Document>): Promise<Document | null>;
}

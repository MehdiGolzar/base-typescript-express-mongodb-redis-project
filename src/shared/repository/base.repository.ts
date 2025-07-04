import { Model, FilterQuery, QueryOptions, UpdateQuery, Types } from "mongoose";
import { Service } from "typedi";
import IBaseDocument from "../interfaces/base-document.interface";
import IBaseRepository from "../interfaces/base-repository.interface";

/**
 * BaseRepository provides common CRUD operations for MongoDB models.
 */
@Service()
export default class BaseRepository<T extends IBaseDocument>
  implements IBaseRepository<T>
{
  constructor(protected readonly model: Model<T>) {}

  /**
   * Create a new document.
   * @param data - Partial data for creating the document.
   * @returns The created document.
   */
  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  /**
   * Find a single document based on the provided filter.
   * @param filterQuery - Mongoose filter query.
   * @param queryOptions - Additional query options (including soft delete handling).
   * @returns The found document or null.
   */
  async findOne(
    filterQuery: FilterQuery<T>,
    queryOptions: QueryOptions<T> & { includeDeleted?: boolean } = {}
  ): Promise<T | null> {
    const { includeDeleted, ...restOptions } = queryOptions;

    const finalQuery = includeDeleted
      ? filterQuery
      : { ...filterQuery, deletedAt: null }; // Only fetch non-deleted documents if not including deleted

    return this.model.findOne(finalQuery, {}, restOptions);
  }

  /**
   * Find multiple documents based on the provided filter.
   * @param filterQuery - Mongoose filter query.
   * @param queryOptions - Additional query options (including soft delete handling).
   * @returns An array of found documents.
   */
  async findAll(
    filterQuery: FilterQuery<T> = {},
    queryOptions: QueryOptions<T> & { includeDeleted?: boolean } = {}
  ): Promise<T[]> {
    const { includeDeleted, ...restOptions } = queryOptions;

    const finalQuery = includeDeleted
      ? filterQuery
      : { ...filterQuery, deletedAt: null };

    return this.model.find(finalQuery, {}, restOptions);
  }

  /**
   * Update a single document based on the provided filter.
   * @param filterQuery - Mongoose filter query.
   * @param updateQuery - Fields to update.
   * @param queryOptions - Additional options (default: { new: true } to return updated document).
   * @returns The updated document or null.
   */
  async updateOne(
    filterQuery: FilterQuery<T>,
    updateQuery: UpdateQuery<T>,
    queryOptions: QueryOptions<T> = { new: true }
  ): Promise<T | null> {
    return this.model.findOneAndUpdate(
      { deletedAt: null, ...filterQuery }, // Always exclude deleted documents
      updateQuery,
      queryOptions
    );
  }

  /**
   * Soft delete a document by setting its deletedAt timestamp.
   * @param filterQuery - Mongoose filter query.
   * @param queryOptions - Additional options (default: { new: true } to return updated document).
   * @returns The soft-deleted document or null.
   */
  async softDelete(
    filterQuery: FilterQuery<T>,
    queryOptions: QueryOptions<T> = { new: true }
  ): Promise<T | null> {
    return this.model.findOneAndUpdate(
      { deletedAt: null, ...filterQuery },
      { deletedAt: Date.now() },
      queryOptions
    );
  }

  /**
   * Hard delete a document from the database.
   * @param filterQuery - Mongoose filter query.
   * @returns The deleted document or null.
   */
  async hardDelete(filterQuery: FilterQuery<T>): Promise<T | null> {
    return this.model.findOneAndDelete(filterQuery);
  }

  /**
   * Count the number of documents in the collection that match the filter query.
   * @param filterQuery - Mongoose filter query.
   * @returns The count of matching documents.
   */
  async countDocuments(filterQuery: FilterQuery<T>): Promise<number> {
    return this.model.countDocuments(filterQuery);
  }

  /**
   * Check if a document exists that matches the filter query.
   * @param filterQuery - Mongoose filter query.
   * @returns The ID of the matching document or null if none exist.
   */
  async exists(filterQuery: FilterQuery<T>): Promise<Types.ObjectId | null> {
    const exists = await this.model.exists({ ...filterQuery, deletedAt: null });
    return exists ? exists._id : null;
  }
}

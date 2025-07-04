import IBaseDocument from "./base-document.interface";

export default interface IBaseService<Document extends IBaseDocument> {
  create(...args: any): Promise<Document | Document[] | any>;
  findOne(...args: any): Promise<Document | null>;
  findAll(...args: any): Promise<Document[]>;
  updateOne(...args: any): Promise<Document | null>;
  softDelete(...args: any): Promise<Document | null>;
  hardDelete(...args: any): Promise<Document | null>;
}

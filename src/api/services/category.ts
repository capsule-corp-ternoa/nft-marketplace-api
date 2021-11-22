import CategoryModel from "../../models/category";
import { ICategory } from "../../interfaces/ICategory";
import { createCategoryQuery, getCategoriesQuery } from "../validators/categoryValidators";

export class CategoryService {
  /**
   * Returns all categories
   * @param query - see getCategoriesQuery
   * @throws Will throw an error if categories can't be fetched
   */
  async getCategories(query: getCategoriesQuery): Promise<ICategory[]> {
    try {
      const mongoQuery: any = {}
      if (query.filter?.codes) mongoQuery.code = {$in:query.filter?.codes}
      const categories: ICategory[] = await CategoryModel.find(mongoQuery);
      return categories.filter(x => !["001","002","VR"].includes(x.code));
    } catch (err) {
      throw new Error("Categories can't be fetched");
    }
  }

  /**
   * Returns all categories
   * @param query - see createCategoryQuery
   * @throws Will throw an error if categories can't be fetched
   */
   async addCategory(query: createCategoryQuery): Promise<ICategory> {
    try {
      const category = await CategoryModel.findOne({code: query.code})
      if (category) throw new Error("Category code already exists")
      const newCategory = new CategoryModel({
        code: query.code,
        name: query.name,
        description: query.description,
      })
      await newCategory.save()
      return newCategory;
    } catch (err) {
      throw new Error("Category can't be created");
    }
  }
  

}

export default new CategoryService();

import CategoryModel from "../../models/category";
import { ICategory } from "../../interfaces/ICategory";

export class CategoryService {
  /**
   * Returns all categories
   * @throws Will throw an error if categories can't be fetched
   */
  async getCategories(): Promise<ICategory[]> {
    try {
      const categories: any[] = await CategoryModel.find({});
      return categories;
    } catch (err) {
      throw new Error("Categories can't be fetched");
    }
  }

  /**
   * Returns category by code
   * @param categoryCode Code of the category to find
   * @throws Will throw an error if categories can't be fetched
   */
  async getCategoriesByCode(categoriesCode: string[]): Promise<ICategory[]> {
    try {
      const categories: any = await CategoryModel.find({code: {$in:categoriesCode}});
      if (!categories) throw new Error()
      return categories;
    } catch (err) {
      throw new Error("Categories can't be fetched");
    }
  }
}

export default new CategoryService();

import CategoryModel from "../../models/category";
import { ICategory } from "src/interfaces/ICategory";

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
  async getCategoryByCode(categoryCode: string): Promise<ICategory> {
    try {
      const category: any = await CategoryModel.findOne({code: categoryCode});
      if (!category) throw new Error()
      return category;
    } catch (err) {
      throw new Error("Category can't be fetched");
    }
  }
}

export default new CategoryService();

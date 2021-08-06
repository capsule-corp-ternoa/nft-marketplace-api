import CategoryModel from "../../../models/category";
import { ICategory } from "../../../interfaces/ICategory";

export class CategoryService {

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

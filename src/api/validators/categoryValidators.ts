import Joi from "joi";
import { validateQuery } from ".";

export type getCategoriesQuery = {
    filter?: {
        codes?: string[]
    }
}
export const validationGetCategories = (query: any) => {
    let { filter } = query
    if (filter) filter = JSON.parse(filter);
    const validationSchema = Joi.object({
        filter: Joi.object({
            codes: Joi.array().items(Joi.string()),
        }),
    });
    return validateQuery(validationSchema, { filter }) as getCategoriesQuery;
};

export type createCategoryQuery = {
    code:string
    name: string
    description: string
}
export const validationCreateCategory = (query: any) => {
    const validationSchema = Joi.object({
        code: Joi.string().required(),
        name: Joi.string().required(),
        description: Joi.string(),
    });
    return validateQuery(validationSchema, query) as createCategoryQuery;
};
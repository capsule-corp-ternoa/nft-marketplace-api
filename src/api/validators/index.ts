import Joi from "joi";

export const validateQuery = (schema: Joi.ObjectSchema<any>, query: any) => {
    const values = schema.validate(query);
    if (values.error) {
        const err = new Error(values.error as any) as any;
        err.status = 400;
        throw err;
    }
    return values.value
}
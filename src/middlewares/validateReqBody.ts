import { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';
import { ajv } from '../resources/jsonValidator';

export function validateReqBody(schemaName: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const validate = ajv.getSchema(schemaName);
        if (validate?.(req.body)) {
            next();
        } else if (!validate) {
            throw createError(500, `unknown validator name:${schemaName}`);
        } else {
            throw createError(400, 'malformed request body', { errors: validate.errors });
        }
    };
}

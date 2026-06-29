import fs from 'fs';
import os from 'os';
import { NextFunction, Request, Response } from 'express';

export default (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const { url, method } = req;

    const data = `${now} ${method} ${url}`;

    fs.appendFile('server.log', data + os.EOL, (err) => {
        if (err) throw err;
    });

    next();
};

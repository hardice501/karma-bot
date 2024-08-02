import express from 'express';
import { readinessStatus } from '../resources/healthChecker';

const hcRouter = express.Router();

hcRouter.get('/readiness', (req, res) => {
    return res.json({ status: readinessStatus });
});

export default hcRouter;

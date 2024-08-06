import express from 'express';
import { readinessStatus } from '../resources/healthChecker';
import attendanceService from '../services/attendance.service';
import { getWorkPeriodRange } from '../utils/date.utils';
import _ from 'lodash';
import createError, { BadRequest, NotFound } from 'http-errors';
import NotFoundException from '../exceptions/NotFoundException';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } from 'http-status';

const hcRouter = express.Router();

hcRouter.get('/readiness', (req, res) => {
    return res.json({ status: readinessStatus });
});

hcRouter.get('/test/db', async (req, res) => {
    return res.json({ status: await attendanceService.getEmployeeAttendanceOnDb() });
});

hcRouter.get('/test/mailplug', async (req, res) => {
    return res.json({ status: await attendanceService.getEmployeeAttendanceOnMailPlug() });
});

hcRouter.get('/test/karma', async (req, res) => {
    const name = _.get(req.query, 'name') as string;
    const sanitizedName = name.replace(/[\r\b\t\n\v\f]/g, '').trim();

    if ( !sanitizedName || sanitizedName === '' ){
        return res.status(BAD_REQUEST).json("query_param <name> required");
    }

    try{
        const result= await attendanceService.getEmployeeKarma(name as string);
        return res.json(result);
    }catch (e) {
        console.log(e)
        if ( e instanceof NotFoundException){
            return res.status(NOT_FOUND).json(e);
        }else{
            return res.status(INTERNAL_SERVER_ERROR).json({stack:e});
        }
    }
});


export default hcRouter;

import { Connection, Schema } from 'mongoose';
import { HolidayFields, HolidayModel } from './holiday.schema.interface';

const schemaName = 'holiday';

const HolidaySchema: Schema<HolidayFields> = new Schema({
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    day: { type: Number, required: true },
    period: { type: Number, required: true },
    dateName: { type: String, required: true },
});

export default function (connection: Connection) {
    return connection.model<HolidayFields, HolidayModel>(schemaName, HolidaySchema);
}

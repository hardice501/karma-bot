import { Connection, Schema } from 'mongoose';
import { EmployeeFields, EmployeeModel } from './employee.schema.interface';

const schemaName = 'employees_attendance';
const EmployeeSchema: Schema<EmployeeFields> = new Schema(
    {
        /** 이름 **/
        name: { type: String, required: true },
        /** 아이디 **/
        mailplug_id: { type: String, required: true },
        /** 부서 **/
        department: { type: String, required: true },
        /** 직위 */
        position: { type: String, required: true },
        /** 연락처 */
        contact: { type: String, required: true },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, // createdAt, updatedAt 자동 생성
    },
);

export default function (connection: Connection) {
    return connection.model<EmployeeFields, EmployeeModel>(schemaName, EmployeeSchema);
}

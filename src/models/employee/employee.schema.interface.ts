import { Document, Model, Types } from 'mongoose';

export interface EmployeeFields {
    /** 이름 **/
    name: string;
    /** 아이디 **/
    mailplug_id: string;
    /** 부서 **/
    department: string;
    /** 직위 */
    position: string;
    /** 연락처 */
    contact: string;
}

export interface EmployeeDocument extends EmployeeFields, Document {
    id: string;
    _id: string | Types.ObjectId;
}

export interface EmployeeModel extends Model<EmployeeDocument> {}

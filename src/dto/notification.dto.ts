// /***/
//
// import { Medium } from '../constants/Medium';
// import { JSONSchemaType } from 'ajv';
// import ajv from '../utils/ajv';
//
// export type NotificationRequestBody = {
//     medium: Medium; //* Notification medium: "NOTI", "SMS", "EMAIL"
//     trial: number; //* Number of trial
// };
//
// export const NotificationRequestBodyId = 'NotificationRequestBodyId';
//
// export const NotificationRequestBodySchema: JSONSchemaType<NotificationRequestBody> = {
//     $id: NotificationRequestBodyId,
//     type: 'object',
//     properties: {
//         medium: { type: 'string', nullable: false, format: 'medium' },
//         trial: { type: 'number', nullable: false },
//     },
//     required: ['medium', 'trial'],
//     additionalProperties: false,
// };
//
// export type NotificationEvent = {
//     reqId: string;
//     id: string; //* UUID that identifies each events.
//     clusterId: string;
//     vid?: string;
//     title?: string;
//     payload: string; //* Payload string.
//     pidx: number; //* Current index of payload string array.
//     phoneNumbers?: string[];
//     emails?: string[];
//     isFirst: boolean; //* Indicate this is a start of notification payload
//     isLast: boolean; //* Indicate this is a last of notification payload
//     requestedAt: number; //* Epoch time requested.
//     medium: Medium; //* Current medium.
//     trial: number;
//     reservedTime?: string;
// };
//
// //* Send Notification
//
// export type Notification = {
//     reqId: string;
//     vid?: string;
//     title?: string;
//     payload: string;
//     phoneNumbers?: string[];
//     emails?: string[];
//     requestedAt: number;
//     medium: Medium;
//     trial: number;
//     reservedTime?: string;
//     //* TODO: Add required information in here.
// };
//
// //export type NotificationMetaData = Omit<Notification, 'payload'>;
//
// ajv.addSchema(NotificationRequestBodySchema);

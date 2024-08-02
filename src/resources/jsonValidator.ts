import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// NOTE: body가 string 으로 처리되서, 형 강제를 위해 coerceTypes: true 옵션을 추가했습니다.
// 더 좋은 방법이 있는지 의견을 여쭙고자 NOTE 남겨봅니다.
const _ajv = new Ajv({ coerceTypes: true });

export const passwordRegExp = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!\"#$%&'()*+,\-./:;<=>?@\[\\\]^_`{|}~])[A-Za-z\d!\"#$%&'()*+,\-./:;<=>?@\[\\\]^_`{|}~]{8,18}$/;

addFormats(_ajv);

// 전화번호는 01012345678 형식이어야 합니다.
_ajv.addFormat('phone_number', /^\d{3}\d{4}\d{4}$/);

// 비밀번호는 영문, 숫자, 특수문자를 혼합하여 8~18자로 구성되어야 합니다. (영문,숫자,특수문자 1자이상)
// _ajv.addFormat('password', /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\s]).{8,18}$/);
_ajv.addFormat('password', passwordRegExp);

// 계정은 4~20자의 영문 대소문자와 숫자로만 구성되어야 합니다.
// _ajv.addFormat('username', /^[a-zA-Z0-9]{4,20}$/);
_ajv.addFormat('username', /^[A-Za-z\d-_]{6,18}$/);

// ObjectId는 24자의 16진수 문자열이어야 합니다.
_ajv.addFormat('object_id', /^[0-9a-f]{24}$/);

// roll fields는 name, phone_number, email, custom_identifier 중 하나 이상이어야 합니다.
_ajv.addFormat('roll_field', /^(name|phone_number|email|custom_identifier)$/);

// 이메일은 이메일 형식이어야 합니다.
_ajv.addFormat('email', /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}$/);

// pin은 6자리 숫자 문자열이어야 합니다.
_ajv.addFormat('pin', /^\d{6}$/);

export const ajv = _ajv;

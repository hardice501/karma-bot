import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ coerceTypes: true }); //* Force type defined in the schema (type coercion)

//* add-formats if require4d
ajv.addFormat('medium', /^(ALIM|MESSENGER|EMAIL|TEST)$/);
ajv.addFormat('YYMMDDhhmmss', /^\d{12}$/);

addFormats(ajv);
export default ajv;

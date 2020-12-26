import Ajv, { DefinedError } from 'ajv';
import { CharacterListItem } from 'features/character/characterListSlice';
import CharacterListItemSchema from 'schemas/CharacterListItemSchema.json';

const ajv = new Ajv({ allErrors: true, strict: false });
const schemaString = JSON.stringify(CharacterListItemSchema);
try {
  ajv.validateSchema(JSON.parse(schemaString), true);
} catch (error) {
  console.error(error);
}
const validateCharacterData = ajv.compile<CharacterListItem>(
  JSON.parse(schemaString),
);

export const validateCharacterListItem = async (data: any) => {
  if (validateCharacterData(data)) {
    return data;
  } else {
    // The type cast is needed to allow user-defined keywords and errors
    // You can extend this type to include your error types as needed.
    for (const err of validateCharacterData.errors as DefinedError[]) {
      console.error(err.message);
    }
    throw Error(validateCharacterData.errors![0].message);
  }
};

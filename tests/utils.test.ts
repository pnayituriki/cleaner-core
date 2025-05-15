import { NormalizerOptions, parseValue } from "../src";

const defaultOptions: NormalizerOptions = {
  treatEmptyStringAs: "null",
  removeUndefinedFields: false,
  enableDateParsing: true,
  enableJsonParsing: true,
  convertNumbers: true,
  convertBooleans: true,
  convertNulls: true,
  whitelist: null,
  blacklist: null,
  fieldTransformers: {},
  fieldParsers: {},
  defaultValues: {},
  schemaFallbacks: {},
  validators: {},
  validationMode: "none",
};

describe('parseValue()',()=>{
    it('should convert "true" and "false" to boolean',()=>{
        expect(parseValue('true',null,defaultOptions)).toBe(true);
        expect(parseValue('false',null,defaultOptions)).toBe(false)
    })

    it('should convert numeric strings to numbers',()=>{
        expect(parseValue('42',null,defaultOptions)).toBe(42)
    })

    it('should convert "null" and "undefined"',()=>{
        expect(parseValue('null',null,defaultOptions)).toBeNull();
        expect(parseValue('undefined',null,defaultOptions)).toBeUndefined();
    })

    it('should detect ISO date strings',()=>{
        const val = parseValue("2024-01-01T00:00:00Z",null,defaultOptions);
        expect(val instanceof Date).toBe(true)
    })

    it('should parse JSON arrays and objects',()=>{
        expect(parseValue('["a","b"]', null,defaultOptions)).toEqual(['a','b'])
        expect(parseValue('{"x":1}',null,defaultOptions)).toEqual({x:1})
    })

    it('should respect treatEmptyStringAs option',()=>{
        expect(parseValue('',null,{...defaultOptions,treatEmptyStringAs:'keep'})).toBe('');
        expect(parseValue('',null,{...defaultOptions,treatEmptyStringAs:'null'})).toBeNull();
        expect(parseValue('',null,{...defaultOptions,treatEmptyStringAs:'undefined'})).toBeUndefined()
    })
})
import { InputNormalizer } from '../src';

describe('InputNormalizer',()=>{
    it('should initialize with default options and return input as-is',()=>{
        const normalizer = new InputNormalizer();
        const input = {name:'John',age:'25',gender:'null'};
        const {result} = normalizer.normalize(input);

        expect(result).toEqual(input);
    });
})
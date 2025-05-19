import { InputNormalizer } from "./InputNormalizer";
import { NormalizerOptions, NormalizerResult } from "./types";

/**
 * Functional API for normalizing input data
 */
export function normalize<T = any>(
  input: Record<string, any>,
  options: NormalizerOptions = {}
): NormalizerResult<T> {
  const normalizer = new InputNormalizer(options);
  return normalizer.normalize<T>(input);
}
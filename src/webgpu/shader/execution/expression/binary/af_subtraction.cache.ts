import { FP, FPVector } from '../../../../util/floating_point.js';
import { sparseScalarF64Range } from '../../../../util/math.js';
import { makeCaseCache } from '../case_cache.js';

import { getSubtractionAFInterval, kSparseVectorAFValues } from './af_data.js';

const subtractionVectorScalarInterval = (vec: readonly number[], s: number): FPVector => {
  return FP.abstract.toVector(vec.map(v => getSubtractionAFInterval(v, s)));
};

const subtractionScalarVectorInterval = (s: number, vec: readonly number[]): FPVector => {
  return FP.abstract.toVector(vec.map(v => getSubtractionAFInterval(s, v)));
};

const vector_scalar_cases = ([2, 3, 4] as const)
  .map(dim => ({
    [`vec${dim}_scalar`]: () => {
      return FP.abstract.generateVectorScalarToVectorCases(
        kSparseVectorAFValues[dim],
        sparseScalarF64Range(),
        'finite',
        subtractionVectorScalarInterval
      );
    },
  }))
  .reduce((a, b) => ({ ...a, ...b }), {});

const scalar_vector_cases = ([2, 3, 4] as const)
  .map(dim => ({
    [`scalar_vec${dim}`]: () => {
      return FP.abstract.generateScalarVectorToVectorCases(
        sparseScalarF64Range(),
        kSparseVectorAFValues[dim],
        'finite',
        subtractionScalarVectorInterval
      );
    },
  }))
  .reduce((a, b) => ({ ...a, ...b }), {});

export const d = makeCaseCache('binary/af_subtraction', {
  ['scalar']: () => {
    return FP.abstract.generateScalarPairToIntervalCases(
      sparseScalarF64Range(),
      sparseScalarF64Range(),
      'finite',
      getSubtractionAFInterval
    );
  },
  ...vector_scalar_cases,
  ...scalar_vector_cases,
});

/**
* AUTO-GENERATED - DO NOT EDIT. Source: https://github.com/gpuweb/cts
**/import { FP } from '../../../../../util/floating_point.js';import { makeCaseCache } from '../../case_cache.js';
// Cases: [f32|f16]_vecN_[non_]const
const cases = ['f32', 'f16'].
flatMap((trait) =>
[2, 3, 4].flatMap((dim) =>
[true, false].map((nonConst) => ({
  [`${trait}_vec${dim}_${nonConst ? 'non_const' : 'const'}`]: () => {
    return FP[trait].generateVectorPairToVectorCases(
      FP[trait].sparseVectorRange(dim),
      FP[trait].sparseVectorRange(dim),
      nonConst ? 'unfiltered' : 'finite',
      FP[trait].reflectInterval
    );
  }
}))
)
).
reduce((a, b) => ({ ...a, ...b }), {});

export const d = makeCaseCache('reflect', cases);
//# sourceMappingURL=reflect.cache.js.map
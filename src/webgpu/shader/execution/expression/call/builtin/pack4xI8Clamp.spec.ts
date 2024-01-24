export const description = `
Execution tests for the 'pack4xI8Clamp' builtin function

@const fn pack4xI8Clamp(e: vec4<i32>) -> u32
Clamp each component of e in the range [-128, 127] and then pack the lower 8 bits of each component
into a u32 value. Component e[i] of the input is mapped to bits (8 * i) through (8 * (i + 7)) of the
result.
`;

import { makeTestGroup } from '../../../../../../common/framework/test_group.js';
import { GPUTest } from '../../../../../gpu_test.js';
import { TypeI32, TypeU32, TypeVec, u32, toVector, i32 } from '../../../../../util/conversion.js';
import { clamp } from '../../../../../util/math.js';
import { Case } from '../../case.js';
import { allInputSources, Config, run } from '../../expression.js';

import { builtin } from './builtin.js';

export const g = makeTestGroup(GPUTest);

g.test('basic')
  .specURL('https://www.w3.org/TR/WGSL/#pack4xI8Clamp-builtin')
  .desc(
    `
@const fn pack4xI8Clamp(e: vec4<i32>) -> u32
  `
  )
  .params(u => u.combine('inputSource', allInputSources))
  .fn(async t => {
    const cfg: Config = t.params;

    const pack4xI8Clamp = (vals: readonly [number, number, number, number]) => {
      const result = new Uint32Array(1);
      for (let i = 0; i < 4; ++i) {
        const clampedValue = clamp(vals[i], { min: -128, max: 127 });
        result[0] |= (clampedValue & 0xff) << (i * 8);
      }
      return result[0];
    };

    const testInputs = [
      [0, 0, 0, 0],
      [1, 2, 3, 4],
      [-1, 2, 3, 4],
      [1, -2, 3, 4],
      [1, 2, -3, 4],
      [1, 2, 3, -4],
      [-1, -2, 3, 4],
      [-1, 2, -3, 4],
      [-1, 2, 3, -4],
      [1, -2, -3, 4],
      [1, -2, 3, -4],
      [1, 2, -3, -4],
      [-1, -2, -3, 4],
      [-1, -2, 3, -4],
      [-1, 2, -3, -4],
      [1, -2, -3, -4],
      [-1, -2, -3, -4],
      [126, 127, 128, 129],
      [-130, -129, -128, -127],
      [127, 128, -128, -129],
      [32767, 32768, -32768, -32769],
    ] as const;

    const makeCase = (vals: readonly [number, number, number, number]): Case => {
      return { input: [toVector(vals, i32)], expected: u32(pack4xI8Clamp(vals)) };
    };
    const cases: Array<Case> = testInputs.flatMap(v => {
      return [makeCase(v)];
    });

    await run(t, builtin('pack4xI8Clamp'), [TypeVec(4, TypeI32)], TypeU32, cfg, cases);
  });

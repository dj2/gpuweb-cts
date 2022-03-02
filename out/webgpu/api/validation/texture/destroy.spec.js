/**
* AUTO-GENERATED - DO NOT EDIT. Source: https://github.com/gpuweb/cts
**/export const description = `
Destroying a texture more than once is allowed.
`;import { makeTestGroup } from '../../../../common/framework/test_group.js';
import { kTextureAspects } from '../../../capability_info.js';
import { ValidationTest } from '../validation_test.js';

export const g = makeTestGroup(ValidationTest);

g.test('base').
desc(`Test that it is valid to destroy a texture.`).
fn(t => {
  const texture = t.getSampledTexture();
  texture.destroy();
});

g.test('twice').
desc(`Test that it is valid to destroy a destroyed texture.`).
fn(t => {
  const texture = t.getSampledTexture();
  texture.destroy();
  texture.destroy();
});

g.test('submit_a_destroyed_texture_as_attachment').
desc(
`
Test that it is invalid to submit with a texture as {color, depth, stencil, depth-stencil} attachment
that was destroyed {before, after} encoding finishes.
`).

params((u) =>
u //
.combine('depthStencilTextureAspect', kTextureAspects).
combine('colorTextureState', [
'valid',
'destroyedBeforeEncode',
'destroyedAfterEncode']).

combine('depthStencilTextureState', [
'valid',
'destroyedBeforeEncode',
'destroyedAfterEncode'])).


fn(async t => {
  const { colorTextureState, depthStencilTextureAspect, depthStencilTextureState } = t.params;

  const isSubmitSuccess = colorTextureState === 'valid' && depthStencilTextureState === 'valid';

  const colorTextureFormat = 'rgba32float';
  const depthStencilTextureFormat =
  depthStencilTextureAspect === 'all' ?
  'depth24plus-stencil8' :
  depthStencilTextureAspect === 'depth-only' ?
  'depth32float' :
  'stencil8';

  const colorTextureDesc = {
    size: { width: 16, height: 16, depthOrArrayLayers: 1 },
    format: colorTextureFormat,
    usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT };


  const depthStencilTextureDesc = {
    size: { width: 16, height: 16, depthOrArrayLayers: 1 },
    format: depthStencilTextureFormat,
    usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT };


  const colorTexture = t.device.createTexture(colorTextureDesc);
  const depthStencilTexture = t.device.createTexture(depthStencilTextureDesc);

  if (colorTextureState === 'destroyedBeforeEncode') {
    colorTexture.destroy();
  }
  if (depthStencilTextureState === 'destroyedBeforeEncode') {
    depthStencilTexture.destroy();
  }

  const commandEncoder = t.device.createCommandEncoder();
  const renderPass = commandEncoder.beginRenderPass({
    colorAttachments: [
    {
      view: colorTexture.createView(),
      clearValue: [0, 0, 0, 0],
      loadOp: 'clear',
      storeOp: 'store' }],


    depthStencilAttachment: {
      view: depthStencilTexture.createView({ aspect: depthStencilTextureAspect }),
      depthLoadValue: 0,
      depthStoreOp: 'discard',
      stencilLoadValue: 0,
      stencilStoreOp: 'discard' } });


  renderPass.end();

  const cmd = commandEncoder.finish();

  if (colorTextureState === 'destroyedAfterEncode') {
    colorTexture.destroy();
  }
  if (depthStencilTextureState === 'destroyedAfterEncode') {
    depthStencilTexture.destroy();
  }

  t.expectValidationError(() => t.queue.submit([cmd]), !isSubmitSuccess);
});
//# sourceMappingURL=destroy.spec.js.map
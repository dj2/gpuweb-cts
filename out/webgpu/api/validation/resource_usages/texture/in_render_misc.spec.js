/**
* AUTO-GENERATED - DO NOT EDIT. Source: https://github.com/gpuweb/cts
**/export const description = `
TODO:
- 2 views: upon the same subresource, or different subresources of the same texture
    - texture usages in copies and in render pass
    - unused bind groups
`;import { makeTestGroup } from '../../../../../common/framework/test_group.js';
import { unreachable } from '../../../../../common/util/util.js';
import { ValidationTest } from '../../validation_test.js';

class F extends ValidationTest {
  createBindGroupForTest(
  textureView,
  textureUsage,
  sampleType)
  {
    const bindGroupLayoutEntry = {
      binding: 0,
      visibility: GPUShaderStage.FRAGMENT };

    switch (textureUsage) {
      case 'texture':
        bindGroupLayoutEntry.texture = { viewDimension: '2d-array', sampleType };
        break;
      case 'storage':
        bindGroupLayoutEntry.storageTexture = {
          access: 'write-only',
          format: 'rgba8unorm',
          viewDimension: '2d-array' };

        break;
      default:
        unreachable();
        break;}

    const layout = this.device.createBindGroupLayout({
      entries: [bindGroupLayoutEntry] });

    return this.device.createBindGroup({
      layout,
      entries: [{ binding: 0, resource: textureView }] });

  }}


export const g = makeTestGroup(F);

const kTextureSize = 16;
const kTextureLayers = 3;

g.test('subresources,set_bind_group_on_same_index_color_texture').
desc(
`
  Test that when one color texture subresource is bound to different bind groups, whether the
  conflicted bind groups are reset by another compatible ones or not, its list of internal usages
  within one usage scope can only be a compatible usage list.`).

params((u) =>
u.
combineWithParams([
{ useDifferentTextureAsTexture2: true, baseLayer2: 0, view2Binding: 'texture' },
{ useDifferentTextureAsTexture2: false, baseLayer2: 0, view2Binding: 'texture' },
{ useDifferentTextureAsTexture2: false, baseLayer2: 1, view2Binding: 'texture' },
{ useDifferentTextureAsTexture2: false, baseLayer2: 0, view2Binding: 'storage' },
{ useDifferentTextureAsTexture2: false, baseLayer2: 1, view2Binding: 'storage' }]).

combine('hasConflict', [true, false])).

fn(async (t) => {
  const { useDifferentTextureAsTexture2, baseLayer2, view2Binding, hasConflict } = t.params;

  const texture0 = t.device.createTexture({
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING,
    size: [kTextureSize, kTextureSize, kTextureLayers] });

  // We always bind the first layer of the texture to bindGroup0.
  const textureView0 = texture0.createView({
    dimension: '2d-array',
    baseArrayLayer: 0,
    arrayLayerCount: 1 });

  const bindGroup0 = t.createBindGroupForTest(textureView0, view2Binding, 'float');

  // In one renderPassEncoder it is an error to set both bindGroup0 and bindGroup1.
  const view1Binding = hasConflict ?
  view2Binding === 'texture' ?
  'storage' :
  'texture' :
  view2Binding;
  const bindGroup1 = t.createBindGroupForTest(textureView0, view1Binding, 'float');

  const texture2 = useDifferentTextureAsTexture2 ?
  t.device.createTexture({
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING,
    size: [kTextureSize, kTextureSize, kTextureLayers] }) :

  texture0;
  const textureView2 = texture2.createView({
    dimension: '2d-array',
    baseArrayLayer: baseLayer2,
    arrayLayerCount: kTextureLayers - baseLayer2 });

  // There should be no conflict between bindGroup0 and validBindGroup2.
  const validBindGroup2 = t.createBindGroupForTest(textureView2, view2Binding, 'float');

  const colorTexture = t.device.createTexture({
    format: 'rgba8unorm',
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
    size: [kTextureSize, kTextureSize, 1] });

  const encoder = t.device.createCommandEncoder();
  const renderPassEncoder = encoder.beginRenderPass({
    colorAttachments: [
    {
      view: colorTexture.createView(),
      loadOp: 'load',
      storeOp: 'store' }] });



  renderPassEncoder.setBindGroup(0, bindGroup0);
  renderPassEncoder.setBindGroup(1, bindGroup1);
  renderPassEncoder.setBindGroup(1, validBindGroup2);
  renderPassEncoder.end();

  t.expectValidationError(() => {
    encoder.finish();
  }, hasConflict);
});

g.test('subresources,set_bind_group_on_same_index_depth_stencil_texture').
desc(
`
  Test that when one depth stencil texture subresource is bound to different bind groups, whether
  the conflicted bind groups are reset by another compatible ones or not, its list of internal
  usages within one usage scope can only be a compatible usage list.`).

params((u) =>
u.
combine('bindAspect', ['depth-only', 'stencil-only']).
combine('depthStencilReadOnly', [true, false])).

fn(async (t) => {
  const { bindAspect, depthStencilReadOnly } = t.params;
  const depthStencilTexture = t.device.createTexture({
    format: 'depth24plus-stencil8',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
    size: [kTextureSize, kTextureSize, 1] });


  const conflictedToNonReadOnlyAttachmentBindGroup = t.createBindGroupForTest(
  depthStencilTexture.createView({
    dimension: '2d-array',
    aspect: bindAspect }),

  'texture',
  bindAspect === 'depth-only' ? 'depth' : 'uint');


  const colorTexture = t.device.createTexture({
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING,
    size: [kTextureSize, kTextureSize, 1] });

  const validBindGroup = t.createBindGroupForTest(
  colorTexture.createView({
    dimension: '2d-array' }),

  'texture',
  'float');


  const encoder = t.device.createCommandEncoder();
  const renderPassEncoder = encoder.beginRenderPass({
    colorAttachments: [],
    depthStencilAttachment: {
      view: depthStencilTexture.createView(),
      depthReadOnly: depthStencilReadOnly,
      stencilReadOnly: depthStencilReadOnly } });


  renderPassEncoder.setBindGroup(0, conflictedToNonReadOnlyAttachmentBindGroup);
  renderPassEncoder.setBindGroup(0, validBindGroup);
  renderPassEncoder.end();

  t.expectValidationError(() => {
    encoder.finish();
  }, !depthStencilReadOnly);
});
//# sourceMappingURL=in_render_misc.spec.js.map
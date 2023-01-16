import { ShaderChunk, ShaderMaterial, UniformsLib, Color, Vector2 } from 'three';
import './meshline.glsl.js';
export class MeshLineMaterial extends ShaderMaterial {
    isMeshLineMaterial = true;
    type = 'MeshLineMaterial';
    constructor(parameters) {
        super({
            uniforms: Object.assign({}, UniformsLib.fog, {
                lineWidth: { value: 1 },
                map: { value: null },
                useMap: { value: false },
                alphaMap: { value: null },
                useAlphaMap: { value: false },
                color: { value: new Color(0xffffff) },
                opacity: { value: 1 },
                resolution: { value: new Vector2(1, 1) },
                sizeAttenuation: { value: true },
                dashArray: { value: 0 },
                dashOffset: { value: 0 },
                dashRatio: { value: 0.5 },
                useDash: { value: false },
                visibility: { value: 1 },
                alphaTest: { value: 0 },
                repeat: { value: new Vector2(1, 1) },
            }),
            vertexShader: ShaderChunk.meshline_vert,
            fragmentShader: ShaderChunk.meshline_frag,
        });
        Object.defineProperties(this, {
            fogColor: {
                enumerable: true,
                get: () => {
                    return this.uniforms.fogColor.value;
                },
                set: value => {
                    this.uniforms.fogColor.value = value;
                },
            },
            fogDensity: {
                enumerable: true,
                get: () => {
                    return this.uniforms.fogDensity.value;
                },
                set: value => {
                    this.uniforms.fogDensity.value = value;
                },
            },
            fogNear: {
                enumerable: true,
                get: () => {
                    return this.uniforms.fogNear.value;
                },
                set: value => {
                    this.uniforms.fogNear.value = value;
                },
            },
            fogFar: {
                enumerable: true,
                get: () => {
                    return this.uniforms.fogFar.value;
                },
                set: value => {
                    this.uniforms.fogFar.value = value;
                },
            },
            lineWidth: {
                enumerable: true,
                get: () => {
                    return this.uniforms.lineWidth.value;
                },
                set: value => {
                    this.uniforms.lineWidth.value = value;
                },
            },
            map: {
                enumerable: true,
                get: () => {
                    return this.uniforms.map.value;
                },
                set: value => {
                    this.uniforms.map.value = value;
                },
            },
            useMap: {
                enumerable: true,
                get: () => {
                    return this.uniforms.useMap.value;
                },
                set: value => {
                    this.uniforms.useMap.value = value;
                },
            },
            alphaMap: {
                enumerable: true,
                get: () => {
                    return this.uniforms.alphaMap.value;
                },
                set: value => {
                    this.uniforms.alphaMap.value = value;
                },
            },
            useAlphaMap: {
                enumerable: true,
                get: () => {
                    return this.uniforms.useAlphaMap.value;
                },
                set: value => {
                    this.uniforms.useAlphaMap.value = value;
                },
            },
            color: {
                enumerable: true,
                get: () => {
                    return this.uniforms.color.value;
                },
                set: value => {
                    this.uniforms.color.value = value;
                },
            },
            opacity: {
                enumerable: true,
                get: () => {
                    return this.uniforms.opacity.value;
                },
                set: value => {
                    this.uniforms.opacity.value = value;
                },
            },
            resolution: {
                enumerable: true,
                get: () => {
                    return this.uniforms.resolution.value;
                },
                set: value => {
                    this.uniforms.resolution.value.copy(value);
                },
            },
            sizeAttenuation: {
                enumerable: true,
                get: () => {
                    return this.uniforms.sizeAttenuation.value;
                },
                set: value => {
                    this.uniforms.sizeAttenuation.value = value;
                },
            },
            dashArray: {
                enumerable: true,
                get: () => {
                    return this.uniforms.dashArray.value;
                },
                set: value => {
                    this.uniforms.dashArray.value = value;
                    this.useDash = value !== 0 ? true : false;
                },
            },
            dashOffset: {
                enumerable: true,
                get: () => {
                    return this.uniforms.dashOffset.value;
                },
                set: value => {
                    this.uniforms.dashOffset.value = value;
                },
            },
            dashRatio: {
                enumerable: true,
                get: () => {
                    return this.uniforms.dashRatio.value;
                },
                set: value => {
                    this.uniforms.dashRatio.value = value;
                },
            },
            useDash: {
                enumerable: true,
                get: () => {
                    return this.uniforms.useDash.value;
                },
                set: value => {
                    this.uniforms.useDash.value = value;
                },
            },
            visibility: {
                enumerable: true,
                get: () => {
                    return this.uniforms.visibility.value;
                },
                set: value => {
                    this.uniforms.visibility.value = value;
                },
            },
            alphaTest: {
                enumerable: true,
                get: () => {
                    return this.uniforms.alphaTest.value;
                },
                set: value => {
                    this.uniforms.alphaTest.value = value;
                },
            },
            repeat: {
                enumerable: true,
                get: () => {
                    return this.uniforms.repeat.value;
                },
                set: value => {
                    this.uniforms.repeat.value.copy(value);
                },
            },
        });
        this.setValues(parameters);
    }
    copy(source) {
        super.copy(this);
        this.fogColor = source.fogColor;
        this.fogDensity = source.fogDensity;
        this.fogNear = source.fogNear;
        this.fogFar = source.fogFar;
        this.lineWidth = source.lineWidth;
        this.map = source.map;
        this.useMap = source.useMap;
        this.alphaMap = source.alphaMap;
        this.useAlphaMap = source.useAlphaMap;
        this.color.copy(source.color);
        this.opacity = source.opacity;
        this.resolution.copy(source.resolution);
        this.sizeAttenuation = source.sizeAttenuation;
        this.dashArray = source.dashArray;
        this.dashOffset = source.dashOffset;
        this.dashRatio = source.dashRatio;
        this.useDash = source.useDash;
        this.visibility = source.visibility;
        this.alphaTest = source.alphaTest;
        this.repeat.copy(source.repeat);
        return this;
    }
}
//# sourceMappingURL=MeshLineMaterial.js.map
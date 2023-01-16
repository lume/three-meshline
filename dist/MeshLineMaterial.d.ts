import { ShaderMaterial, UniformsLib, Color, Vector2 } from 'three';
import type { Texture, ShaderMaterialParameters, IUniform } from 'three';
import './meshline.glsl.js';
export declare class MeshLineMaterial extends ShaderMaterial {
    readonly isMeshLineMaterial = true;
    readonly type = "MeshLineMaterial";
    uniforms: typeof UniformsLib['fog'] & {
        lineWidth: IUniform<number>;
        map: IUniform<Texture | null>;
        useMap: IUniform<boolean>;
        alphaMap: IUniform<Texture | null>;
        useAlphaMap: IUniform<boolean>;
        color: IUniform<Color>;
        opacity: IUniform<number>;
        resolution: IUniform<Vector2>;
        sizeAttenuation: IUniform<boolean>;
        dashArray: IUniform<number>;
        dashOffset: IUniform<number>;
        dashRatio: IUniform<number>;
        useDash: IUniform<boolean>;
        visibility: IUniform<number>;
        alphaTest: IUniform<number>;
        repeat: IUniform<Vector2>;
    };
    constructor(parameters: ShaderMaterialParameters & MeshLineMaterial);
    copy(source: MeshLineMaterial): this;
}
export interface MeshLineMaterial {
    fogColor: Color;
    fogDensity: number;
    fogNear: number;
    fogFar: number;
    lineWidth: number;
    map: Texture;
    useMap: boolean;
    alphaMap: Texture;
    useAlphaMap: boolean;
    color: Color;
    opacity: number;
    resolution: Vector2;
    sizeAttenuation: boolean;
    dashArray: number;
    dashOffset: number;
    dashRatio: number;
    useDash: boolean;
    visibility: number;
    alphaTest: number;
    repeat: Vector2;
}
//# sourceMappingURL=MeshLineMaterial.d.ts.map
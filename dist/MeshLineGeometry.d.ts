import { BufferGeometry, Vector3 } from 'three';
import type { Float32BufferAttribute, Uint16BufferAttribute } from 'three';
export declare class MeshLineGeometry extends BufferGeometry {
    #private;
    readonly isMeshLineGeometry = true;
    readonly type = "MeshLineGeometry";
    widthCallback: ((point: number) => number) | null;
    attributes: Partial<{
        position: Float32BufferAttribute;
        previous: Float32BufferAttribute;
        next: Float32BufferAttribute;
        side: Float32BufferAttribute;
        width: Float32BufferAttribute;
        uv: Float32BufferAttribute;
        index: Uint16BufferAttribute;
        counters: Float32BufferAttribute;
    }>;
    get points(): Vector3[] | WritableArrayLike<number>;
    set points(value: Vector3[] | WritableArrayLike<number>);
    setPoints(points: Array<Vector3> | WritableArrayLike<number>, wcb?: ((point: number) => number) | null): void;
    advance(position: Vector3): void;
}
interface WritableArrayLike<T> {
    readonly length: number;
    [n: number]: T;
}
export {};
//# sourceMappingURL=MeshLineGeometry.d.ts.map
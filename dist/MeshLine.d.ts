import { Mesh } from 'three';
import type { Raycaster, Intersection } from 'three';
import type { MeshLineMaterial } from './MeshLineMaterial';
import type { MeshLineGeometry } from './MeshLineGeometry';
export declare class MeshLine extends Mesh<MeshLineGeometry, MeshLineMaterial> {
    readonly isMeshLine = true;
    readonly type = "MeshLine";
    raycast(raycaster: Raycaster, intersects: Intersection[]): void;
}
//# sourceMappingURL=MeshLine.d.ts.map
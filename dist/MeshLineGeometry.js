import { BufferAttribute, BufferGeometry, Vector3 } from 'three';
const itemSize = 6;
export class MeshLineGeometry extends BufferGeometry {
    isMeshLineGeometry = true;
    type = 'MeshLineGeometry';
    #positions = [];
    #previous = [];
    #next = [];
    #side = [];
    #width = [];
    #indices_array = [];
    #uvs = [];
    #counters = [];
    widthCallback = null;
    #attributes = null;
    #points = [];
    get points() {
        return this.#points;
    }
    set points(value) {
        this.setPoints(value, this.widthCallback);
    }
    setPoints(points, wcb) {
        if (!(points instanceof Float32Array) && !(points instanceof Array)) {
            throw new Error('invalid points');
        }
        if (!points.length)
            return;
        this.#points = points;
        if (wcb)
            this.widthCallback = wcb;
        this.#positions = [];
        this.#counters = [];
        if (isVector3Array(points)) {
            for (let j = 0; j < points.length; j++) {
                const p = points[j];
                if (!p)
                    throw new Error('point missing');
                const c = j / points.length;
                this.#positions.push(p.x, p.y, p.z);
                this.#positions.push(p.x, p.y, p.z);
                this.#counters.push(c);
                this.#counters.push(c);
            }
        }
        else {
            for (let j = 0; j < points.length; j += 3) {
                const c = j / points.length;
                const x = points[j + 0];
                const y = points[j + 1];
                const z = points[j + 2];
                if (x == null || y == null || z == null)
                    throw new Error('point missing');
                this.#positions.push(x, y, z);
                this.#positions.push(x, y, z);
                this.#counters.push(c);
                this.#counters.push(c);
            }
        }
        this.#process();
    }
    #pointsAreEqual(pointIndexA, pointIndexB) {
        const actualIndexA = pointIndexA * itemSize;
        const actualIndexB = pointIndexB * itemSize;
        return (this.#positions[actualIndexA + 0] === this.#positions[actualIndexB + 0] &&
            this.#positions[actualIndexA + 1] === this.#positions[actualIndexB + 1] &&
            this.#positions[actualIndexA + 2] === this.#positions[actualIndexB + 2]);
    }
    #clonePoint(pointIndex) {
        const actualIndex = pointIndex * itemSize;
        const x = this.#positions[actualIndex + 0];
        const y = this.#positions[actualIndex + 1];
        const z = this.#positions[actualIndex + 2];
        if (x == null || y == null || z == null)
            throw new Error('point missing');
        return [x, y, z];
    }
    #process() {
        const pointCount = this.#positions.length / itemSize;
        this.#previous = [];
        this.#next = [];
        this.#side = [];
        this.#width = [];
        this.#indices_array = [];
        this.#uvs = [];
        let width;
        let point;
        if (this.#pointsAreEqual(0, pointCount - 1)) {
            point = this.#clonePoint(pointCount - 2);
        }
        else {
            point = this.#clonePoint(0);
        }
        this.#previous.push(point[0], point[1], point[2]);
        this.#previous.push(point[0], point[1], point[2]);
        for (let j = 0; j < pointCount; j++) {
            this.#side.push(1);
            this.#side.push(-1);
            if (this.widthCallback)
                width = this.widthCallback(j / (pointCount - 1));
            else
                width = 1;
            this.#width.push(width);
            this.#width.push(width);
            this.#uvs.push(j / (pointCount - 1), 0);
            this.#uvs.push(j / (pointCount - 1), 1);
            if (j < pointCount - 1) {
                point = this.#clonePoint(j);
                this.#previous.push(point[0], point[1], point[2]);
                this.#previous.push(point[0], point[1], point[2]);
                const n = j * 2;
                this.#indices_array.push(n, n + 1, n + 2);
                this.#indices_array.push(n + 2, n + 1, n + 3);
            }
            if (j > 0) {
                point = this.#clonePoint(j);
                this.#next.push(point[0], point[1], point[2]);
                this.#next.push(point[0], point[1], point[2]);
            }
        }
        if (this.#pointsAreEqual(pointCount - 1, 0)) {
            point = this.#clonePoint(1);
        }
        else {
            point = this.#clonePoint(pointCount - 1);
        }
        this.#next.push(point[0], point[1], point[2]);
        this.#next.push(point[0], point[1], point[2]);
        if (!this.#attributes || this.#attributes.position.count * 3 !== this.#positions.length) {
            this.#attributes = {
                position: new BufferAttribute(new Float32Array(this.#positions), 3),
                previous: new BufferAttribute(new Float32Array(this.#previous), 3),
                next: new BufferAttribute(new Float32Array(this.#next), 3),
                side: new BufferAttribute(new Float32Array(this.#side), 1),
                width: new BufferAttribute(new Float32Array(this.#width), 1),
                uv: new BufferAttribute(new Float32Array(this.#uvs), 2),
                index: new BufferAttribute(new Uint16Array(this.#indices_array), 1),
                counters: new BufferAttribute(new Float32Array(this.#counters), 1),
            };
        }
        else {
            this.#attributes.position.copyArray(this.#positions);
            this.#attributes.position.needsUpdate = true;
            this.#attributes.previous.copyArray(this.#previous);
            this.#attributes.previous.needsUpdate = true;
            this.#attributes.next.copyArray(this.#next);
            this.#attributes.next.needsUpdate = true;
            this.#attributes.side.copyArray(this.#side);
            this.#attributes.side.needsUpdate = true;
            this.#attributes.width.copyArray(this.#width);
            this.#attributes.width.needsUpdate = true;
            this.#attributes.uv.copyArray(this.#uvs);
            this.#attributes.uv.needsUpdate = true;
            this.#attributes.index.copyArray(this.#indices_array);
            this.#attributes.index.needsUpdate = true;
        }
        this.setAttribute('position', this.#attributes.position);
        this.setAttribute('previous', this.#attributes.previous);
        this.setAttribute('next', this.#attributes.next);
        this.setAttribute('side', this.#attributes.side);
        this.setAttribute('width', this.#attributes.width);
        this.setAttribute('uv', this.#attributes.uv);
        this.setAttribute('counters', this.#attributes.counters);
        this.setIndex(this.#attributes.index);
        this.computeBoundingSphere();
        this.computeBoundingBox();
    }
    advance(position) {
        if (!this.#attributes)
            throw new Error('Call setPoints first.');
        const positions = this.#attributes.position.array;
        const previous = this.#attributes.previous.array;
        const next = this.#attributes.next.array;
        const l = positions.length;
        memcpy(positions, 0, previous, 0, l);
        memcpy(positions, itemSize, positions, 0, l - itemSize);
        positions[l - 6] = position.x;
        positions[l - 5] = position.y;
        positions[l - 4] = position.z;
        positions[l - 3] = position.x;
        positions[l - 2] = position.y;
        positions[l - 1] = position.z;
        memcpy(positions, itemSize, next, 0, l - itemSize);
        next[l - 6] = position.x;
        next[l - 5] = position.y;
        next[l - 4] = position.z;
        next[l - 3] = position.x;
        next[l - 2] = position.y;
        next[l - 1] = position.z;
        this.#attributes.position.needsUpdate = true;
        this.#attributes.previous.needsUpdate = true;
        this.#attributes.next.needsUpdate = true;
    }
}
function isVector3Array(array) {
    return !!(array.length && array[0] instanceof Vector3);
}
function memcpy(src, srcBegin, dst, dstOffset, srcLength) {
    if (dstOffset + srcLength > dst.length)
        throw new Error('Not enough space to copy from src to dst.');
    for (let i = 0, srcEnd = srcBegin + srcLength; i + srcBegin < srcEnd; i++) {
        const srcValue = src[i + srcBegin];
        if (srcValue == null)
            throw new Error('missing src value');
        dst[i + dstOffset] = srcValue;
    }
}
//# sourceMappingURL=MeshLineGeometry.js.map
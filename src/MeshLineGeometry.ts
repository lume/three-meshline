// @ts-check
import {BufferAttribute, BufferGeometry, Vector3} from 'three'
import type {Float32BufferAttribute, Uint16BufferAttribute} from 'three'

const itemSize = 6

export class MeshLineGeometry extends BufferGeometry {
	readonly isMeshLineGeometry = true
	override readonly type = 'MeshLineGeometry'

	#positions = new Float32Array()
	#previous = new Float32Array()
	#next = new Float32Array()
	#side = new Float32Array()
	#width = new Float32Array()
	#uvs = new Float32Array()
	#indices = new Uint16Array()
	#counters = new Float32Array()

	/**
	 * A callback to be called for each point to determine the width of the line
	 * at that point. Although `setPoints` accepts this function as an argument,
	 * this has to be a public property so it can be used as a prop in
	 * react-three-fiber.
	 */
	widthCallback: ((point: number) => number) | null = null

	#attributes: {
		position: Float32BufferAttribute
		previous: Float32BufferAttribute
		next: Float32BufferAttribute
		side: Float32BufferAttribute
		width: Float32BufferAttribute
		uv: Float32BufferAttribute
		counters: Float32BufferAttribute
		index: Uint16BufferAttribute
	} | null = null

	declare attributes: Partial<{
		position: Float32BufferAttribute
		previous: Float32BufferAttribute
		next: Float32BufferAttribute
		side: Float32BufferAttribute
		width: Float32BufferAttribute
		uv: Float32BufferAttribute
		counters: Float32BufferAttribute
		index: Uint16BufferAttribute
	}>

	#points: Vector3[] | WritableArrayLike<number> = []

	/**
	 * As an alternative to meshLine.setPoints(points), we can set
	 * meshLine.points = points. This was added for and is public for use as a
	 * prop in react-three-fiber.
	 */
	get points() {
		return this.#points
	}
	set points(value) {
		this.setPoints(value, this.widthCallback)
	}

	#previousWidthCallback: ((p: number) => number) | null = null
	#previousPointCount = 0
	#pointCount = 0

	setPoints(
		points: Array<Vector3> | WritableArrayLike<number>,
		widthCallback: ((point: number) => number) | null = null,
		updateBounds: boolean = true,
	) {
		// as the points are mutated we store them
		// for later retreival when necessary (declarative architectures)
		this.#points = points

		this.#previousWidthCallback = this.widthCallback
		this.widthCallback = widthCallback

		if (!('length' in points)) {
			throw new Error('not a Vector3 Array, or not a number Array or Float32Array with 3 numbers per point')
		}

		if (!points.length) {
			// Dispose in case we previously had points and they're being removed.
			this.dispose()
			this.#pointCount = 0
			this.#previousPointCount = 0
			return
		}

		const isVector3Arr = isVector3Array(points)

		if (isVector3Arr) {
			this.#pointCount = points.length
		} else {
			// @prod-prune
			if (points.length % 3 !== 0) throw new Error('The array should consist of number triplets, 3 number per point.')
			this.#pointCount = points.length / 3
		}

		const pointCount = this.#pointCount
		const sizeChanged = this.#previousPointCount !== pointCount
		const wcbChanged = this.#previousWidthCallback !== this.widthCallback

		if (!this.#attributes || sizeChanged) {
			this.#makeNewBuffers(pointCount)
		}

		this.#previousPointCount = pointCount

		let width
		let x: number | undefined = 0
		let y: number | undefined = 0
		let z: number | undefined = 0

		let positionIndex = 0
		let counterIndex = 0
		let previousIndex = 0
		let nextIndex = 0
		let sideIndex = 0
		let widthIndex = 0
		let indicesIndex = 0
		let uvsIndex = 0

		if (isVector3Arr) {
			for (let j = 0; j < points.length; j++) {
				const p = points[j]
				// @prod-prune
				if (!p) throw new Error('point missing')
				;({x, y, z} = p)
				setXYZXYZ(this.#positions, positionIndex, x, y, z)
				positionIndex += itemSize

				const c = j / points.length
				this.#counters[counterIndex + 0] = c
				this.#counters[counterIndex + 1] = c
				counterIndex += 2
			}
		} else {
			for (let j = 0; j < points.length; j += 3) {
				const x = points[j + 0]
				const y = points[j + 1]
				const z = points[j + 2]
				// @prod-prune
				if (x == null || y == null || z == null) throw new Error('point missing')
				setXYZXYZ(this.#positions, positionIndex, x, y, z)
				positionIndex += itemSize

				const c = j / points.length
				this.#counters[counterIndex + 0] = c
				this.#counters[counterIndex + 1] = c
				counterIndex += 2
			}
		}

		let getIndex = 0

		// initial previous points
		if (this.#pointsAreEqual(0, pointCount - 1)) {
			getIndex = (pointCount - 2) * itemSize
			x = this.#positions[getIndex + 0]
			y = this.#positions[getIndex + 1]
			z = this.#positions[getIndex + 2]
		} else {
			getIndex = 0
			x = this.#positions[getIndex + 0]
			y = this.#positions[getIndex + 1]
			z = this.#positions[getIndex + 2]
		}
		// @prod-prune
		if (x == null || y == null || z == null) throw new Error('point missing')
		setXYZXYZ(this.#previous, previousIndex, x, y, z)
		previousIndex += 6

		for (let j = 0; j < pointCount; j++) {
			if (sizeChanged) {
				// sides
				setXY(this.#side, sideIndex, 1, -1)
				sideIndex += 2
			}

			if (wcbChanged || sizeChanged) {
				// widths
				if (this.widthCallback) width = this.widthCallback(j / (pointCount - 1))
				else width = 1
				setXY(this.#width, widthIndex, width, width)
				widthIndex += 2
			}

			if (sizeChanged) {
				// uvs
				setXYZW(this.#uvs, uvsIndex, j / (pointCount - 1), 0, j / (pointCount - 1), 1)
				uvsIndex += 4
			}

			if (j < pointCount - 1) {
				// points previous to poisitions
				getIndex = j * itemSize
				x = this.#positions[getIndex + 0]
				y = this.#positions[getIndex + 1]
				z = this.#positions[getIndex + 2]
				// @prod-prune
				if (x == null || y == null || z == null) throw new Error('point missing')
				setXYZXYZ(this.#previous, previousIndex, x, y, z)
				previousIndex += 6

				if (sizeChanged) {
					// indices
					// index has one less point count than previous because it
					// represents indices *between* points (the number of spaces
					// between points is one less than the number of points). F.e.
					// Given this line with 4 points, • • • •, there are 3 spaces
					// between the points.
					const n = j * 2
					setXYZ(this.#indices, indicesIndex, n + 0, n + 1, n + 2)
					setXYZ(this.#indices, indicesIndex + 3, n + 2, n + 1, n + 3)
					indicesIndex += 6
				}
			}

			if (j > 0) {
				// points after poisitions
				getIndex = j * itemSize
				x = this.#positions[getIndex + 0]
				y = this.#positions[getIndex + 1]
				z = this.#positions[getIndex + 2]
				// @prod-prune
				if (x == null || y == null || z == null) throw new Error('point missing')
				setXYZXYZ(this.#next, nextIndex, x, y, z)
				nextIndex += 6
			}
		}

		// last next point
		if (this.#pointsAreEqual(pointCount - 1, 0)) {
			getIndex = 1 * itemSize
			x = this.#positions[getIndex + 0]
			y = this.#positions[getIndex + 1]
			z = this.#positions[getIndex + 2]
		} else {
			getIndex = (pointCount - 1) * itemSize
			x = this.#positions[getIndex + 0]
			y = this.#positions[getIndex + 1]
			z = this.#positions[getIndex + 2]
		}
		// @prod-prune
		if (x == null || y == null || z == null) throw new Error('point missing')
		setXYZXYZ(this.#next, nextIndex, x, y, z)

		// @prod-prune
		if (!this.#attributes) throw new Error('missing attributes')
		this.#attributes.position.needsUpdate = true
		this.#attributes.previous.needsUpdate = true
		this.#attributes.next.needsUpdate = true
		this.#attributes.side.needsUpdate = sizeChanged
		this.#attributes.width.needsUpdate = sizeChanged
		this.#attributes.uv.needsUpdate = sizeChanged
		this.#attributes.index.needsUpdate = sizeChanged

		if (updateBounds) {
			this.computeBoundingSphere()
			this.computeBoundingBox()
		}
	}

	#makeNewBuffers(pointCount: number) {
		// don't forget to remove the previous buffers from the GPU first.
		this.dispose()

		this.#attributes = {
			position: new BufferAttribute((this.#positions = new Float32Array(pointCount * itemSize)), 3),
			previous: new BufferAttribute((this.#previous = new Float32Array(pointCount * itemSize)), 3),
			next: new BufferAttribute((this.#next = new Float32Array(pointCount * itemSize)), 3),
			side: new BufferAttribute((this.#side = new Float32Array(pointCount * 2)), 1),
			width: new BufferAttribute((this.#width = new Float32Array(pointCount * 2)), 1),
			uv: new BufferAttribute((this.#uvs = new Float32Array(pointCount * 4)), 2),
			counters: new BufferAttribute((this.#counters = new Float32Array(pointCount * 2)), 1),
			// index has one less point count because it represents indices
			// *between* points (the number of spaces between points is one
			// less than the number of points). F.e. Given this line with 4
			// points, • • • •, there are 3 spaces between the points.
			index: new BufferAttribute((this.#indices = new Uint16Array((pointCount - 1) * itemSize)), 1),
		}

		this.setAttribute('position', this.#attributes.position)
		this.setAttribute('previous', this.#attributes.previous)
		this.setAttribute('next', this.#attributes.next)
		this.setAttribute('side', this.#attributes.side)
		this.setAttribute('width', this.#attributes.width)
		this.setAttribute('uv', this.#attributes.uv)
		this.setAttribute('counters', this.#attributes.counters)

		this.setIndex(this.#attributes.index)
	}

	#pointsAreEqual(pointIndexA: number, pointIndexB: number) {
		const actualIndexA = pointIndexA * itemSize
		const actualIndexB = pointIndexB * itemSize
		return (
			this.#positions[actualIndexA + 0] === this.#positions[actualIndexB + 0] &&
			this.#positions[actualIndexA + 1] === this.#positions[actualIndexB + 1] &&
			this.#positions[actualIndexA + 2] === this.#positions[actualIndexB + 2]
		)
	}

	/**
	 * Fast method to advance the line by one position.  The oldest position is removed.
	 */
	advance(position: Vector3) {
		// @prod-prune
		if (!this.#attributes) throw new Error('Call setPoints first.')

		const positions = this.#attributes.position.array as Float32Array
		const previous = this.#attributes.previous.array as Float32Array
		const next = this.#attributes.next.array as Float32Array
		const l = positions.length

		memcpy(positions, 0, previous, 0, l)

		// FIFO
		// shift all points left by one
		memcpy(positions, itemSize, positions, 0, l - itemSize)
		// add the new point at the end
		positions[l - 6] = position.x
		positions[l - 5] = position.y
		positions[l - 4] = position.z
		positions[l - 3] = position.x
		positions[l - 2] = position.y
		positions[l - 1] = position.z

		// similarly shift, but into the next array instead of in place
		memcpy(positions, itemSize, next, 0, l - itemSize)
		next[l - 6] = position.x
		next[l - 5] = position.y
		next[l - 4] = position.z
		next[l - 3] = position.x
		next[l - 2] = position.y
		next[l - 1] = position.z

		this.#attributes.position.needsUpdate = true
		this.#attributes.previous.needsUpdate = true
		this.#attributes.next.needsUpdate = true
	}
}

function isVector3Array(array: Array<Vector3> | WritableArrayLike<number>): array is Vector3[] {
	return !!(array.length && array[0] instanceof Vector3)
}

function memcpy(src: TypedArray, srcBegin: number, dst: TypedArray, dstOffset: number, srcLength: number) {
	// @prod-prune
	if (dstOffset + srcLength > dst.length) throw new Error('Not enough space to copy from src to dst.')

	for (let i = 0, srcEnd = srcBegin + srcLength; i + srcBegin < srcEnd; i++) {
		const srcValue = src[i + srcBegin]
		// @prod-prune
		if (srcValue == null) throw new Error('missing src value')
		dst[i + dstOffset] = srcValue
	}
}

function setXY(array: WritableArrayLike<number>, location: number, x: number, y: number) {
	array[location + 0] = x
	array[location + 1] = y
}

function setXYZ(array: WritableArrayLike<number>, location: number, x: number, y: number, z: number) {
	array[location + 0] = x
	array[location + 1] = y
	array[location + 2] = z
}

function setXYZXYZ(array: WritableArrayLike<number>, location: number, x: number, y: number, z: number) {
	array[location + 0] = x
	array[location + 1] = y
	array[location + 2] = z

	array[location + 3] = x
	array[location + 4] = y
	array[location + 5] = z
}

function setXYZW(array: WritableArrayLike<number>, location: number, x: number, y: number, z: number, w: number) {
	array[location + 0] = x
	array[location + 1] = y
	array[location + 2] = z
	array[location + 3] = w
}

interface WritableArrayLike<T> {
	readonly length: number
	[n: number]: T
}

type TypedArray =
	| Int8Array
	| Uint8Array
	| Uint8ClampedArray
	| Int16Array
	| Uint16Array
	| Int32Array
	| Uint32Array
	| Float32Array
	| Float64Array

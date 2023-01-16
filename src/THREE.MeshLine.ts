// @ts-check
import {
	BufferAttribute,
	BufferGeometry,
	LineSegments,
	Matrix4,
	Ray,
	Sphere,
	Vector3,
	ShaderChunk,
	ShaderMaterial,
	UniformsLib,
	Color,
	Vector2,
} from 'three'

import type {
	Mesh,
	Raycaster,
	Intersection,
	Texture,
	ShaderMaterialParameters,
	IUniform,
	Float32BufferAttribute,
	Uint16BufferAttribute,
} from 'three'

const itemSize = 6

export class MeshLine extends BufferGeometry {
	readonly isMeshLine = true
	override readonly type = 'MeshLine'

	#positions: number[] = []

	#previous: number[] = []
	#next: number[] = []
	#side: number[] = []
	#width: number[] = []
	#indices_array: number[] = []
	#uvs: number[] = []
	#counters: number[] = []

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
		index: Uint16BufferAttribute
		counters: Float32BufferAttribute
	} | null = null

	declare attributes: Partial<{
		position: Float32BufferAttribute
		previous: Float32BufferAttribute
		next: Float32BufferAttribute
		side: Float32BufferAttribute
		width: Float32BufferAttribute
		uv: Float32BufferAttribute
		index: Uint16BufferAttribute
		counters: Float32BufferAttribute
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

	setPoints(points: Array<Vector3> | WritableArrayLike<number>, wcb?: ((point: number) => number) | null) {
		if (!(points instanceof Float32Array) && !(points instanceof Array)) {
			throw new Error('invalid points')
		}

		if (!points.length) return

		// as the points are mutated we store them
		// for later retreival when necessary (declarative architectures)
		this.#points = points

		if (wcb) this.widthCallback = wcb
		this.#positions = []
		this.#counters = []

		if (isVector3Array(points)) {
			// could transform Vector3 array into the array used below
			// but this approach will only loop through the array once
			// and is more performant
			for (let j = 0; j < points.length; j++) {
				const p = points[j]
				// @prod-prune
				if (!p) throw new Error('point missing')
				const c = j / points.length
				this.#positions.push(p.x, p.y, p.z)
				this.#positions.push(p.x, p.y, p.z)
				this.#counters.push(c)
				this.#counters.push(c)
			}
		} else {
			for (let j = 0; j < points.length; j += 3) {
				const c = j / points.length
				const x = points[j + 0]
				const y = points[j + 1]
				const z = points[j + 2]
				// @prod-prune
				if (x == null || y == null || z == null) throw new Error('point missing')
				this.#positions.push(x, y, z)
				this.#positions.push(x, y, z)
				this.#counters.push(c)
				this.#counters.push(c)
			}
		}

		this.#process()
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

	#clonePoint(pointIndex: number): [number, number, number] {
		const actualIndex = pointIndex * itemSize
		const x = this.#positions[actualIndex + 0]
		const y = this.#positions[actualIndex + 1]
		const z = this.#positions[actualIndex + 2]
		// @prod-prune
		if (x == null || y == null || z == null) throw new Error('point missing')
		return [x, y, z]
	}

	#process() {
		const pointCount = this.#positions.length / itemSize

		this.#previous = []
		this.#next = []
		this.#side = []
		this.#width = []
		this.#indices_array = []
		this.#uvs = []

		let width
		let point

		// initial previous points
		if (this.#pointsAreEqual(0, pointCount - 1)) {
			point = this.#clonePoint(pointCount - 2)
		} else {
			point = this.#clonePoint(0)
		}
		this.#previous.push(point[0], point[1], point[2])
		this.#previous.push(point[0], point[1], point[2])

		for (let j = 0; j < pointCount; j++) {
			// sides
			this.#side.push(1)
			this.#side.push(-1)

			// widths
			if (this.widthCallback) width = this.widthCallback(j / (pointCount - 1))
			else width = 1
			this.#width.push(width)
			this.#width.push(width)

			// uvs
			this.#uvs.push(j / (pointCount - 1), 0)
			this.#uvs.push(j / (pointCount - 1), 1)

			if (j < pointCount - 1) {
				// points previous to poisitions
				point = this.#clonePoint(j)
				this.#previous.push(point[0], point[1], point[2])
				this.#previous.push(point[0], point[1], point[2])

				// indices
				const n = j * 2
				this.#indices_array.push(n, n + 1, n + 2)
				this.#indices_array.push(n + 2, n + 1, n + 3)
			}
			if (j > 0) {
				// points after poisitions
				point = this.#clonePoint(j)
				this.#next.push(point[0], point[1], point[2])
				this.#next.push(point[0], point[1], point[2])
			}
		}

		// last next point
		if (this.#pointsAreEqual(pointCount - 1, 0)) {
			point = this.#clonePoint(1)
		} else {
			point = this.#clonePoint(pointCount - 1)
		}
		this.#next.push(point[0], point[1], point[2])
		this.#next.push(point[0], point[1], point[2])

		// redefining the attribute seems to prevent range errors
		// if the user sets a differing number of vertices
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
			}
		} else {
			this.#attributes.position.copyArray(this.#positions)
			this.#attributes.position.needsUpdate = true
			this.#attributes.previous.copyArray(this.#previous)
			this.#attributes.previous.needsUpdate = true
			this.#attributes.next.copyArray(this.#next)
			this.#attributes.next.needsUpdate = true
			this.#attributes.side.copyArray(this.#side)
			this.#attributes.side.needsUpdate = true
			this.#attributes.width.copyArray(this.#width)
			this.#attributes.width.needsUpdate = true
			this.#attributes.uv.copyArray(this.#uvs)
			this.#attributes.uv.needsUpdate = true
			this.#attributes.index.copyArray(this.#indices_array)
			this.#attributes.index.needsUpdate = true
		}

		this.setAttribute('position', this.#attributes.position)
		this.setAttribute('previous', this.#attributes.previous)
		this.setAttribute('next', this.#attributes.next)
		this.setAttribute('side', this.#attributes.side)
		this.setAttribute('width', this.#attributes.width)
		this.setAttribute('uv', this.#attributes.uv)
		this.setAttribute('counters', this.#attributes.counters)

		this.setIndex(this.#attributes.index)

		this.computeBoundingSphere()
		this.computeBoundingBox()
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

export function MeshLineRaycast(
	mesh: Mesh<MeshLine, MeshLineMaterial>,
	raycaster: Raycaster,
	intersects: Intersection[],
) {
	const inverseMatrix = new Matrix4()
	const ray = new Ray()
	const sphere = new Sphere()
	const interRay = new Vector3()
	const geometry = mesh.geometry
	// Checking boundingSphere distance to ray

	if (!geometry.boundingSphere) geometry.computeBoundingSphere()
	sphere.copy(geometry.boundingSphere!)
	sphere.applyMatrix4(mesh.matrixWorld)

	if (!raycaster.ray.intersectSphere(sphere, interRay)) {
		return
	}

	inverseMatrix.copy(mesh.matrixWorld).invert()
	ray.copy(raycaster.ray).applyMatrix4(inverseMatrix)

	const vStart = new Vector3()
	const vEnd = new Vector3()
	const interSegment = new Vector3()
	const step = mesh instanceof LineSegments ? 2 : 1
	const index = geometry.index
	const attributes = geometry.attributes

	if (index !== null) {
		const indices = index.array
		const positions = attributes.position!.array
		const widths = attributes.width!.array

		for (let i = 0, l = indices.length - 1; i < l; i += step) {
			const a = indices[i]
			const b = indices[i + 1]
			// @prod-prune
			if (a == null || b == null) throw new Error('missing index')

			vStart.fromArray(positions, a * 3)
			vEnd.fromArray(positions, b * 3)
			const width = widths[Math.floor(i / 3)] !== undefined ? widths[Math.floor(i / 3)] : 1
			// @prod-prune
			if (width == null) throw new Error('missing width')
			raycaster.params.Line = raycaster.params.Line ?? {threshold: 1}
			const precision = raycaster.params.Line.threshold + (mesh.material.lineWidth * width) / 2
			const precisionSq = precision * precision

			const distSq = ray.distanceSqToSegment(vStart, vEnd, interRay, interSegment)

			if (distSq > precisionSq) continue

			interRay.applyMatrix4(mesh.matrixWorld) //Move back to world space for distance calculation

			const distance = raycaster.ray.origin.distanceTo(interRay)

			if (distance < raycaster.near || distance > raycaster.far) continue

			intersects.push({
				distance: distance,
				// What do we want? intersection point on the ray or on the segment??
				// point: raycaster.ray.at( distance ),
				point: interSegment.clone().applyMatrix4(mesh.matrixWorld),
				index: i,
				face: null,
				faceIndex: undefined,
				object: mesh,
			})
			// make event only fire once
			i = l
		}
	}
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

export class MeshLineMaterial extends ShaderMaterial {
	readonly isMeshLineMaterial = true
	override readonly type = 'MeshLineMaterial'

	declare uniforms: typeof UniformsLib['fog'] & {
		lineWidth: IUniform<number>
		map: IUniform<Texture | null>
		useMap: IUniform<boolean>
		alphaMap: IUniform<Texture | null>
		useAlphaMap: IUniform<boolean>
		color: IUniform<Color>
		opacity: IUniform<number>
		resolution: IUniform<Vector2>
		sizeAttenuation: IUniform<boolean>
		dashArray: IUniform<number>
		dashOffset: IUniform<number>
		dashRatio: IUniform<number>
		useDash: IUniform<boolean>
		visibility: IUniform<number>
		alphaTest: IUniform<number>
		repeat: IUniform<Vector2>
	}

	constructor(parameters: ShaderMaterialParameters & MeshLineMaterial) {
		super({
			uniforms: Object.assign({}, UniformsLib.fog, {
				lineWidth: {value: 1},
				map: {value: null},
				useMap: {value: false},
				alphaMap: {value: null},
				useAlphaMap: {value: false},
				color: {value: new Color(0xffffff)},
				opacity: {value: 1},
				resolution: {value: new Vector2(1, 1)},
				sizeAttenuation: {value: true},
				dashArray: {value: 0},
				dashOffset: {value: 0},
				dashRatio: {value: 0.5},
				useDash: {value: false},
				visibility: {value: 1},
				alphaTest: {value: 0},
				repeat: {value: new Vector2(1, 1)},
			}),

			vertexShader: ShaderChunk.meshline_vert,

			fragmentShader: ShaderChunk.meshline_frag,
		})

		Object.defineProperties(this, {
			lineWidth: {
				enumerable: true,
				get: () => {
					return this.uniforms.lineWidth.value
				},
				set: value => {
					this.uniforms.lineWidth.value = value
				},
			},
			map: {
				enumerable: true,
				get: () => {
					return this.uniforms.map.value
				},
				set: value => {
					this.uniforms.map.value = value
				},
			},
			useMap: {
				enumerable: true,
				get: () => {
					return this.uniforms.useMap.value
				},
				set: value => {
					this.uniforms.useMap.value = value
				},
			},
			alphaMap: {
				enumerable: true,
				get: () => {
					return this.uniforms.alphaMap.value
				},
				set: value => {
					this.uniforms.alphaMap.value = value
				},
			},
			useAlphaMap: {
				enumerable: true,
				get: () => {
					return this.uniforms.useAlphaMap.value
				},
				set: value => {
					this.uniforms.useAlphaMap.value = value
				},
			},
			color: {
				enumerable: true,
				get: () => {
					return this.uniforms.color.value
				},
				set: value => {
					this.uniforms.color.value = value
				},
			},
			opacity: {
				enumerable: true,
				get: () => {
					return this.uniforms.opacity.value
				},
				set: value => {
					this.uniforms.opacity.value = value
				},
			},
			resolution: {
				enumerable: true,
				get: () => {
					return this.uniforms.resolution.value
				},
				set: value => {
					this.uniforms.resolution.value.copy(value)
				},
			},
			sizeAttenuation: {
				enumerable: true,
				get: () => {
					return this.uniforms.sizeAttenuation.value
				},
				set: value => {
					this.uniforms.sizeAttenuation.value = value
				},
			},
			dashArray: {
				enumerable: true,
				get: () => {
					return this.uniforms.dashArray.value
				},
				set: value => {
					this.uniforms.dashArray.value = value
					this.useDash = value !== 0 ? true : false
				},
			},
			dashOffset: {
				enumerable: true,
				get: () => {
					return this.uniforms.dashOffset.value
				},
				set: value => {
					this.uniforms.dashOffset.value = value
				},
			},
			dashRatio: {
				enumerable: true,
				get: () => {
					return this.uniforms.dashRatio.value
				},
				set: value => {
					this.uniforms.dashRatio.value = value
				},
			},
			useDash: {
				enumerable: true,
				get: () => {
					return this.uniforms.useDash.value
				},
				set: value => {
					this.uniforms.useDash.value = value
				},
			},
			visibility: {
				enumerable: true,
				get: () => {
					return this.uniforms.visibility.value
				},
				set: value => {
					this.uniforms.visibility.value = value
				},
			},
			alphaTest: {
				enumerable: true,
				get: () => {
					return this.uniforms.alphaTest.value
				},
				set: value => {
					this.uniforms.alphaTest.value = value
				},
			},
			repeat: {
				enumerable: true,
				get: () => {
					return this.uniforms.repeat.value
				},
				set: value => {
					this.uniforms.repeat.value.copy(value)
				},
			},
		})

		this.setValues(parameters)
	}

	override copy(source: MeshLineMaterial) {
		super.copy(this)

		this.lineWidth = source.lineWidth
		this.map = source.map
		this.useMap = source.useMap
		this.alphaMap = source.alphaMap
		this.useAlphaMap = source.useAlphaMap
		this.color.copy(source.color)
		this.opacity = source.opacity
		this.resolution.copy(source.resolution)
		this.sizeAttenuation = source.sizeAttenuation
		this.dashArray = source.dashArray
		this.dashOffset = source.dashOffset
		this.dashRatio = source.dashRatio
		this.useDash = source.useDash
		this.visibility = source.visibility
		this.alphaTest = source.alphaTest
		this.repeat.copy(source.repeat)

		return this
	}
}

export interface MeshLineMaterial {
	lineWidth: number
	map: Texture
	useMap: boolean
	alphaMap: Texture
	useAlphaMap: boolean
	color: Color
	opacity: number
	resolution: Vector2
	sizeAttenuation: boolean
	dashArray: number
	dashOffset: number
	dashRatio: number
	useDash: boolean
	visibility: number
	alphaTest: number
	repeat: Vector2
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

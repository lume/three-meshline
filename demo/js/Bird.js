import * as THREE from 'three'

export class Bird extends THREE.BufferGeometry {
	constructor() {
		super()

		// prettier-ignore
		const points = [
            5, 0, 0,
            -5, -2, 1,
            -5, 0, 0,
            -5, -2, -1,

            0, 2, -6,
            0, 2, 6,
            2, 0, 0,
            -3, 0, 0,
        ]

		const positions = new THREE.Float32BufferAttribute(Float32Array.from(points), 3)
		this.setAttribute('position', positions)
	}
}

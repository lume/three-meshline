# `@lume/three-meshline`

Provides a Mesh-based replacement for `THREE.Line` from
[Three.js](http://threejs.org), allowing line thicknesses of any size
(`THREE.Line` is limited to 1 pixel width), and other features.

> **Note** This is forked from
> [`three.meshline`](https://github.com/lume/three-meshline), as that project has
> been dormant. The version of this starts at 2.0 because it modernizes the code
> base in ways that make it a breaking change, and removes deprecated features.

Instead of using GL_LINE, it uses a strip of triangles billboarded. Some examples:

# Demos

<table>
    <tr>
      <td align="center">
        <a href="https://docs.lume.io/three-meshline/demo/"><img width="100%" src="screenshots/demo.jpg" alt="Demo"/></a><br />
        <a href="https://docs.lume.io/three-meshline/demo">Play</a>: play with the different mesh line options
      </td>
      <td align="center">
        <a href="https://docs.lume.io/three-meshline/demo/graph.html"><img width="100%" src="screenshots/graph.jpg" alt="Graph"/></a><br />
        <a href="https://docs.lume.io/three-meshline/demo/graph.html">Graph</a>: example of using `MeshLine` to plot graphs
      </td>
      <td align="center">
        <a href="https://docs.lume.io/three-meshline/demo/spinner.html"><img width="100%" src="screenshots/spinner.jpg" alt="Spinner"/></a><br />
        <a href="https://docs.lume.io/three-meshline/demo/spinner.html">Spinner</a>: example of dynamic `MeshLine` with texture
      </td>
    </tr>
    <tr>
      <td align="center">
        <a href="https://docs.lume.io/three-meshline/demo/svg.html"><img width="100%" src="screenshots/svg.jpg" alt="SVG"/></a><br />
        <a href="https://docs.lume.io/three-meshline/demo/svg.html">SVG</a>: example of `MeshLine` rendering SVG Paths
      </td>
      <td align="center">
        <a href="https://docs.lume.io/three-meshline/demo/shape.html"><img width="100%" src="screenshots/shape.jpg" alt="Shape"/></a><br />
        <a href="https://docs.lume.io/three-meshline/demo/shape.html">Shape</a>: example of `MeshLine` created from an OBJ file
      </td>
      <td align="center">
        <a href="https://docs.lume.io/three-meshline/demo/birds.html"><img width="100%" src="screenshots/birds.jpg" alt="Birds"/></a><br />
        <a href="https://docs.lume.io/three-meshline/demo/birds.html">Birds</a>: example of `MeshLine.advance()` by @caramelcode (Jared Sprague) and @mwcz (Michael Clayton)
      </td>
    </tr>
</table>

# How to use

- Include script
- Create an array of 3D coordinates
- Create a `MeshLineGeometry` and assign the points
- Create a `MeshLineMaterial` to style the line points
- Create a `MeshLine` rendering object given the `MeshLineGeometry` and `MeshLineMaterial`

## Install

### With self-hosted dependencies installed locally:

First install `@lume/three-meshline`:

```
npm i @lume/three-meshline
```

Add the importmap to your HTML if you are using native [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) (if you have a build step handling your modules, you'd skip this):

```html
<script src="/node_modules/@lume/three-meshline/importmap.js"></script>
```

If your browser doesn't support
[importmaps](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap)
natively yet, you can load an importmap polyfill then embed the
importmap manually in your HTML like so:

```html
<script defer src="https://ga.jspm.io/npm:es-module-shims@1.6.3/dist/es-module-shims.js"></script>
<script src="/node_modules/@lume/three-meshline/importmap.js"></script>
```

Finally import APIs into your JavaScript code:

```js
import {MeshLine, MeshLineGeometry, MeshLineMaterial} from '@lume/three-meshline'
```

<!--
### _Without_ self-hosted dependencies, f.e. from CDN:

Alternatively, use an importmap from CDN
F.e.
```html
<script src="https://unpkg.com/@lume/three-meshline/importmap.js"></script>
```
-->

### Create an array of 3D coordinates

First, create the list of numbers that will define the 3D points for the line.

```js
const points = []
for (let j = 0; j < Math.PI; j += (2 * Math.PI) / 100) {
	points.push(Math.cos(j), Math.sin(j), 0)
}
```

### Create a `MeshLineGeometry` and assign the points

Once you have that, you can create a new `MeshLineGeometry`, and call
`.setPoints()` passing the list of points.

```js
const geometry = new MeshLineGeometry()
geometry.setPoints(points)
```

Note: `.setPoints` accepts a second parameter, which is a function to define the
width in each point along the line. By default that value is 1, making the line
width 1 \* lineWidth in the material.

```js
// p is a decimal percentage of the number of points
// ie. point 200 of 250 points, p = 0.8
geometry.setPoints(points, p => 2) // makes width 2 * lineWidth
geometry.setPoints(points, p => 1 - p) // makes width taper from the beginning
geometry.setPoints(points, p => 1 - (1 - p)) // makes width taper from the end
geometry.setPoints(points, p => 2 + Math.sin(50 * p)) // makes width sinusoidal
```

### Create a `MeshLineMaterial`

A `MeshLine` needs a `MeshLineMaterial`:

```js
const material = new MeshLineMaterial(options)
```

By default it's a white material with line width 1 unit.

`MeshLineMaterial` accepts `options` to control the appereance of the `MeshLine`:

- `resolution` - `THREE.Vector2` specifying the canvas size (REQUIRED) (default:
  `new Vector2(1, 1)`)
- `map` - a `THREE.Texture` to paint along the line (requires `useMap` set to
  true) (default: `null`)
- `useMap` - tells the material to use `map` (`false` - solid color, `true` use
  texture) (default `false`)
- `alphaMap` - a `THREE.Texture` to use as alpha along the line (requires
  `useAlphaMap` set to true) (default: 'null')
- `useAlphaMap` - tells the material to use `alphaMap` (`false` - no alpha,
  `true` alpha from texture) (default: `false`)
- `repeat` - `THREE.Vector2` to define the texture tiling (applies to `map` and
  `alphaMap`) (default: `new Vector2(1, 1)`)
- `color` - `THREE.Color` to paint the line width, or tint the texture with
  (default: `new Color('white')`)
- `opacity` - alpha value from `0` to `1` (requires `transparent` set to `true`)
  (default: `1`)
- `alphaTest` - cutoff value from `0` to `1` (default: `0`)
- `dashArray` - the length and space between dashes. (`0` - no dash) (default: `0`)
- `dashOffset` - defines the location where the dash will begin. Ideal to
  animate the line. (default: `0`)
- `dashRatio` - defines the ratio between that is visible or not (`0` - more
  visible, `1` - more invisible) (default: `0.5`)
- `useDash` - whether to use dashes or not. Setting `dashArray` to a
  non-zero value automatically sets this to `true`. (`false` - no dashes, `true`
  - dashes) (default: `true`)
- `sizeAttenuation` - makes the line width constant regardless distance (1 unit
  is 1px on screen) (`false` - attenuate, `true` - don't attenuate) (default: `true`)
- `lineWidth` - width of the line (if `sizeAttenuation` is `true`, the value is
  in world units; othwerwise it is in screen pixels) (default: `1`)
- `visibility` - A number from `0` to `1` denoting the portion of the line that
  is visible, starting from the end (`0.5` means half of the line is visible, `0`
  means the whole line is invisible) (default: `1`)

If you're rendering transparent lines or using a texture with alpha map, you may
consider setting `depthTest` to `false`, `transparent` to `true` and `blending`
to an appropriate blending mode, or use `alphaTest`.

### Use `MeshLineGeometry` and `MeshLineMaterial` to create a `MeshLine`

Finally, we create a mesh and add it to the scene:

```js
const line = new MeshLine(geometry, material)
scene.add(line)
```

Note that `MeshLine` extends from `THREE.Mesh` and adds raycast support:

```js
const raycaster = new THREE.Raycaster()
// Use raycaster as usual:
raycaster.intersectObject(line)
```

# Declarative use

## react-three-fiber

`MeshLine` can be used declaritively. This is how it would look like in
[react-three-fiber](https://github.com/drcmda/react-three-fiber). You can try it
live
[here](https://codesandbox.io/s/react-three-fiber-three.meshline-example-vl221).

<p align="center">
	<a href="https://codesandbox.io/s/react-three-fiber-threejs-meshline-example-vl221"><img width="49%" src="https://imgur.com/mZikTAH.gif" alt="react-three-fiber confetti" /></a>
	<a href="https://codesandbox.io/s/threejs-meshline-custom-spring-3-ypkxx"><img width="49%" src="https://imgur.com/g8ts0vJ.gif" alt="react-three-fiber sine wave" /></a>
</p>

```jsx
import {extend, Canvas} from 'react-three-fiber'
import {MeshLine, MeshLineMaterial, MeshLineRaycast} from '@lume/three-meshline'

extend({MeshLine, MeshLineGeometry, MeshLineMaterial})

function Line({points, width, color}) {
	return (
		<Canvas>
			<meshLine>
				<meshLineGeometry attach="geometry" points={points} />
				<meshLineMaterial
					attach="material"
					transparent
					depthTest={false}
					lineWidth={width}
					color={color}
					dashArray={0.05}
					dashRatio={0.95}
				/>
			</meshLine>
		</Canvas>
	)
}
```

Dynamic line widths can be set along each point using the `widthCallback` prop.

```jsx
<meshLineGeometry attach="geometry" points={points} widthCallback={pointWidth => pointWidth * Math.random()} />
```

# TODO

- Better miters
- Faster setPoints() method
- Size attenuation when using OrthographicCamera
- Support for vertex colors (`geometry.vertexColors`)
- global script for people still using global script tags for a global THREE variable

# Support

Tested successfully on

- Chrome OSX, Windows, Android
- Firefox OSX, Windows, Anroid
- Safari OSX, iOS

# References

- [Drawing lines is hard](http://mattdesl.svbtle.com/drawing-lines-is-hard)
- [WebGL rendering of solid trails](http://codeflow.org/entries/2012/aug/05/webgl-rendering-of-solid-trails/)
- [Drawing Antialiased Lines with OpenGL](https://www.mapbox.com/blog/drawing-antialiased-lines/)

# License

MIT licensed

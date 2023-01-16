;(function () {
	let a = undefined

	function loadImportmap() {
		const src = document.currentScript.getAttribute('src')
		const srcUrl = resolveUrl(src)
		const srcFolderParts = srcUrl.split('/')
		srcFolderParts.pop()
		const srcFolder = srcFolderParts.join('/')
		const map = document.currentScript.getAttribute('map') || srcFolder + '/importmap.html'

		const r = new XMLHttpRequest()
		r.open('GET', map, /*synchronous!*/ false)
		r.send()
		document.write(r.responseText)
	}

	function resolveUrl(string) {
		if (!a) a = document.createElement('a')
		a.href = string
		return a.href
	}

	loadImportmap()
})()

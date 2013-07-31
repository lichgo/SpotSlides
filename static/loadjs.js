//Dynamically load js files, taking an array.
function loadJS(fileList) {
	var i = 0,
		doc = document,
		h = doc.getElementsByTagName('head')[0];
	
	l(i);

	function l(i) {
		var js = doc.createElement('script');
		js.type = 'text/javascript';

		var re = function() {
			i < fileList.length - 1 ? l(i + 1) : console.log('All scripts loaded.');
		}

		if (js.readyState) {
			js.onreadystatechange = function() {
				if (js.readyState == 'loaded' || js.readyState == 'complete') {
					js.onreadystatechange = null;
					re();
				}
			}
		} else {
			js.onload = re;
		}

		js.src = fileList[i];
		h.appendChild(js);
	}
}

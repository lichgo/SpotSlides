//For registering functions to be invoked once the dom is ready.
function init(handler) {
	if (init.done) 	//make sure the new handler is after the previsouly registered handlers.
		handler(); 
	else {
		init.handlers.push(handler);
		if (!init.timer && !init.ready) init.timer = setInterval(domReady, 5);
	}

	function domReady() {
		if (init.doc && init.doc.getElementById && init.doc.getElementsByTagName && init.doc.body) {
			init.ready = true;
			init.timer = null;
			for (var i = 0, len = init.handlers.length; i < len; i++) (init.handlers.shift())();
			init.done = true;
		}
	}
}
init.handlers = [];
init.doc = document;
init.done = init.ready = false;
init.timer = null;

//Eventable elements
function E(ele, dragable) {
	if (!ele) return;
	if (dragable === undefined) dragable = false;
	if (ele.EWinstance) return ele.EWinstance;	//To avoid duplicate instance on one element
	return new EventWrapper(ele, dragable);
}
function EventWrapper(ele, dragable) {
	if (dragable === undefined) dragable = false;
	ele['ondrag'] = null;
	ele['ondrop'] = null;
	this.ele = ele;
	this.ele.events = {};
	this.ele.EWinstance = this;
	//define ondrag and ondrop
	if (dragable) {
		this.add('mousedown', function(e, ele) {
			ele.oldMouPos = getMousePos(e);
			ele.oldElePos = {
				'x': pageX(ele),
				'y': pageY(ele)
			};
			document.onmousemove = function(e) {
				ele['ondrag'](e, 'drag');
			};
			document.addEventListener('mouseup', function(e) {
				document.onmousemove = null;
				ele['ondrop'](e, 'drop');
			})
		});
	}
}
EventWrapper.prototype = {
	'add': function(type, c) {
		if (this.ele['on' + type] === undefined) return;
		if (!c.$id) c.$id = ++EventWrapper.numHandlers;
		if (!this.ele.events[type]) {
			this.ele.events[type] = {};
			this.ele.events[type][0] = this.ele['on' + type];
		}
		this.ele.events[type][c.$id] = c;
		this.ele['on' + type] = function(e, type) {
			var e = e || window.event,
				handlers = this.events[type || e.type],
				returnValue = true;

			for (var k in handlers) {
				if (handlers[k] === null) continue;
				if(!handlers[k](e, this)) returnValue = false;
			}

			return returnValue;
		};
		return this;
	},
	'empty': function(type) {
		this.ele.events[type] = {};
		this.ele['on' + type] = null;

		return this;
	}
}
EventWrapper.numHandlers = 0;
//fixIE
if (window.event) {
	window.event.preventDefault = function() { window.event.returnValue = false; }
	window.event.stopPropagation = function() { window.event.cancelBubble = true; }
}

//Get dom elements by id or tag name
function getEle(con, context) {
	if (!con) return null;
	return con.indexOf('#') == 0 ? document.getElementById(con.slice(1)) : (context || document).getElementsByTagName(con);
}

function creEle(tag) {
	return document.createElement(tag);
}

function getMousePos(e) {
	e = e || window.event
	return {
		'x': e.pageX || e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
		'y': e.pageY || e.clientY + document.body.scrollTop + document.documentElement.scrollTop
	}
}

function pageX(ele) {
	return ele.offsetParent ? ele.offsetLeft + pageX(ele.offsetParent) : ele.offsetLeft;
}

function pageY(ele) {
	return ele.offsetParent ? ele.offsetTop + pageY(ele.offsetParent) : ele.offsetTop;
}

function importStyle(ele, obj) {
	for (var key in obj) {
		if (ele.style[key] !== undefined) {	//in case ele.style[key] is null here, use !==
			ele.style[key] = obj[key];
		}
	}
}

function addClass(ele, cName) {
	if (hasClass(ele, cName)) return;
	ele.className += ' ' + cName;
}
function removeClass(ele, cName) {
	var re = new RegExp('(\\s|^)' + cName + '(\\s|$)');
	ele.className = ele.className.replace(re, '');
}
function hasClass(ele, cName) {
	var re = new RegExp('(\\s|^)' + cName + '(\\s|$)');
	return ele.className.match(re);
}

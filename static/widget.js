//Widget
function Widget(type) {
	this.type = type || '';
}
Widget.prototype = {
	getType: function() {
		return this.type;
	},
	construct: function(id, style, content) {
		if (!id) throw new Error('Parameter error: id is needed.');
		this.id = id;
		this.style = style;
		this.ele = this.create(content);
	},
	create: function(content) {
		var ele = creEle('div');
		ele.id = this.id;
		importStyle(ele, this.style);
		ele.innerHTML = content;
		ele.oldClassName = ele.className = 'widget';
		E(ele, true)
			.add('mouseover', function(e) { addClass(ele, 'hover'); })
			.add('mouseout', function(e) { removeClass(ele, 'hover'); })
			.add('drag', function(e) {
				var newMouPos = getMousePos(e),	//faster than the element, so there is difference between pos of ele and pos of mouse
					newElePos = {
						'x': pageX(ele),
						'y': pageY(ele)
					}
				importStyle(ele, {
					'left': parseInt(ele.style.left) + (newMouPos.x - newElePos.x) - (ele.oldMouPos.x - ele.oldElePos.x)  + 'px',
					'top': parseInt(ele.style.top) + (newMouPos.y - newElePos.y) - (ele.oldMouPos.y - ele.oldElePos.y) + 'px'
				});
			})
			.add('drop', function(e) {
				console.log('droping');
			});
		this.slide.appendChild(ele);
		return ele;
	},
	slide: getEle('#main')
}

//Text Widget
function wText(id, style, content) { this.construct(id, style, content); }
wText.prototype = new Widget('text');
wText.constructor = wText;

//Image Widget
function wImage(id, style, content) { this.construct(id, style, '<img src="/images/Orange.gif" />'); }
wImage.prototype = new Widget('image');
wImage.constructor = wImage;

//Video Widget
function wVideo(id, style, content) { this.construct(id, style, '<iframe width="210" height="137" src="http://www.youtube.com/embed/rWlHtvZHbZ8" frameborder="0" allowfullscreen></iframe>')}
wVideo.prototype = new Widget('video');
wVideo.constructor = wVideo;

//Widget list
Widget.widgets = {
	'text': wText,
	'image': wImage,
	'video': wVideo
};

Widget.create = function(type, id, style, content) {
	if (!type || !id) return;
	if (Widget.widgets[type]) return new Widget.widgets[type](id, style, content);
}
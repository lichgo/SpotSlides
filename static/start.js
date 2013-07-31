init(function() {
	var doc = window.document,
		slide = getEle('#main'),
		btnWidgets = getEle('#btnWidgets'),
		bfw = getEle('li', btnWidgets);
		activeBtn = null,
		widgetType = {
			'text': 'text',
			'image': 'image',
			'video': 'video'
		},
		widgetsList = {
			'text': [],
			'image': [],
			'video': []
		},
		btnControls = getEle('#btnControls'),
		btnNew = getEle('#new'),
		btnSave = getEle('#save'),
		btnPlay = getEle('#play'),
		slidesList = [],
		currentSlide = 0,
		pageDataSaved = false;

	slide.style.background = '#303030';
	slidesList['slide0'] = {
		'isSaved': false,
		'data': null
	};

	//control panel
	E(btnNew).add('click', function(e, ele) {
		//if data is unsaved, remind saving before creation
		if (!pageDataSaved) save(slide.innerHTML);
		slide.innerHTML = '';
		slide.style.background = '#303030';
		slidesList['slide' + (++currentSlide)] = {
			'isSaved': false,
			'data': null
		}
		pageDataSaved = false;
	});

	E(btnSave).add('click', function(e, ele) {
		save(slide.innerHTML);
		pageDataSaved = true;
	});

	function save(data) {
		slidesList['slide' + currentSlide].data = data;
	}

	//dashboard
	for (var k = 0, len = bfw.length; k < len; k++) {
		E(bfw[k]).add('click', function(e, ele) {
			activeBtn = ele.id;
			addClass(ele, 'active');

			//As document is parent of ele (Otherwise, the document will be clicked as the addEventListener works rightaway)
			e.stopPropagation();

			E(doc).add('click', function(e, d) {
				removeClass(ele, 'active');
				E(d).empty('click');
			});

			E(slide).add('click', function(e, ele) {
				var mouPos = getMousePos(e),
					elePos = { 'x':pageX(ele), 'y':pageY(ele) };

				widgetsList[activeBtn].push(
					Widget.create(widgetType[activeBtn], activeBtn + (widgetsList[activeBtn].length + 1), { 'left':((mouPos.x - elePos.x) + 'px'), 'top':((mouPos.y - elePos.y) + 'px') }, 'input here...')
				);
				E(ele).empty('click');
			})
		});
	};
});
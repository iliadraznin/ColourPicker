$(function() {
	var _win = $(window),
		_cp = $('#colourPicker'),
		_gb = _cp.find('.gradient-bar'),
		_gp = _cp.find('.gradient-pointer'),
		_hb = _cp.find('.hue-bar'),
		_hp = _hb.find('.hue-pointer'),

		isDrag = false,
		gbOffset = _gb.offset(),
		hbOffset = _hb.offset(),

		fHex = _cp.find('.pick-hex'),
		fRed = _cp.find('.pick-red'),
		fGreen = _cp.find('.pick-green'),
		fBlue = _cp.find('.pick-blue'),
		fHue = _cp.find('.pick-hue'),
		fSat = _cp.find('.pick-saturation'),
		fLight = _cp.find('.pick-brightness');

	_gb.on('mousedown mousemove mouseup mouseleave', function(e) {
		var x = e.pageX - gbOffset.left,
			y = e.pageY - gbOffset.top;

		switch (e.type) {
			case 'mousedown':
				if (!isDrag) {
					_gp.css({ left:x, top:y });
					isDrag = true;
				}
				break;

			case 'mouseup':
			case 'mouseleave':
				if (isDrag) {
					isDrag = false;
				}

			case 'mousemove':
				if (isDrag) {
					_gp.css({ left:x, top:y });
				}
				break;
		}
	});

	_hb.on('mousedown mousemove mouseup mouseleave', function(e) {
		var y = e.pageY - hbOffset.top;

		switch (e.type) {
			case 'mousedown':
				if (!isDrag) {
					_hp.css({ top:y });
					isDrag = true;
				}
				break;

			case 'mouseup':
				if (isDrag) {
					updateHue(y);
					isDrag = false;
				}

			case 'mousemove':
				if (isDrag) {
					updateHue(y);
					_hp.css({ top:y });
				}
				break;
		}
	});

	function updateHue(rawY) {
		var hue = (255 - rawY)/255.0*359 | 0;
		if (hue > 359) 	hue = 359;
		if (hue < 0)	hue = 0;
		fHue[0].value = hue;

		_gb.css('background-color', '#' + hsl2hex(hue, 100, 100));
	}
});
$(function() {
	var _win = $(window),
		_cp = $('#colourPicker'),
		_gb = _cp.find('.gradient-bar'),
		_gp = _cp.find('.gradient-pointer'),
		_hb = _cp.find('.hue-bar'),
		_hp = _hb.find('.hue-pointer'),

		gradientDrag = false,
		hueDrag 	 = false,
		gbOffset 	 = _gb.offset(),
		hbOffset 	 = _hb.offset(),

		fHex   = _cp.find('.pick-hex'),
		fRed   = _cp.find('.pick-red'),
		fGreen = _cp.find('.pick-green'),
		fBlue  = _cp.find('.pick-blue'),
		fHue   = _cp.find('.pick-hue'),
		fSat   = _cp.find('.pick-saturation'),
		fVal   = _cp.find('.pick-brightness'),

		selColor = _cp.find('.sel-color'),
		newColor = _cp.find('.new-color'),
		oldColor = _cp.find('.old-color'),
		selColLabel = _cp.find('.sel-col-label'),
		oldColLabel = _cp.find('.old-col-label');


	_win.on('mousedown mousemove mouseup', function(e) {
		if (e.type == 'mousedown') {
			if (e.target.className == 'gradient-bar') {
				gradientDrag = true;
				hueDrag = false;
				_gp.css({ left:e.pageX - gbOffset.left, top:e.pageY - gbOffset.top });
			}
			else if (e.target.className == 'hue-bar') {
				hueDrag = true;
				gradientDrag = false;
				_hp.css('top', e.pageY - hbOffset.top);
			}
		}
		else if (gradientDrag || hueDrag) {
			var x = e.pageX, y = e.pageY;

			if (gradientDrag) {
				x -= gbOffset.left;
				y -= gbOffset.top;
				x = x < 0 ? 0 : (x > 256 ? 256 : x);
				y = y < 0 ? 0 : (y > 256 ? 256 : y);

				_gp.css({ left:x, top:y });

				fSat[0].value = x/256.0*100 | 0;
				fVal[0].value = (256 - y)/256.0*100 | 0;
			}
			else if (hueDrag) {
				y -= hbOffset.top;
				y = y < 0 ? 0 : (y > 256 ? 256 : y);

				_hp.css('top', y);

				fHue[0].value = (256 - y)/256.0*359 | 0;
				_gb.css('background-color', hsvToCSS(fHue[0].value, 100, 100));
			}

			applyHSVchanges(fHue[0].value, fSat[0].value, fVal[0].value);

			if (e.type == 'mouseup') {
				gradientDrag = hueDrag = false;
				selColor.css('background', '#' + fHex[0].value);
				selColLabel.text('#' + fHex[0].value);
			}
		}
	});

	_cp.on('change', '.colorin', function(e) {
		var t = e.target,
			c = t.className,
			v = t.value == '' || isNaN(t.value) ? 0 : t.value;
		
		switch (c) {
			case 'colorin pick-hue':
				v = v < 0 ? 0 : (v > 359 ? 359 : v);
				t.value = v;
				_hp.css('top', 256 - (v/359.0*256 | 0));
				_gb.css('background-color', hsvToCSS(fHue[0].value, 100, 100));
				break;

			case 'colorin pick-saturation':
				v = v < 0 ? 0 : (v > 100 ? 100 : v);
				t.value = v;
				_gp.css('left', v/100.0*256 | 0);
				break;

			case 'colorin pick-brightness':
				v = v < 0 ? 0 : (v > 100 ? 100 : v);
				t.value = v;
				_gp.css('top', 256 - (v/100.0*256 | 0));
				break;

			case 'colorin pick-red':
			case 'colorin pick-green':
			case 'colorin pick-blue':
				v = v < 0 ? 0 : (v > 255 ? 255 : v);
				t.value = v;

				fHex[0].value = rgb2hex(fRed[0].value, fGreen[0].value, fBlue[0].value);

				var hsv = rgb2hsv(fRed[0].value, fGreen[0].value, fBlue[0].value);
				fHue[0].value = hsv.hue;
				fSat[0].value = hsv.saturation;
				fVal[0].value = hsv.value;

				_hp.css('top', 256 - (hsv.hue/359.0*256 | 0));
				_gb.css('background-color', hsvToCSS(hsv.hue, 100, 100));
				_gp.css('left', hsv.saturation/100.0*256 | 0);
				_gp.css('top', 256 - (hsv.value/100.0*256 | 0));

				newColor.css('background', '#' + fHex[0].value);

				break;

			case 'colorin pick-hex':
				var rgb = hex2rgb(t.value);
				if (rgb == false) { t.value = '000000'; break; }

				fRed[0].value = rgb.red;
				fGreen[0].value = rgb.green;
				fBlue[0].value = rgb.blue;

				var hsv = rgb2hsv(rgb.red, rgb.green, rgb.blue);
				fHue[0].value = hsv.hue;
				fSat[0].value = hsv.saturation;
				fVal[0].value = hsv.value;

				_hp.css('top', 256 - (hsv.hue/359.0*256 | 0));
				_gb.css('background-color', hsvToCSS(hsv.hue, 100, 100));
				_gp.css('left', hsv.saturation/100.0*256 | 0);
				_gp.css('top', 256 - (hsv.value/100.0*256 | 0));

				newColor.css('background', '#' + t.value);

				break;
		}

		if (c=='colorin pick-hue' || c=='colorin pick-saturation' || c=='colorin pick-brightness') {
			applyHSVchanges(fHue[0].value, fSat[0].value, fVal[0].value);
		}
	});

	_cp.on('keydown', '.colorin', function(e) {
		var key = e.which,
			isUtilKey, validKey;
		
		isUtilKey = 
			key == 8 ||					// backspace
			key == 9 ||					// tab
			key == 13 ||				// enter
			key == 46 ||				// delete
			(key >= 37 && key <= 40);	// arrows

		console.log(key);

		switch (e.target.className) {
			case 'colorin pick-hue':
			case 'colorin pick-saturation':
			case 'colorin pick-brightness':
			case 'colorin pick-red':
			case 'colorin pick-green':
			case 'colorin pick-blue':
				validKey = (key >= 48 && key <= 57) || isUtilKey;
				if (!validKey /*|| e.target.value.length >= 3*/) e.preventDefault();

				// browser doesn't support input type number $(this)[0].type == 'text'
				// and hitting arrows up or down increment the number outselves
				if ($(this)[0].type == 'text' && (key == 38 || key == 40)) {
					e.preventDefault();
					// convert value to int and get max and min values
					var that 	= $(this),
						valInt 	= +that.val(),
						max 	= +that.attr('max'),
						min 	= +that.attr('min');

					// up
					if (key == 38 && valInt < max) {
						that.val(valInt + 1).change();
					}
					// down
					else if (key == 40 && valInt > min) {
						that.val(valInt - 1).change();
					}
				}

				break;

			case 'colorin pick-hex':
				validKey = (key >= 48 && key <= 57) || (key >= 65 && key <= 70) || isUtilKey;
				if (!validKey) e.preventDefault();
				break;
		}
	});

	function applyHSVchanges(h, s, v) {
		var rgb = hsv2rgb(h, s, v);
		fRed[0].value = rgb.red;
		fGreen[0].value = rgb.green;
		fBlue[0].value = rgb.blue;
		fHex[0].value = rgb2hex(rgb.red, rgb.green, rgb.blue);
		newColor.css('background', '#' + fHex[0].value);
	}

	_cp.on('click', '.colors-wrap', function(e) {
		var hex;
		switch (e.target.className) {
			case 'sel-color':
			case 'sel-col-label':
				hex = selColLabel.text().substr(1);
				break;

			case 'old-color':
			case 'old-col-color':
				hex = oldColLabel.text().substr(1);
				break;
		}
		
		fHex[0].value = hex;
		fHex.change();
	});
});
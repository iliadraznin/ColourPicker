(function($) {
	$.fn.colourPicker = function(options) {
		// setup defaults
		var settings = $.extend({
			ignoreNative: true
		}, options),

		// quick check for native support of color input
		_native = $('<input type="color"/>')[0].type == 'color',

		// setup variable for the relevant inputs
		_inputs;

		if (_native && !settings.ignoreNative) {
			console.info('Using native color input');
			return;
		}

		// make sure we're dealing w/ input elements
		// or a container (single) w/ input elements
		if (this.length == 1 && this[0].tagName.toLowerCase() != 'input') {
			_inputs = this.find('input[type="color"]');
		}
		else {
			_inputs = this.filter('input[type="color"]');
		}

		if (!_inputs.length) {
			console.info('No valid inputs found');
			return;
		}

		// now that we have the valid inputs and we're using colour picker (instead of native)
		// convert any inputs w/ type color to type text and add a class to recognize them
		_inputs.filter('[type="color"]').attr('type', 'text').addClass('color-input');





		// attach the click event that will trigger the colour picker
		// .off() is needed to prevent duplicate event calls
		$('body').off().on('click', 'input.color-input', function(e) {
			console.log( 'asd' );
		});

		// simply return the initially selected object(s)
		return this;
	};

	// build the HTML for the color picker
	buildColourPicker = function() {
		var _cp = $('<div id="colourPicker"></div>'),

			// gradient and hue bars
			_gp = $('<div class="gradient-pointer"></div>'),
			_gb = $('<div class="gradient-bar"></div>').append(_gp),
			_hp = $('<div class="hue-pointer"></div>'),
			_hb = $('<div class="hue-bar"></div>').append(_hp),

			gradientDrag = false,
			hueDrag 	 = false,

			// color inputs
			cf 		= $('<form autocomplete="off" class="clr"></form>'),
			fHex 	= $('<input type="text" class="colorin pick-hex" maxlength="6" tabindex="1">'),
			fRed 	= $('<input type="number" class="colorin pick-red" min="0" max="255" maxlength="3" tabindex="2">'),
			fGreen 	= $('<input type="number" class="colorin pick-green" min="0" max="255" maxlength="3" tabindex="3">'),
			fBlue 	= $('<input type="number" class="colorin pick-blue" min="0" max="255" maxlength="3" tabindex="4">'),
			fHue 	= $('<input type="number" class="colorin pick-hue" min="0" max="359" maxlength="3" tabindex="5">'),
			fSat 	= $('<input type="number" class="colorin pick-saturation" min="0" max="100" maxlength="3" tabindex="6">'),
			fVal 	= $('<input type="number" class="colorin pick-brightness" min="0" max="100" maxlength="3" tabindex="7">'),

			// buttons
			_btnSelect = $('<button type="button" class="cp-btn" id="selectColor">Select</button>'),
			_btnCancel = $('<button type="button" class="cp-btn" id="cancelColor">Cancel</button>'),

			// color boxes
			pc 			= $('<div class="picker-controls"></div>'),
			selColLabel = $('<label class="sel-col-label"></label>'),
			selColor 	= $('<div class="sel-color" title="Selected Color"></div>').append(selColLabel),			
			newColor 	= $('<div class="new-color" title="New Color"></div>'),
			oldColLabel = $('<label class="old-col-label"></label>'),
			oldColor 	= $('<div class="old-color" title="Original Color"></div>').append(oldColLabel);

			// combine the color fields in the color inputs form
			cf.append( $('<label class="hex-wrap">Hex #</label>').append(fHex) )
				.append( $('<label>Red</label>').append(fRed) )
				.append( $('<label>Hue</label>').append(fHue).append('&deg;') )
				.append( $('<label>Green</label>').append(fGreen) )
				.append( $('<label>Saturation</label>').append(fSat).append('%') )
				.append( $('<label>Blue</label>').append(fBlue) )
				.append( $('<label>Brightness</label>').append(fVal).append('%') )
				.append( _btnSelect )
				.append( _btnCancel );

			// combine rest of the elements
			_cp.append(_gb)
				.append(_hb)
				.append(
					pc.append( 
						$('<div class="colors-wrap"></div>')
							.append(selColor)
							.append(newColor)
							.append(oldColor) 
					)
					.append(
						$('<div class="color-inputs clr"></div>')
							.append(cf)
					)
				);

		// add the whole widget to the page
		$('body').append(_cp);

		// get the offset positions for hue and gradient bars
		var gbOffset = _gb.offset(),
			hbOffset = _hb.offset();

	//	_cp.hide();

		$(window).on('mousedown mousemove mouseup', function(e) {
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
				//	if (!validKey || e.target.value.length >= 3) e.preventDefault();
					if (!validKey) e.preventDefault();

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

		_cp.on('click', '.cp-btn', function(e) {
			if (e.target.id == 'selectColor') {
				console.log('select');
			}
			else if (e.target.id == 'cancelColor') {
				_cp.hide();
			}
		});

		function open(initColorHex) {
			if (!hex2rgb(initColorHex)) {
				console.error('Invalid HEX color code: ' + initColorHex);
				return;
			}

			fHex.val(initColorHex).change();
		}

		return this;
	}

	(); // buildColorPicker()

})(jQuery);

/*!
 * Colour Picker plugin for jQuery; published under the WTFPL license http://sam.zoy.org/wtfpl/
 *
 * @author Ilia Draznin
 * @created 2013/06/05
 * @version 1.0
 *
 * Description: The Colour Picker emulates and extends the native Photoshop color picker.
 * 
 * Usage:
 * $(selector).colourPicker();
 * "selector" can be either one or more input elements of type color
 * or a container with a number of input[type=color] elements, to which it will apply
 */
/*
;(function( $, window, document, undefined ) {

	// setup the plugin name and the default properties
	var pluginName = "colourPicker",
		defaults = { ignoreNative: true },
		colorSupported = $('<input type="color"/>')[0].type == 'color';

	// plugin constructor
	function Plugin(element, options) {
		this.options = $.extend( {}, defaults, options );

		// if color is supported by browser and ignoreNative is false
		// we can abort construction since the native color input will be used
		if (colorSupported && !this.options.ignoreNative) {
			console.info('Using native color input');
			return;
		}

		var el = $(element);
		// now that plugin is being used we filter out non type color elements
		if (el.attr('type') != 'color') return;

		// finally, before proceeding convert the color element into regular text element
		// and give it a class to identify as color input
		el.attr('type', 'text').addClass('color-input');

		this.element = element;
		this._defaults = defaults;
		this._name = pluginName;

		this.init();
	}

	//  plugin functions
	Plugin.prototype = {
		init: function() {
			var _cp = $('<div id="colourPicker"></div>'),

				// gradient and hue bars
				_gp = $('<div class="gradient-pointer"></div>'),
				_gb = $('<div class="gradient-bar"></div>').append(_gp),
				_hp = $('<div class="hue-pointer"></div>'),
				_hb = $('<div class="hue-bar"></div>').append(_hp),

				gradientDrag = false,
				hueDrag 	 = false,

				// color inputs
				cf 		= $('<form autocomplete="off" class="clr"></form>'),
				fHex 	= $('<input type="text" class="colorin pick-hex" maxlength="6" tabindex="1">'),
				fRed 	= $('<input type="number" class="colorin pick-red" min="0" max="255" maxlength="3" tabindex="2">'),
				fGreen 	= $('<input type="number" class="colorin pick-green" min="0" max="255" maxlength="3" tabindex="3">'),
				fBlue 	= $('<input type="number" class="colorin pick-blue" min="0" max="255" maxlength="3" tabindex="4">'),
				fHue 	= $('<input type="number" class="colorin pick-hue" min="0" max="359" maxlength="3" tabindex="5">'),
				fSat 	= $('<input type="number" class="colorin pick-saturation" min="0" max="100" maxlength="3" tabindex="6">'),
				fVal 	= $('<input type="number" class="colorin pick-brightness" min="0" max="100" maxlength="3" tabindex="7">'),

				// buttons
				_btnSelect = $('<button type="button" class="cp-btn" id="selectColor">Select</button>'),
				_btnCancel = $('<button type="button" class="cp-btn" id="cancelColor">Cancel</button>'),

				// color boxes
				pc 			= $('<div class="picker-controls"></div>'),
				selColLabel = $('<label class="sel-col-label"></label>'),
				selColor 	= $('<div class="sel-color" title="Selected Color"></div>').append(selColLabel),			
				newColor 	= $('<div class="new-color" title="New Color"></div>'),
				oldColLabel = $('<label class="old-col-label"></label>'),
				oldColor 	= $('<div class="old-color" title="Original Color"></div>').append(oldColLabel);

			// combine the color fields in the color inputs form
			cf.append( $('<label class="hex-wrap">Hex #</label>').append(fHex) )
				.append( $('<label>Red</label>').append(fRed) )
				.append( $('<label>Hue</label>').append(fHue).append('&deg;') )
				.append( $('<label>Green</label>').append(fGreen) )
				.append( $('<label>Saturation</label>').append(fSat).append('%') )
				.append( $('<label>Blue</label>').append(fBlue) )
				.append( $('<label>Brightness</label>').append(fVal).append('%') )
				.append( _btnSelect )
				.append( _btnCancel );

			// combine rest of the elements
			_cp.append(_gb)
				.append(_hb)
				.append(
					pc.append( 
						$('<div class="colors-wrap"></div>')
							.append(selColor)
							.append(newColor)
							.append(oldColor) 
					)
					.append(
						$('<div class="color-inputs clr"></div>')
							.append(cf)
					)
				);

			// add the whole widget to the page
			$('body').append(_cp);

			// get the offset positions for hue and gradient bars
			var gbOffset = _gb.offset(),
				hbOffset = _hb.offset();

		//	_cp.hide();
		},

		otherfunction: function(el, options) {

		}
	};

	// wrapper around the plugin constructor
	$.fn[pluginName] = function(options) {
		return this.each(function() {
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" + pluginName, new Plugin(this, options));
			}
		});
	}

})( jQuery, window, document );
*/
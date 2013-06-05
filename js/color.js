/*
 * Color.js - v1.0
 * Description: Color object for creating, manipulating and outputing colors.
 * Author: Ilia Draznin
 * License: WTFPL http://www.wtfpl.net/about/
 */
function Color(r, g, b) {
	// color can be constructed using RGB values or HEX value, but not HSL
	if (typeof r == 'string' && r[0] == '#') {
		// treat r as hex value for color
		this.hex(r);
	}
	else {
		// treat inputs as regular R, G, B values
		this.rgb(r || 0, g || 0, b || 0);
	}
}
Color.prototype = {
	// getters and setters
	rgb: function(r, g, b) {
		if (typeof r == 'undefined' && typeof g == 'undefined' && typeof b == 'undefined') {
			return [this._red*255 | 0, this._green*255 | 0, this._blue*255 | 0];
		}
		else if (!g && !b) {
			this._red = this._green = this._blue = r/255.0;
		}
		else {
			this._red = r/255.0;
			this._green = g/255.0;
			this._blue = b/255.0;
		}
		this.calcHEX();
		this.calcHSL();

		return this;
	},
	red: function(r) {
		if (typeof r == 'undefined') return this._red*255 | 0;
		this._red = r/255.0;
		this.calcHEX();
		this.calcHSL();
	},
	green: function(g) {
		if (typeof g == 'undefined') return this._green*255 | 0;
		this._green = g/255.0;
		this.calcHEX();
		this.calcHSL();
	},
	blue: function(b) {
		if (typeof b == 'undefined') return this._blue*255 | 0;
		this._blue = b/255.0;
		this.calcHEX();
		this.calcHSL();
	},

	hsl: function(h, s, l) {
		if (typeof h == 'undefined' && typeof s == 'undefined' && typeof l == 'undefined') {
			return [this._hue, this._saturation*100 | 0, this._lightness*100 | 0];
		}
		else {
			this._hue = h;
			this._saturation = s/100.0;
			this._lightness = l/100.0;
		}
		this.calcRGBfromHSL();
		this.calcHEX();

		return this;
	},
	hue: function(h) {
		if (typeof h == 'undefined') return this._hue;
		this._hue = h;
		this.calcRGBfromHSL();
		this.calcHEX();
	},
	saturation: function(s) {
		if (typeof s == 'undefined') return this._saturation*100 | 0;
		this._saturation = s/100.0;
		this.calcRGBfromHSL();
		this.calcHEX();
	},
	lightness: function(l) {
		if (typeof l == 'undefined') return this._lightness*100 | 0;
		this._lightness = l/100.0;
		this.calcRGBfromHSL();
		this.calcHEX();
	},

	hex: function(hex) {
		if (typeof hex == 'undefined') return '#' + this._hex;
		this._hex = validHex(hex);
		this.calcRGB();
		this.calcHSL();

		return this;
	},

	// internal calculators
	calcHSL: function() {
		var hsl = rgb2hsl( this._red*255 | 0, this._green*255 | 0, this._blue*255 | 0 );
		this._hue = hsl.hue;
		this._saturation = hsl.saturation/100.0;
		this._lightness = hsl.lightness/100.0;
	},
	calcRGB: function() {
		var rgb = hex2rgb( this._hex );
		this._red = rgb.red/255.0;
		this._green = rgb.green/255.0;
		this._blue = rgb.blue/255.0;
	},
	calcRGBfromHSL: function() {
		var rgb = hsl2rgb( this._hue, this._saturation*100 | 0, this._lightness*100 | 0 );
		this._red = rgb.red/255.0;
		this._green = rgb.green/255.0;
		this._blue = rgb.blue/255.0;
	},
	calcHEX: function() {
		this._hex = rgb2hex( this.red(), this.green(), this.blue() );
	},

	// utility
	complement: function() {
		var newHue = this._hue >= 180 ? this._hue - 180 : this.hue + 180,
			newLight = this._lightness * (this._saturation - 1) + 1,
			newSat = (this._lightness * this._saturation) / newLight,
			color = new Color();

		return color.hsl(newHue, newLight*100, newSat*100);
	}
};

// global color converters
function validHex(h) {
	if (typeof h == 'undefined') return false;

	var hex = h[0] == '#' ? h.substr(1) : h;

	if (hex.length != 6 && hex.length != 3) {
		console.error('Incorrect HEX format: "' + hex + '"');
		return false;
	}
	
	if (hex.length == 3) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	}

	return hex;
}

function hex2rgb(hex) {
	if (!validHex(hex)) return false;

	var r = parseInt(hex[0] + hex[1], 16),
		g = parseInt(hex[2] + hex[3], 16),
		b = parseInt(hex[4] + hex[5], 16);

	if (isNaN(r) || isNaN(g) || isNaN(b)) {
		console.error('Can\'t convert HEX to RGB - #' + hex);
		return false;
	}
	return { red:r, green:g, blue:b };
}

function rgb2hex(r, g, b) {
	var rStr = r.toString(16),
		gStr = g.toString(16),
		bStr = b.toString(16);

	if (rStr.length == 1) rStr = '0' + rStr;
	if (gStr.length == 1) gStr = '0' + gStr;
	if (bStr.length == 1) bStr = '0' + bStr;

	return rStr + gStr + bStr;
}

function rgb2hsl(r, g, b) {
	var h, s, l,
		r = r/255.0, g = g/255.0, b = b/255.0,
		max = Math.max( Math.max(r, g), b),
		min = Math.min( Math.min(r, g), b);

	l = max;
	s = max != 0 ? 1 - min/max : 0;

	h = 0;
	if (min == max) return { hue:h, saturation:s, lightness:l };

	var delta = max - min;
	if (r == max)
		h = (g - b) / delta;

	else if (g == max)
		h = 2 + ((b - r) / delta);

	else
		h = 4 + ((r - g) / delta);

	h *= 60;
	if (h < 0) h += 360;
	h = h | 0;

	return { hue:h, saturation:Math.round(s*100), lightness:Math.round(l*100) };
}

function hsl2rgb(h, s, l) {
	var r, g, b,
		s = s/100.0,
		l = l/100.0;

	r = g = b = l*255 | 0;

	if (l == 0 || s == 0) return { red:r, green:g, blue:b };

	var th = (h / 60),
		i = th | 0,
		f = th - i,
		p = l * (1 - s),
		q = l * (1 - s * f),
		t = l * (1 - s * (1 - f));
	
	switch (i) {
		case 0:
			r = l; g = t; b = p;
			break;

		case 1:
			r = q; g = l; b = p;
			break;

		case 2:
			r = p; g = l; b = t;
			break;

		case 3:
			r = p; g = q; b = l;
			break;

		case 4:
			r = t; g = p; b = l;
			break;

		default:
			r = l; g = p; b = q;
			break;
	}
	return { red:r*255 | 0, green:g*255 | 0, blue:b*255 | 0 };
}

function hex2hsl(hex) {
	var rgb = hex2rgb(hex);
	return rgb2hsl(rgb.red, rgb.green, rgb.blue);
}

function hsl2hex(h, s, l) {
	var rgb = hsl2rgb(h, s, l);
	return rgb2hex(rgb.red, rgb.green, rgb.blue);
}

function rgbToString(r, g, b) {
	var nr, ng, nb;
	if (typeof r == 'object') {
		var keys = Object.keys(r);
		nr = r[keys[0]];
		ng = r[keys[1]];
		nb = r[keys[2]];
	}
	else {
		nr = r; ng = g; nb = b;
	}
	return 'rgba(' + nr + ',' + ng + ',' + nb + ')';
}
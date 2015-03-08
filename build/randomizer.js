require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
(function browserifyShim(module, exports, define, browserify_shim__define__module__export__) {
/**
 * Seedable random number generator functions.
 * @version 1.0.0
 * @license Public Domain
 *
 * @example
 * var rng = new RNG('Example');
 * rng.random(40, 50);  // =>  42
 * rng.uniform();       // =>  0.7972798995050903
 * rng.normal();        // => -0.6698504543216376
 * rng.exponential();   // =>  1.0547367609131555
 * rng.poisson(4);      // =>  2
 * rng.gamma(4);        // =>  2.781724687386858
 */

/**
 * @param {String} seed A string to seed the generator.
 * @constructor
 */
function RC4(seed) {
    this.s = new Array(256);
    this.i = 0;
    this.j = 0;
    for (var i = 0; i < 256; i++) {
        this.s[i] = i;
    }
    if (seed) {
        this.mix(seed);
    }
}

/**
 * Get the underlying bytes of a string.
 * @param {string} string
 * @returns {Array} An array of bytes
 */
RC4.getStringBytes = function(string) {
    var output = [];
    for (var i = 0; i < string.length; i++) {
        var c = string.charCodeAt(i);
        var bytes = [];
        do {
            bytes.push(c & 0xFF);
            c = c >> 8;
        } while (c > 0);
        output = output.concat(bytes.reverse());
    }
    return output;
};

RC4.prototype._swap = function(i, j) {
    var tmp = this.s[i];
    this.s[i] = this.s[j];
    this.s[j] = tmp;
};

/**
 * Mix additional entropy into this generator.
 * @param {String} seed
 */
RC4.prototype.mix = function(seed) {
    var input = RC4.getStringBytes(seed);
    var j = 0;
    for (var i = 0; i < this.s.length; i++) {
        j += this.s[i] + input[i % input.length];
        j %= 256;
        this._swap(i, j);
    }
};

/**
 * @returns {number} The next byte of output from the generator.
 */
RC4.prototype.next = function() {
    this.i = (this.i + 1) % 256;
    this.j = (this.j + this.s[this.i]) % 256;
    this._swap(this.i, this.j);
    return this.s[(this.s[this.i] + this.s[this.j]) % 256];
};

/**
 * Create a new random number generator with optional seed. If the
 * provided seed is a function (i.e. Math.random) it will be used as
 * the uniform number generator.
 * @param seed An arbitrary object used to seed the generator.
 * @constructor
 */
function RNG(seed) {
    if (seed == null) {
        seed = (Math.random() + Date.now()).toString();
    } else if (typeof seed === "function") {
        // Use it as a uniform number generator
        this.uniform = seed;
        this.nextByte = function() {
            return ~~(this.uniform() * 256);
        };
        seed = null;
    } else if (Object.prototype.toString.call(seed) !== "[object String]") {
        seed = JSON.stringify(seed);
    }
    this._normal = null;
    if (seed) {
        this._state = new RC4(seed);
    } else {
        this._state = null;
    }
}

/**
 * @returns {number} Uniform random number between 0 and 255.
 */
RNG.prototype.nextByte = function() {
    return this._state.next();
};

/**
 * @returns {number} Uniform random number between 0 and 1.
 */
RNG.prototype.uniform = function() {
    var BYTES = 7; // 56 bits to make a 53-bit double
    var output = 0;
    for (var i = 0; i < BYTES; i++) {
        output *= 256;
        output += this.nextByte();
    }
    return output / (Math.pow(2, BYTES * 8) - 1);
};

/**
 * Produce a random integer within [n, m).
 * @param {number} [n=0]
 * @param {number} m
 *
 */
RNG.prototype.random = function(n, m) {
    if (n == null) {
        return this.uniform();
    } else if (m == null) {
        m = n;
        n = 0;
    }
    return n + Math.floor(this.uniform() * (m - n));
};

/**
 * Generates numbers using this.uniform() with the Box-Muller transform.
 * @returns {number} Normally-distributed random number of mean 0, variance 1.
 */
RNG.prototype.normal = function() {
    if (this._normal !== null) {
        var n = this._normal;
        this._normal = null;
        return n;
    } else {
        var x = this.uniform() || Math.pow(2, -53); // can't be exactly 0
        var y = this.uniform();
        this._normal = Math.sqrt(-2 * Math.log(x)) * Math.sin(2 * Math.PI * y);
        return Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * y);
    }
};

/**
 * Generates numbers using this.uniform().
 * @returns {number} Number from the exponential distribution, lambda = 1.
 */
RNG.prototype.exponential = function() {
    return -Math.log(this.uniform() || Math.pow(2, -53));
};

/**
 * Generates numbers using this.uniform() and Knuth's method.
 * @param {number} [mean=1]
 * @returns {number} Number from the Poisson distribution.
 */
RNG.prototype.poisson = function(mean) {
    var L = Math.exp(-(mean || 1));
    var k = 0, p = 1;
    do {
        k++;
        p *= this.uniform();
    } while (p > L);
    return k - 1;
};

/**
 * Generates numbers using this.uniform(), this.normal(),
 * this.exponential(), and the Marsaglia-Tsang method.
 * @param {number} a
 * @returns {number} Number from the gamma distribution.
 */
RNG.prototype.gamma = function(a) {
    var d = (a < 1 ? 1 + a : a) - 1 / 3;
    var c = 1 / Math.sqrt(9 * d);
    do {
        do {
            var x = this.normal();
            var v = Math.pow(c * x + 1, 3);
        } while (v <= 0);
        var u = this.uniform();
        var x2 = Math.pow(x, 2);
    } while (u >= 1 - 0.0331 * x2 * x2 &&
             Math.log(u) >= 0.5 * x2 + d * (1 - v + Math.log(v)));
    if (a < 1) {
        return d * v * Math.exp(this.exponential() / -a);
    } else {
        return d * v;
    }
};

/**
 * Accepts a dice rolling notation string and returns a generator
 * function for that distribution. The parser is quite flexible.
 * @param {string} expr A dice-rolling, expression i.e. '2d6+10'.
 * @param {RNG} rng An optional RNG object.
 * @returns {Function}
 */
RNG.roller = function(expr, rng) {
    var parts = expr.split(/(\d+)?d(\d+)([+-]\d+)?/).slice(1);
    var dice = parseFloat(parts[0]) || 1;
    var sides = parseFloat(parts[1]);
    var mod = parseFloat(parts[2]) || 0;
    rng = rng || new RNG();
    return function() {
        var total = dice + mod;
        for (var i = 0; i < dice; i++) {
            total += rng.random(sides);
        }
        return total;
    };
};

/* Provide a pre-made generator instance. */
RNG.$ = new RNG();

; browserify_shim__define__module__export__(typeof RNG != "undefined" ? RNG : window.RNG);

}).call(global, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/Users/larsonj/Sites/radReveal/rad-randomizer/src/randomizer.js":[function(require,module,exports){
/*!
 * rad-randomizer
 * http://joelarson4.github.io/rad-randomizer
 * MIT licensed
 *
 * Copyright (C) 2015 Joe Larson
 */

/** 
 * @overview
 * rad-randomizer is a Reveal.js RadReveal add-on for attaching seeded PRNGs to your slides.
 * Please see [project README](https://github.com/joelarson4/rad-randomizer) for an overview.
 *
 * This is not a true CommonJS module, you cannot `require()` it.  It should be loaded as a Reveal.js dependency.
 *
 *```javascript
 * Reveal.initialize({
 *    ...
 *    dependencies: [
 *        { src: '<some path>/randomizer.min.js', radName: 'randomizer' }
 *    ...
 *```
 *
 * @module randomizer
 */

//Developer note: we are not using jsdox to generate any markdown for this file; the API doesn't really suit it.  
//  JsDoc still provided for developer use

var RadReveal = require('rad-reveal');
var Rng = require('../node_modules/rng-js');

var config;

/** 
 * Runs when RadReveal initializes. 
 *
 * @param {object} config - configuration object set in radConfig
 * @param {array} slides - all the slide objects
 * @private
 */
function initialize(inputConfig, slides) {
    config = inputConfig || {};

    if(config.fillSlides) {
        slides.forEach(function(slide) {
            if(!slide.element.hasAttribute('data-rad-randomizer')) {
                slide.element.setAttribute('data-rad-randomizer', config.fillSlides);
            }
        });
    }
}


/** 
 * Used to get a concat string of heading text.
 *
 * @param {string} tag - if blank, then h1..h6 are used, otherwise it is a tag name.
 * @param {object} slideObj - the RadReveal slide object 
 * @return {string} all the text that matched, joined with a '; ' between each tag's text.
 * @private
 */
function getHeadingText(tag, slideObj) {
    var text = [];
    if(!tag) {
        [1, 2, 3, 4, 5, 6].forEach(function(number) {
            text.push(getHeadingText('h' + number, slideObj));
        });
    } else {
        var tagElements = Array.prototype.slice.apply(slideObj.element.querySelectorAll(tag));
        tagElements.forEach(function(element) {
            text.push((element.textContent || element.innerText));
        });
    }
    return text.join('; ');
}

/** 
 * Runs when RadReveal initializes for each slide with a matching attribute.
 *
 * @param {string} attrVal - value of the attribute
 * @param {object} slideObj - the RadReveal slide object (see RadReveal documentation)
 * @param {object} event - the Reveal.js event
 * @param {string} radEventName - the name of the RadReveal event (see RadReveal documentation)
 * @private
 */
function load(attrVal, slideObj, event, radEventName) {
    var seed;

    //first get the seed value
    if(attrVal === 'HTML') {
        seed = slideObj.element.innerHTML;
    } else if(attrVal === 'HEADINGS') {
        seed = getHeadingText(null, slideObj);
    } else if(typeof attrVal == 'string' && attrVal.length == 2 && attrVal.charAt(0) == 'H') {
        seed = getHeadingText(attrVal, slideObj);
    } else if(attrVal === 'TEXT') {
        seed = (slideObj.element.textContent || slideObj.element.innerText);
    } else if(attrVal === 'RANDOM') {
        seed = Math.random();
    } else if(!isNaN(parseFloat(attrVal))) {
        seed = parseFloat(attrVal);
    } else {
        seed = attrVal;
    }

    //now create and attach the rng
    slideObj.data.randomizer = new Rng(seed);
    slideObj.data.randomizer.seed = seed;
    
    //and attach the getRandomizerFor function
    var randForKeys = {};
    slideObj.data.getRandomizerFor = function(key, fresh) {
        if(!randForKeys[key]) {
            var subseed = (fresh ? '' : seed) + key;
            randForKeys[key] = new Rng(subseed);
            randForKeys[key].seed = subseed;
        }
        return randForKeys[key];
    }
}

//register randomizer
RadReveal.register('randomizer', initialize);
RadReveal.on('data-rad-randomizer', 'load', load);

},{"../node_modules/rng-js":1,"rad-reveal":"rad-reveal"}]},{},["/Users/larsonj/Sites/radReveal/rad-randomizer/src/randomizer.js"]);

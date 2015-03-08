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

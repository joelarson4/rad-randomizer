require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/larsonj/Sites/radReveal/rad-randomizer/src/randomizer.js":[function(require,module,exports){
var RadReveal = require('rad-reveal');
var Rng = require('../node_modules/rng-js');

var config;

////

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

function getHeadingText(tag, slideObj) {
    var text = '';
    if(!tag) {
        [1, 2, 3, 4, 5, 6].forEach(function(number) {
            text += getHeadingText('h' + number, slideObj);
        });
        return text;
    } else {
        var tagElements = Array.prototype.slice.apply(slideObj.element.querySelectorAll(tag));
        tagElements.forEach(function(element) {
            text += '; ' + (element.textContent || element.innerText);
        });
        return text;
    }
}

function setup(attrVal, slideObj, event, radEventName) {
    var seed;

    //first get the seed value
    if(attrVal === 'HTML') {
        seed = slideObj.element.innerHTML;
    } else if(attrVal === 'HEADINGS') {
        seed = getHeadings('*', slideObj);
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

    slideObj.data.randomizer = new Rng(seed);
    slideObj.data.randomizer.seed = seed;
    
    var randForKeys = {};
    slideObj.data.getRandomizerFor = function(key, fresh) {
        if(!randForKeys[key]) {
            randForKeys[key].seed = (fresh ? '' : seed) + key;
            randForKeys[key] = new Rng(randForKeys[key].seed);
        }
        return randForKeys[key];
    }
}

RadReveal.register({
    name: 'randomizer',
    initialize: initialize,
    attributeEventListeners: {
        'data-rad-randomizer': {
            setup: setup
        }
    }
});
},{"../node_modules/rng-js":undefined,"rad-reveal":"rad-reveal"}]},{},["/Users/larsonj/Sites/radReveal/rad-randomizer/src/randomizer.js"]);

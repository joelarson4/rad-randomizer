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

    slideObj.data.randomizer = new Rng(seed);
    slideObj.data.randomizer.seed = seed;
    
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

RadReveal.register({
    name: 'randomizer',
    initialize: initialize,
    attributeEventListeners: {
        'data-rad-randomizer': {
            setup: setup
        }
    }
});
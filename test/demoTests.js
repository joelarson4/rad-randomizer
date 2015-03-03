var RadReveal = require('rad-reveal');
var slides = RadReveal.getSlideObjects();


describe('rad-randomizer tests', function() {
    it('has basic attachment of correct objects', function() { 
        slides.forEach(function(slide) {
            var hasAttr = slide.element.hasAttribute('data-rad-randomizer');
            assert.isTrue(hasAttr === (typeof slide.data.randomizer === 'object'), 'Slides with attribute have randomizer object');
            assert.isTrue(hasAttr === (typeof slide.data.getRandomizerFor === 'function'), 'Slides with attribute have getRandomizerFor function');

            if(!hasAttr) { return; }
            assert.isTrue((typeof slide.data.randomizer.random === 'function'), 'Randomizer has random method');
        });
    });

    it('check that HTML value reflects HTML', function() { 
        slides.forEach(function(slide) {
            if(slide.element.hasAttribute('data-rad-randomizer') !== 'HTML') { return; }

            assert.isTrue(slide.element.innerHTML.indexOf(slide.data.randomizer.seed) > -1, 'Seed is set to HTML');

            var randomizer = slide.data.getRandomizerFor(slide.seed);
            var randString = getRandomString(randomizer);
            assert.isTrue(slide.element.innerHTML.indexOf(randString) > -1, 'Random string is the same');
        });
    });

    it('check that TEXT value reflects TEXT', function() { 
        slides.forEach(function(slide) {
            if(slide.element.hasAttribute('data-rad-randomizer') !== 'HTML') { return; }

            var slideText = slide.element.textContent || slide.element.innerText
            assert.isTrue(slideText.indexOf(slide.data.randomizer.seed) > -1, 'Seed is set to HTML');

            var randomizer = slide.data.getRandomizerFor(slide.seed);
            var randString = getRandomString(randomizer);
            assert.isTrue(slide.element.innerHTML.indexOf(randString) > -1, 'Random string is the same');
        });
    });

    it('check that HEADINGS value reflects heading', function() { 
        slides.forEach(function(slide) {
            if(slide.element.hasAttribute('data-rad-randomizer') !== 'HEADINGS') { return; }
            //in the demos where HEADING used, the only heading tag is h2
            var h2ele = slide.element.querySelector('h2');
            var h2Text = h2ele.textContent || h2ele.innerText
            assert.isTrue(h2Text.indexOf(slide.data.randomizer.seed) > -1, 'Seed is set to heading tag contents');

            var randomizer = slide.data.getRandomizerFor(slide.seed);
            var randString = getRandomString(randomizer);
            assert.isTrue(slide.element.innerHTML.indexOf(randString) > -1, 'Random string is the same');
        });
    });

    it('check that H3 value reflects h3', function() { 
        slides.forEach(function(slide) {
            if(slide.element.hasAttribute('data-rad-randomizer') !== 'h3') { return; }
            
            var h3ele = slide.element.querySelector('h3');
            var h3Text = h3ele.textContent || h3ele.innerText
            assert.isTrue(h3Text.indexOf(slide.data.randomizer.seed) > -1, 'Seed is set to h3 tag contents');

            var randomizer = slide.data.getRandomizerFor(slide.seed);
            var randString = getRandomString(randomizer);
            assert.isTrue(slide.element.innerHTML.indexOf(randString) > -1, 'Random string is the same');
        });
    });

    it('check that RANDOM seems to have a randomish seed', function() {
        var prevSeed = Math.random();
        slides.forEach(function(slide) {
            if(slide.element.hasAttribute('data-rad-randomizer') !== 'RANDOM') { return; }
            
            var seed = slide.data.randomizer.seed;

            assert.isTrue(seed >= 0, 'Seed is not less than zero');
            assert.isTrue(seed < 1, 'Seed is not more than or equal to one');
            assert.isTrue(seed !== prevSeed, 'Seed is not same as last RANDOM seed');
            prevSeed = seed;
        });
    });
});
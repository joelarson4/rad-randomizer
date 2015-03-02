#rad-randomizer [![Build Status](https://travis-ci.org/joelarson4/rad-randomizer.svg)](https://travis-ci.org/joelarson4/rad-randomizer)
rad-randomizer is a [Reveal.js](http://lab.hakim.se/reveal-js/) [RadReveal](https://github.com/joelarson4/radReveal) add-on for attaching seeded PRNGs to your slides.

Check out the [demo slideshow](http://joelarson4.github.io/rad-randomizer/demo.html) to see what rad-randomizer can do.

Check out [RadReveal](https://github.com/joelarson4/radReveal) to understand how these add-ons work.

##What does rad-randomizer do?

rad-randomizer can add a seeded pseudo random number generater (PRNG) to your slides.
You can use these PRNGs in other reveal.js add-ons to attach random seeming but predictable behaviors.
That can make your slideshow seem more interesting with less work!

##How is do you use it?

Just add a `data-rad-randomizer` attribute with a non-blank value to any slide.
Those slide's `data` property will have a property `randomizer` attached.
That will be a [Rng-js](https://github.com/skeeto/rng-js) object, which has a `random()` method that supplies a random 
seeming number based on a seed.

So if you had a slide set up like this:

    <section data-rad-randomizer="99">

Then in your own add-on code the `slide` object supplied for attribute event listeners would have a `data.randomizer` property 
which could supply `random()` seeming numbers.

    function listener(attrVal, slideObj, event, radEventName) {
        var num1 = slideObj.data.randomizer.random();
        var num2 = slideObj.data.randomizer.random();
        var num3 = slideObj.data.randomizer.random();

`num1`, `num2`, and `num3` will always get the same value until you change that `data-rad-randomizer` value.  
Check out the [Rng-js](https://github.com/skeeto/rng-js) documentation to find out what other methods it supports.

##What attribute values can you use for `data-rad-randomizer`?

The attribute takes several special values, or any other value you want.

* `TEXT` - uses the slide text as a seed.
* `HEADING` - uses text from all h1 ... h6 tags as a seed.
* `H1` ... `H6` uses text from just the `h1` ... `h6` tag you specified
* `HTML` - uses the slide html as a seed.
* `RANDOM` - uses a Math.random() as the seed (so it will change each reload).
* If you supply a number, then that number will be used as the seed.
* If you supply any other value, then that string will be used as the seed.

So for example, if you had a slide like this:

    <section data-rad-randomizer="HEADING">
        <h1>This is the heading text</h1>
        <h2>Also part of the heading text</h2>
        <p>This is not part of the heading.</p>
    </section>

Then the randomizer would use "This is the heading textAlso part of the heading text" as the seed, and as long as that heading
text didn't change, then the random numbers supplied would be the same ever reload.

##What if you need several independent randomizers per slide?

Each slide will also have a `getRandomizerFor()` property, which you can use to get a custom randomizer within the slide for 
specific purposes.  For example maybe you want one randomizer to drive the background color and another to drive some kind
of animation.
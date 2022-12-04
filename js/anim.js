/*jslint nomen: true */
/*global nW1: false */
/* eslint-disable indent */
/* eslint-disable max-len */
/* eslint-disable no-param-reassign */


let anim = (function () {
    let timer;

    function exit() {
        window.clearTimeout(timer);
        timer = null;
        exit.opacity = Math.min(fadeEl.style.opacity, .45);
        $('benami').classList.remove('inplay');
        $('benami').classList.add('pause');
    }

    function enter(x) {
        timer = 1;
        doFade(exit.opacity || x);
        $('benami').classList.add('inplay');
    }

let fadeEl = null;

const meta = nW1.meta,
getNext = nW1.utils.getNextElement,
$ = meta.$,
defer = (fun) => (arg) => () => fun(arg),
shuffle = (el) => {
    el.insertBefore(fadeEl, el.firstChild);
},
doFade = (i = 101) => {
    fadeEl.style.opacity = i/100;
    return setTimeout(defer(fader)(i), 7);
},
doAlt = meta.doAlternate(0)([exit, enter]),
fader = function (i) {
    i -= 1;
    if (timer) {
        if (i >= 0) {
            timer = doFade(i);
        } else {
        shuffle($('benami'));
        fadeEl.style.opacity = 1;
        //outgoing element sent to bottom of pile, but will need to be 100% opacity when it becomes base element
        fadeEl = getNext($('benami').lastChild);
        setTimeout(defer(fader)(101), 2222);
        }
    }
};
return (e) => {
    fadeEl = e.currentTarget.lastChild;
    doAlt(101);
};
}());

nW1.meta.$('benami').addEventListener('click', anim);

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
       toggle('inplay', 'pause');
    }

    function enter(x) {
        timer = 1;
        doFade(exit.opacity || x);
        toggle('pause', 'inplay');
    }

    function getNext(el) {
        return nW1.utils.getNextElement(el) || nW1.utils.getPrevElement(el);
    }

    function toggle(a, b) {
        $('benami').classList.remove(a);
        $('benami').classList.add(b);
    }

let fadeEl = null,
j = 3;

const meta = nW1.meta,
$ = meta.$,
paths = [1,2,3,4].map( n => './assets/img/misc/bensondesign'+n+'_fs.jpg'),
getNextNum = (n) => n % paths.length,
defer = (fun) => (arg) => () => fun(arg),
shuffle = (el) => {
    el.insertBefore(fadeEl, getNext(el.firstChild));
},
doFade = (i = 101) => {
    fadeEl.style.opacity = i/100;
    return setTimeout(defer(fader)(i), 7);
},
doAlt = meta.doAlternate()([enter, exit]),
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
       getNext($('benami').firstChild).src = paths[getNextNum(j++)];
     // console.log(paths[getNextNum(j++)]);
        setTimeout(defer(fader)(101), 2222);
        }
    }
};
return (e) => {
    fadeEl = getNext(e.currentTarget.lastChild);
    doAlt(101);
};
}());

nW1.meta.$('benami').addEventListener('click', anim);

import { findDOMNode } from "react-dom";
import { $, doAlternateInvoke, getNextElement} from "./helpers.js";


const animator = (function () {
    let timer;

    function exit() {
        window.clearTimeout(timer);
        timer = null;
        exit.opacity = Math.min(fade_el.style.opacity, .45);
        $('benami').classList = 'pause';
    }
    
    function enter(x) {
        timer = 1;
        doFade(exit.opacity || x);
        $('benami').classList = 'inplay';
    }

let fade_el = null;

const defer = (fun) => (arg) => () => fun(arg),
shuffle = (el) => {
    el.insertBefore(fade_el, getNextElement(el.firstChild));
},
doFade = (i = 101) => {
    fade_el.style.opacity = i/100;
    return setTimeout(defer(fader)(i), 7);
},
doAlt = doAlternateInvoke(0)([enter, exit]),
fader = function (i) {
    i -= 1;
    if (timer) {
        if (i >= 0) {
            timer = doFade(i);
        } else {
        shuffle($('benami'));
        //outgoing element sent to bottom of pile, but will need to be 100% opacity when it becomes base element
        fade_el.style.opacity = 1;
        fade_el = getNextElement($('benami').lastChild);
        setTimeout(defer(fader)(101), 2222);
        }
    }
};
return (e) => {
    fade_el = getNextElement(e.currentTarget.lastChild);
    doAlt(101);
};
}());

export default animator;
/*jslint nomen: true */
/*global window: false */
/*global document: false */
/*global looper: false */
/*global $: false */
/*global $$: false */
/*global $$q: false */
/*global curry2: false */
/*global curry22: false */
/*global curry3: false */
/*global compose: false */
/*global getter: false */
/*global setterBridge: false */
/*global ptL: false */
/*global deferPTL: false */
/*global invoke: false */
/*global invokeMethod: false */
/*global invokeMethodV: false */
/*global doWhenFactory: false */
/*global getImgSrc: false */
/*global equals: false */
/*global $$q: false */
/*global nW1: false */

if (!window.nW1) {
    window.nW1 = {};
}

const tagTester = (name) => {
        const tag = '[object ' + name + ']';
        return function (obj) {
            return toString.call(obj) === tag;
        };
    },
    isFunction = tagTester('Function'),
    getRes = function (arg) {
        if (isFunction(arg)) {
            return arg();
        }
        return arg;
    },
    getTgt = (str) => $$(str),
    isInplay = $$q('.inplay'),
    getHeight = curry2(getter)('height'),

    testProp = (a, b, getprop) => [a, b].map(getTgt).map((item) => getRes(item)).map(getprop),
    doPic = ptL(setterBridge, 'src'),
    displayInplay = ptL(invokeMethod, document.body.classList, 'add'),
    onInplay = curry22(invoke)('inplay')(displayInplay),
    deferForward = deferPTL(invokeMethod, looper, 'forward', null),
    advance = compose(onInplay, doPic($$('base')), curry2(getter)('value'), deferForward),
    reducer = curry3(invokeMethod)(equals)('reduce'),
    updateBase = curry2(doWhenFactory())(advance),
    doSwap = function () {
        let bool = compose(reducer)(testProp('base', 'slide', getHeight)),
            displaySwap = curry2(ptL(invokeMethod, document.body.classList))('swap');
        displaySwap(bool ? 'remove' : 'add'); //paint
        return !bool;
    },
   
    playMaker = function ($recur) {
        const doLoad = curry22(doWhenFactory())(compose($recur.setPlayer.bind($recur), doSwap))(isInplay);

        function updateImages(flag) {
            const s = $('slide'),
                b = $('base');
            doPic(s, getImgSrc(b));
            s.onload = () => updateBase(flag);
            b.onload = b.onload || doLoad;
        }
        const fade = {
                validate: function () {
                    return $recur.i <= -1;
                },
                inc: function () {
                    $recur.i -= 1;
                },
                reset: function (arg) {
                    $recur.i = $recur.dur;
                    updateImages(true);
                }
            },

            fadeOut = {
                validate: function () {
                    return $recur.i <= -.1;
                },
                inc: function () {
                    $recur.i -= 1;
                },
                reset: function () {
                    updateImages();
                    //ensure fadeIn will follow
                    $recur.setPlayer(true);
                }
            },
            fadeIn = {
                validate: function () {
                    return $recur.i >= 222;
                },
                inc: function () {
                    $recur.i += 1;
                },
                reset: function () {
                    doPic($('base'), looper.forward().value);
                }
            },
            actions = [fadeIn, fadeOut];

        return function (flag) {
            return flag ? actions.reverse()[0] : fade;
        };
    },
    recurMaker = function (duration = 100, wait = 50, i = 1, makePub = false) {
        let ret = {
            init: function () {
                this.nextplayer = playMaker(this);
                this.player = this.nextplayer();
                this.dur = duration;
                this.wait = wait;
                this.i = i;
                this.t = null;
                this.handlers = [];
                return this;
            },
            execute: function () {
                if (this.player.validate()) {
                    this.player.reset();
                } else {
                    this.notify(this.i / this.wait);
                    this.recur();
                }
            },
            undo: function (flag) {
                const o = !isNaN(flag) ? .5 : 1;
                this.notify(o);
                window.cancelAnimationFrame(this.t);
                this.t = flag; //either set to undefined(forward/back/exit) or null(pause)
                if (o === 1) {
                    this.notify(null, 'delete');
                }
            },
            setPlayer: function (arg) {
                this.player = this.nextplayer(arg);
                this.execute();
            },
            recur: function () {
                this.player.inc();
                this.t = window.requestAnimationFrame(this.execute.bind(this));
            }
        };
        if (makePub) {
            return nW1.Publish().makepublisher(ret);
        }
        return ret;
    };

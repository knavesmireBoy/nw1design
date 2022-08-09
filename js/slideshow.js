/*jslint nomen: true */
/*global window: false */
/*global document: false */
/*global looper: false */
/*global $: false */
/*global $$: false */
/*global $$q: false */
/*global nW1: false */

if (!window.nW1) {
    window.nW1 = {};
}

const getTgt = (str) => $$(str),
    isInplay = $$q('.inplay'),
    getHeight = curry2(getter)('height'),

    testProp = (a, b, getprop) => [a, b].map(getTgt).map((item) => getResult(item)).map(getprop),
    doPic = ptL(setterBridge, 'src'),
    displayPause = ptL(invokeMethodV, $$('slideshow'), 'classList', 'pause'),
    displaySwap = curry2(ptL(invokeMethod, document.body.classList))('swap'),
    queryInplay = curry2(ptL(invokeMethod, document.body.classList))('inplay'),
    display_inplay = ptL(invokeMethod, document.body.classList, 'add'),
    onInplay = curry22(invoke)('inplay')(display_inplay),
    deferForward = deferPTL(invokeMethod, looper, 'forward', null),
    advance = compose(onInplay, doPic($$('base')), curry2(getter)('value'), deferForward),
    reducer = curry3(invokeMethod)(equals)('reduce'),
    updateBase = curry2(doWhenFactory())(advance),
    doSwap = function () {
        let bool = compose(reducer)(testProp('base', 'slide', getHeight));
        displaySwap(bool ? 'remove' : 'add'); //paint
        return !bool;
    },
    painter = function (slide, base, container) {
        let ret = {
            doOpacity: function (o) {
                let el = getResult(slide);
                el.style.opacity = o;
            },
            cleanup: function () {
                queryInplay('remove');
                displayPause('remove');
                displaySwap('remove');
            }

        };
        return nW1.Publish().makepublisher(ret);
    },
    playMaker = function ($recur) {
        const doLoad = curry22(doWhenFactory())(compose($recur.setPlayer.bind($recur), doSwap))(isInplay);
        function updateImages(flag) {
            var s = $('slide'),
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

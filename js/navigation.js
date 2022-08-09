/*jslint nomen: true */
/*global Publisher: false */
/*global window: false */
/*global nW1: false */
if (!window.nW1) {
    window.nW1 = {};
}

function equals(a, b) {
    return a === b;
}

function modulo(n, i) {
    return i % n;
}

function increment(i) {
    return i + 1;
}

function identity(v) {
    return v;
}

function getResult(o) {
    if (typeof o === 'function') {
        return o();
    }
    return o;
}

function insertB4(neu, elm) {
    const el = getResult(elm),
        p = el.parentNode;
    return p.insertBefore(getResult(neu), el);
}

function doPartial(flag) {
    return function p(f, ...args) {
        if (f.length === args.length) {
            return flag ? () => f(...args) : f(...args);
        }
        return (...rest) => p(f, ...args, ...rest);
    };
}
/*
https://gist.github.com/JamieMason/1228339132986291693726d11bd8dd1f
const pApply = (fn, ...cache) => (...args) => {
  const all = cache.concat(args);
  return all.length >= fn.length ? fn(...all) : pApply(fn, ...all);
};
*/

//note a function that ignores any state of champ or contender will return the first element if true and last if false
function best(fun, coll, arg) {
    //fun = arg ? doPartialCB()(fun, arg) : fun;
    return toArray(coll).reduce((champ, contender) => fun(champ, contender) ? champ : contender);
}

function alternate(i, n) {
    return function () {
        i = (i += 1) % n;
        return i;
    };
}


function doAlternate() {
    const f = alternate(0, 2);
    return function (actions, ...args) {
        return function () {
            return best(f, [actions[0], actions[1]])();
        };
    };
}

function toArray(coll, cb = () => true) {
    return Array.prototype.slice.call(coll).filter(cb);
}
if (typeof Function.prototype.wrap === 'undefined') {
    Function.prototype.wrap = function (wrapper, ..._vs) {
        let _method = this; //the function
        return function (...vs) {
            return wrapper.apply(this, [_method.bind(this), ..._vs, ...vs]);
        };
    };
}


function doInc(n) {
    return compose(ptL(modulo, n), increment);
}
/* don't use partially applied callbacks in map, forEach etc.. as argument length will confound...*/

function doIterate(m, funs) {
    return function (o) {
        if (funs) {
            let obj = getResult(o);
            funs[m]((f) => f(obj));
            return obj;
        }
        return o;
    };
}

function zip(m, funs, vals) {
    return vals[m]((v, i) => funs[i](v));
}

function doWhenFactory(n) {

    const both = (pred, action, v) => {
            if (pred(v)) {
                return action(v);
            }
        },
        act = (pred, action, v) => {
            if (getResult(pred)) {
                return action(v);
            }
        },
        predi = (pred, action, v) => {
            if (pred(v)) {
                return action();
            }
        },
        none = (pred, action) => {
            if (getResult(pred)) {
                return action();
            }
        },
        all = [none, predi, act, both];

    return all[n] || none;
}

class Grouper extends Publisher {
    constructor(grp = [], kls = 'active', h = []) {
        super(h);
        this.grp = grp;
        this.current = null;
        this.finder = () => null;
    }
    getCurrent() {
        return this.strategy();
    }
    undo(el, click) {
        if ((el === this.current) && click) {
            this.current = null;
            return undoActive(el);
        }
    }
    execute(el, click) {
        if (!this.undo(el, click)) {
            undoActiveCB(this.grp);
            this.current = doActive(el);
        }
    }
    setFinder(src) {
        this.finder = Grouper.doFind(src);
        return this.getCurrent();
    }
    setSearch(s = () => []) {
        this.strategy = s;
        return this;
    }
    setGroup(grp) {
        this.grp = grp;
        return this;
    }
    static from(grp, kls = 'active') {
        return new Grouper(grp, kls);
    }
    static doFind(str) {
        return function (cur) {
            return str.match(/\/(\w+)_/.exec(cur)[1]);
        };
    }
}

function replacePath(o, src) {
    o = getResult(o);
    o.setAttribute('src', src.replace('thumbs', 'fullsize').replace('tmb', 'fs'));
}

function hover(e) {
    var preview = $q('#slidepreview img');
    if (matchImg(e) && e.target !== preview) {
        replacePath(preview, getAttribute('src')(e.target));
    }
}

function getNextElement(node) {
    if (node && node.nodeType === 1) {
        return node;
    }
    if (node && node.nextSibling) {
        return getNextElement(node.nextSibling);
    }
    return null;
}

function getTargetNode(node, reg, dir = 'firstChild') {
    if (!node) {
        return null;
    }
    node = node.nodeType === 1 ? node : getNextElement(node);
    var res = node && node.nodeName.match(reg);
    if (!res) {
        node = node && getNextElement(node[dir]);
        return node && getTargetNode(node, reg, dir);
    }
    return node;
}

const looper = nW1.Looper(),
    config = [{
        FOP: 4
		}, {
        AFEN: 3
		}, {
        'Distillery House': 3
		}, {
        'Benson Design': 4
		}, {
        BP: 2
		}, {
        UKOOA: 4
		}, {
        'Orkney Holiday Cottages': 3
		}, {
        'Safari Afrika': 4
		}],
    pApply = (fn, ...cache) => (...args) => {
        const all = cache.concat(args);
        return all.length >= fn.length ? fn(...all) : pApply(fn, ...all);
    },
    deferPTL = doPartial(true),
    ptL = doPartial(),
    pass = (ptl, o) => {
        ptl(getResult(o));
        return o;
    },
    con = (v) => console.log(v),
    compose = (...fns) => fns.reduce((f, g) => (...vs) => f(g(...vs))),
    getter = (o, p) => {
        o = getResult(o);
        return o[p];
    },
    setter = (o, k, v) => {
        o = getResult(o);
        getResult(o)[k] = v;
        return o;
    },
    setterBridge = (k, o, v) => {
        o = getResult(o);
        o[k] = v;
        return o;
    },
    always = (arg) => () => arg,
    curry = fun => a => fun(a),
    curry2 = fun => b => a => fun(a, b),
    curry22 = fun => b => a => () => fun(a, b),
    curryL2 = fun => a => b => fun(a, b),
    curryL22 = fun => a => b => () => fun(a, b),
    curry3 = fun => c => b => a => fun(a, b, c),
    curryL3 = fun => a => b => c => fun(a, b, c),
    curryL33 = fun => a => b => c => () => fun(a, b, c),
    invoke = (f, v) => f(v),
    invokeMethod = (o, m, v) => o[m](v),
    invokeMethodV = (o, p, m, v) => {
        o = getResult(o);
        return o[p][v](m)
    },
    invokeMethodPair = (o, m, p, v) => {
        o = getResult(o);
        return o[m](p, v)
    },
    lazyVal = (m, p, o, v) => o[m](p, v),
    invokeMethodBridge = (m, v, o) => {
        o = getResult(o);
        return invokeMethod(o, m, v);
    },

    invokeMethodBridgeCB = (cb) => (m, v, o) => {
        o = cb(o);
        return invokeMethod(o, m, v);
    },
    invokeMethodBridgeCBT = (cb) => (m, v, o) => {
        o = cb(o);
        return invokeMethod(o, m, v);
    },
    negate = (f, last_arg) => !f(last_arg),

    $ = (str) => document.getElementById(str),
    $$ = (str) => () => $(str),
    $q = (str, flag = false) => {
        const m = flag ? 'querySelectorAll' : 'querySelector';
        return document[m](str);
    },
    $$q = (str, flag = false) => () => $q(str, flag),
    getTarget = curry2(getter)('target'),
    getParent = curry2(getter)('parentNode'),
    getParent2 = compose(getParent, getParent),
    getText = curry2(getter)('innerHTML'),
    getNodeName = curry2(getter)('innerHTML'),
    getClassList = curry2(getter)('classList'),
    getTextFromTarget = compose(getText, getTarget),
    getNodeNameTarget = compose(getText, getTarget),
    doMake = deferPTL(invokeMethod, document, 'createElement'),
    doMakeCB = curryL3(invokeMethod)(document)('createElement'),
    doMakeNow = ptL(invokeMethod, document, 'createElement'),
    doText = deferPTL(invokeMethod, document, 'createTextNode'),
    doTextNow = ptL(invokeMethod, document, 'createTextNode'),
    doTextCB = curryL33(invokeMethod)(document)('createTextNode'),
    doTextCBNow = curryL3(invokeMethod)(document)('createTextNode'),
    prepend = curry2(ptL(invokeMethodBridgeCB(getResult), 'appendChild')),
    prependCB = curry2(curryL3(invokeMethodBridgeCB(getResult))('appendChild')),
    insertBeforeCB = curry2(curryL3(invokeMethodBridgeCBT(getResult))('insertBefore')),
    append = ptL(invokeMethodBridgeCB(getResult), 'appendChild'),
    appendCB = curryL3(invokeMethodBridgeCB(getResult))('appendChild'),
    getAttribute = ptL(invokeMethodBridge, 'getAttribute'),
    getAttrs = curryL3(invokeMethodBridge)('getAttribute'),
    getParentAttribute = ptL(invokeMethodBridgeCB(getParent), 'getAttribute'),
    setAttribute = ptL(lazyVal, 'setAttribute'),
    matchLink = compose(curry3(invokeMethod)(/^a$/i)('match'), curry2(getter)('nodeName'), getTarget),
    matchImg = compose(curry3(invokeMethod)(/^img/i)('match'), curry2(getter)('nodeName'), getTarget),
    matchPath = compose(curry3(invokeMethod)(/jpe?g/i)('match'), curryL3(invokeMethodBridge)('getAttribute')('href')),
    getImgSrc = curryL3(invokeMethodBridge)('getAttribute')('src'),
    getImgPath = compose(getImgSrc, getTarget),
    addClickHover = curry2(ptL(lazyVal, 'addEventListener', 'mouseover'))(hover).wrap(pass),
    onLoad = curry2(ptL(lazyVal, 'addEventListener', 'load')),
    reset_opacity = compose(curry3(setter)(3)('opacity'), curry22(getter)('style')($$('slide'))),
    doResetOpacity = onLoad(reset_opacity).wrap(pass),
    setId = curry2(setAttribute('id')),
    setLink = curry2(setAttribute('href')),
    setSrc = curry2(setAttribute('src')),
    setAlt = curry2(setAttribute('alt')),
    setVal = curry2(setAttribute('value')),
    setMin = curry2(setAttribute('min')),
    setMax = curry2(setAttribute('max')),
    setType = curry2(setAttribute('type')),

    setNavId = curry2(setAttribute('id'))('navigation').wrap(pass),
    setHref = setLink('.').wrap(pass),
    getNav = $$('navigation'),
    addKlas = ptL(invokeMethodBridge, 'add'),
    remKlas = ptL(invokeMethodBridge, 'remove'),
    doActive = compose(addKlas('active'), getClassList).wrap(pass),
    undoActive = compose(remKlas('active'), getClassList).wrap(pass),
    doEach = curryL3(invokeMethodBridgeCB(getResult))('forEach'),
    doFindIndex = curryL3(invokeMethodBridgeCB(getResult))('findIndex'),
    undoActiveCB = doEach(undoActive),
    doElement = compose(doMake, identity),
    doElementNow = compose(getResult, doElement),
    getZero = curry2(getter)(0),
    getZeroPlus = curry2(getter)(10),
    getLength = curry2(getter)('length'),
    getKey = compose(getZero, curryL3(invokeMethod)(window.Object)('keys')),
    getKeys = compose(doTextNow, getKey),
    getValues = compose(getZero, curryL3(invokeMethod)(window.Object)('values')),
    doRender = prepend(document.body),
    incrementer = compose(doInc, getLength),
    doTest = function (x) {
        console.log(x);
        return x;
    };

function getLinksDeep() {
    const get = curry3(getTargetNode),
        ul = this.grp.map(get('nextSibling')(/ul/i)),
        getA = get('firstChild')(/^a$/i);
    return ul.map(({
        children
    }) => toArray(children)).map(lis => lis.map(compose(getAttrs('href'), getA)));
}

function getLinks() {
    const get = curry3(getTargetNode)('firstChild')(/^a$/i);
    return toArray(this.grp).map(lis => compose(getAttrs('href'), get)(lis));
}

function headersSearch() {
    const links = getLinksDeep.call(this),
        i = links.map(strs => strs.findIndex(this.finder)).findIndex(n => n >= 0);
    this.index = i;
    if (this.grp[i]) {
        this.execute(this.grp[i]);
        this.notify(this.grp[i]);
    }
}

function thumbsSearch() {
    const links = getLinks.call(this),
        i = links.findIndex(this.finder);
    this.index = i;
    if (this.grp[i]) {
        this.execute(this.grp[i]);
    }
}

let headers = {},
    $slider = null;

let sliderFactory = function (element) {

    function Slider(el) {
        this.el = getResult(el);
        this.handlers = [];
        const that = this;
        this.el.oninput = function () {
            that.notify(this.value, true);
        };
    }
    Slider.prototype = new Publisher();
    Slider.prototype.constructor = Slider;
    return new Slider(element);
};

function router($recur) {
    let player = null;
    const playMaker = function () {
            const func = doAlternate(),
                displayPause = ptL(invokeMethodV, $$('slideshow'), 'classList', 'pause'),
                exec = compose(displayPause, always('remove'), $recur.execute.bind($recur, true)),
                undo = compose(displayPause, always('add'), $recur.undo.bind($recur, null));
            return func([exec, undo]);
        },
        loop = deferPTL(invokeMethod, looper),
        set = loop('set'),
        routines = [set(false), loop('back')(null), loop('forward')(null), set(true)];
    return {
        menu: function (e) {
            const found = compose(getText, getTarget)(e),
                which = curry2(ptL(invokeMethodBridge, 'match'))(found),
                i = [/^begin$/, /^back$/, /^forward$/, /^end$/].findIndex(which);
            player = player || playMaker();
            if (found === 'play') {
                player();
            } else {
                player = null;
                $recur.undo();
                if (routines[i]) {
                    routines[i]();
                }
            }
        },
        sidebar: function (e) {
            e.preventDefault();
            let img = getImgPath(e),
                visit = false;
            if (matchLink(e)) {
                toArray($q('.active', true)).forEach((el) => el.classList.remove('active'));
                headers.execute(getTarget(e), true);
                visit = true;
            }
            if (img) {
                visit = true;
                looper.find(img);
            }
            if (visit) {
                player = null;
                $recur.undo();
            }
        }
    };
}

function prepareHeadings(ul) {
    return function (el, i, els) {
        let n = Object.values(config[i])[0],
            j = 0,
            lis = ul.children,
            ol,
            neu;
        while (j < n) {
            if (!j) {
                ol = doMake('ul')();
            }
            if (j === n) {
                j = -1;
            }
            neu = append(lis[0], ol).parentNode;
            if (els[i + 1]) {
                el.parentNode.insertBefore(neu, els[i + 1]);
            } else {
                el.parentNode.append(neu);
            }
            j++;
        }
        if (!els[i + 1]) {
            ul.parentNode.removeChild(ul);
        }
    };
}


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


let $painter = null;


const broadcaster = Publisher.from(),
    $recur = recurMaker(300, 99, 1, true).init(),
    routes = router($recur),
    prepAttrs = (keys, vals) => curryL33(zip)('map')(keys)(vals),
    prepare2Append = (doEl, doAttrs) => compose(append, curry2(invoke)(doEl), ptL(doIterate, 'forEach'), doAttrs)(),
    doDiv = doMake('div'),
    doImg = doMake('img'),
    doH2 = compose(append, getParent, prepend(doMake('h2')), doText('Navigation'))(),
    doRenderNav = compose(prepend($$('navigation')), setHref, getParent, prepend(doMake('a'))),
    setDiv = prepare2Append(doDiv, prepAttrs([setId], ['slidepreview'])),
    setPara = prepare2Append(doMake('p'), prepAttrs([], [])),
    setSpan1 = prepare2Append(doMake('span'), prepAttrs([setId], ['demo'])),
    setSpan2 = prepare2Append(doMake('span'), prepAttrs([setId], ['max'])),
    setImg = prepare2Append(doImg, prepAttrs([setAlt], ['currentpicture'])),
    headings = compose(curry2(toArray)(curryL2(negate)(matchPath)), $$q('#navigation a', true)),
    doSliderOutput = ptL(setter, $$("demo"), 'innerHTML'),
    doSliderInput = ptL(setter, $$("myrange"), 'value'),
    addClickPreview = curry2(ptL(lazyVal, 'addEventListener', 'click'))(routes.sidebar).wrap(pass),
    displayPause = ptL(invokeMethodV, $$('slideshow'), 'classList', 'pause'),
    displaySwap = curry2(ptL(invokeMethod, document.body.classList))('swap'),
    queryInplay = curry2(ptL(invokeMethod, document.body.classList))('inplay'),
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

    loader = function () {
        //create sidebar
        compose(setImg, setDiv, getParent, doH2, getParent, curry2(invoke)($q('#display ul')), prepend, addClickHover, addClickPreview, setNavId, append(doMake('section')()), prepend($('content')), doMake('aside'))();
        config.map(getKeys).map(doRenderNav).forEach(prepareHeadings($q('#navigation ul')));
        //post creation of sidebar
        headers = Grouper.from(headings());
        const getExtent = $$q('#navigation ul li a', true),
            getMyLinks = compose(curryL3(invokeMethodBridge)('map')((a) => a.getAttribute('href')), toArray, getExtent),
            src = compose(getAttrs('href'), getZero, getExtent)(),
            machDiv = prepare2Append(doDiv, prepAttrs([setId], ['slideshow'])),
            machControls = prepare2Append(doDiv, prepAttrs([setId], ['controls'])),
            machButtons = prepare2Append(doDiv, prepAttrs([setId], ['buttons'])), //container for buttons
            machSlider = prepare2Append(doDiv, prepAttrs([setId], ['slidecontainer'])),
            machSliderInput = prepare2Append(doMake('input'), prepAttrs([setType, setMin, setMax, setVal, setId], ['range', 1, 27, 1, 'myrange'])),
            machBase = prepare2Append(doImg, prepAttrs([setSrc, setAlt, setId], [src, 'current', 'base'])),
            machSlide = prepare2Append(doImg, prepAttrs([setSrc, setAlt, setId], [src, 'current', 'slide'])),
            previewer = ptL(replacePath, $$q('#slidepreview img')),
            displayer = curryL2(replacePath)($$('base')),
            thumbs = Grouper.from($q('#navigation ul li', true)),
            addPlayClick = curry2(ptL(lazyVal, 'addEventListener', 'click'))(routes.menu).wrap(pass),
            buttontext = ['begin', 'back', 'play', 'forward', 'end'].map(doTextCBNow),
            slidertext = ['Image ', ' of '].map(doTextCBNow),
            sliderspans = [curry2(insertB4)($$('demo')), curry2(insertB4)($$('max'))],
            buttons = compose(getParent, compose(prepend, doMake)('button')),
            sliderBridge = function (path) {
                const i = looper.get('members').findIndex(curry2(equals)(path));
                //looper members zero indexed...
                doSliderInput(i + 1);
                doSliderOutput(i + 1);
            };


        compose(machSlide, getParent, machBase, getParent, getParent2, getParent2, append(doTextNow(27)), setSpan2, getParent2, append(doTextNow(1)), setSpan1, setPara, getParent, machSliderInput, machSlider, addPlayClick, getParent, machButtons, machControls, machDiv)($('display'));
        buttontext.map(buttons).map(appendCB).map(curry2(invoke)($('buttons')));

        zip('forEach', sliderspans, slidertext);
        $slider = sliderFactory($$("myrange"));

        headers.setSearch(headersSearch.bind(headers));
        thumbs.setSearch(thumbsSearch.bind(thumbs));

        broadcaster.attach(headers.setFinder.bind(headers));
        broadcaster.attach(thumbs.setFinder.bind(thumbs));
        broadcaster.attach(previewer);
        broadcaster.notify(src);

        looper.build(getMyLinks(), incrementer, []);
        looper.attach(displayer);
        looper.attach(broadcaster.notify.bind(broadcaster));
        looper.attach(sliderBridge);

        $painter = painter(getTgt('slide'), getTgt('base'), document.body);
        $recur.attach($painter.doOpacity.bind($painter));
        $recur.attach($painter.cleanup.bind($painter), 'delete');
        $slider.attach(looper.set.bind(looper));

    };

window.addEventListener('load', loader);

/*
FOP : 17/12/14
BENSON
AFEN : 01/08/15
DIS HOUSE 30/04/16
BP 11/06/12
UKOOA 15/10/13   23/12/15
ORKNEY 26/04/10 08/10/20
SAFARI 31/10/04 - 26/02/04  -22/03/04
*/

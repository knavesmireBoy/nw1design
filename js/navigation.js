function insertB4(neu, elm) {
    const el = getResult(elm),
        p = el.parentNode;
    return p.insertBefore(getResult(neu), el);
}

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
    let res = node && node.nodeName.match(reg);
    if (!res) {
        node = node && getNextElement(node[dir]);
        return node && getTargetNode(node, reg, dir);
    }
    return node;
}

function zip(m, funs, vals) {
    return vals[m]((v, i) => funs[i](v));
}

function toArray(coll, cb = () => true) {
    return Array.prototype.slice.call(coll).filter(cb);
}
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
let $painter = null;

const config = [{
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
      broadcaster = Publisher.from(),
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

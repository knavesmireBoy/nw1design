/*jslint nomen: true */
/*global Modernizr: false */
/*global Publisher: false */
/*global nW1: false */
/* eslint-disable indent */


(function (config, Mod, ipad) {
  "use strict";


  function pApply (fn, ...cache) {
	return function (...args) {
		const all = cache.concat(args);
		return all.length >= fn.length ? fn(...all) : pApply(fn, ...all);
};
}
  //https://webdesign.tutsplus.com/tutorials/javascript-debounce-and-throttle--cms-36783
  //initialize throttlePause variable outside throttle function

  function throttle(callback, time) {
    //don't run the function if throttlePause is true
    if (throttlePause) {
        return;
    }

    //set throttlePause to true after the if condition. This allows the function to be run once
    throttlePause = true;

    //setTimeout runs the callback within the specified time
    setTimeout(() => {
      callback();

      //throttlePause is set to false once the function has been called, allowing the throttle function to loop
      throttlePause = false;
    }, time);
  }

  function equals(a, b) {
    return a === b;
}

function getResult(o) {
    if (typeof o === "function") {
      return o();
    }
    return o;
  }

  function insertB4(neu, elm) {
    const el = getResult(elm),
      p = el.parentNode;
    return p.insertBefore(getResult(neu), el);
  }


  function makePortrait(el) {
    if (this.naturalHeight && this.naturalHeight > this.naturalWidth) {
      el.classList.add("portrait");
      $("navigation").classList.add("portrait");
    } else if (this.naturalHeight && this.naturalHeight < this.naturalWidth) {
      el.classList.remove("portrait");
      $("navigation").classList.remove("portrait");
    }
  }

  function replacePathSimple(o, src) {
    let ob = getResult(o);
    ob.setAttribute("src", src.replace("thumbs", "fullsize").replace("tmb", "fs"));
  }

  function replacePath(o, src) {
    let ob = getResult(o);
    let binder = makePortrait.bind(o, $("wrapper"));
    ob.removeEventListener("load", binder);
    if ($q(".inplay")) {
      if (ob.id === "base") {
        $("slide").addEventListener("load", binder);
      }
    } else {
      if (ob.id === "base") {
        ob.addEventListener("load", binder);
      }
    }
    replacePathSimple(ob, src);
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

  function hover(e) {
    const preview = $q("#slidepreview img");
    if (matchImg(e) && e.target !== preview) {
      replacePath(preview, utils.getAttribute("src")(e.target));
      makePortrait.call(e.target, $("navigation"));
    }
  }

  function getNextElement(node, type = 1) {
    if (node && node.nodeType === type) {
      return node;
    }
    if (node && node.nextSibling) {
      return getNextElement(node.nextSibling);
    }
    return null;
  }

  function getTargetNode(node, reg, dir = "firstChild") {
    if (!node) {
      return null;
    }
    let mynode = node.nodeType === 1 ? node : getNextElement(node);
    let res = mynode && mynode.nodeName.match(reg);
    if (!res) {
      mynode = mynode && getNextElement(mynode[dir]);
      return mynode && getTargetNode(mynode, reg, dir);
    }
    return mynode;
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
    return toArray(coll).reduce((champ, contender) =>
      fun(champ, contender) ? champ : contender
    );
  }

  function alternate(i, n) {
    return function () {
        let j = i,
        k = (j += 1) % n;
      return k;
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

  function getLinks(grp) {
    const get = curry3(getTargetNode)("firstChild")(/^a$/i);
    return grp.map((lis) => compose(utils.getAttrs("href"), get)(lis));
  }

  function getLinksDeep(grp) {
    const ul = grp.map(curry3(getTargetNode)("nextSibling")(/ul/i)),
      lis = ul.map(({ children }) => toArray(children));
    return lis.map(getLinks);
  }

  function headersSearch() {
    const links = getLinksDeep(toArray(this.grp)),
      i = links
        .map((strs) => strs.findIndex(this.finder))
        .findIndex((n) => n >= 0);
    return compose(this.notify.bind(this), this.show.bind(this))(this.grp[i]);
  }

  function thumbsSearch() {
    const i = getLinks(toArray(this.grp)).findIndex(this.finder);
    return this.show(this.grp[i]);
  }
  let headers = {},
    $slider = null,
    sliderFactory = function (element) {
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
          displayPause = ptL(
            utils.invokeMethodV,
            $$("slideshow"),
            "classList",
            "pause"
          ),
          exec = compose(
            displayPause,
            always("remove"),
            $recur.play.bind($recur, true)
          ),
          undo = compose(
            displayPause,
            always("add"),
            $recur.suspend.bind($recur, null)
          );
        return func([exec, undo]);
      },
      loop = utils.deferPTL(utils.invokeMethodBind, looper),
      set = loop("set"),
      routines = [
        set(false),
        loop("back", null),
        loop("forward", null),
        set(true)
      ];
    return {
      menu: function (e) {
        e.preventDefault();
        const cb = Mod.backgroundsize ? utils.getAttrs("id") : utils.getText,
          found = compose(cb, utils.getTarget)(e),
          which = curry2(ptL(utils.invokeMethodBridge, "match"))(found),
          i = [/^start$/, /^back$/, /^forward$/, /^end$/].findIndex(which);
        player = player || playMaker();
        if (found.match(/^p/i)) {
          looper.setStategy(true);
          player();
        } else {
          player = null;
          looper.setStategy();
          $recur.suspend();
          if (routines[i]) {
            routines[i]();
          }
        }
      },
      sidebar: function (e) {
        e.preventDefault();
        let img = getImgPath(e),
          visit = false;
        if (utils.matchLink(e)) {
          toArray($q(".active", true)).forEach((el) =>
            el.classList.remove("active")
          );
          headers.show(utils.getTarget(e), true);
          visit = true;
        }
        if (img) {
          visit = true;
          looper.find(img);
        }
        if (visit) {
          player = null;
          $recur.suspend();
        }
      }
    };
  }

  function prepareHeadings(ul, conf) {
    return function (el, i, els) {
      let n = Object.values(conf[i])[0],
        j = 0,
        lis = ul.children,
        ol,
        neu;
      while (j < n) {
        if (!j) {
          ol = utils.doMake("ul")();
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
  class Finder extends Publisher {
    constructor(grp = [], kls = "active", h = []) {
      super(h);
      this.grp = grp;
      this.current = null;
      this.finder = () => null;
    }
    hide(el, click) {
      if (el && el === this.current && click) {
        this.current = null;
        return utils.undoActive(el);
      }
    }
    show(el, click) {
      if (el && !this.hide(el, click)) {
        utils.undoActiveCB(this.grp);
        this.current = utils.doActive(el);
      }
      return this.current;
    }
    setFinder(src) {
      this.finder = Finder.doFinder(src);
      return this.search();
    }
    search() {
      throw new Error("must be implemented in a subclass");
    }
    static from(grp, kls = "active") {
      return new Finder(grp, kls);
    }
    static doFinder(str) {
      return function (cur) {
        //becomes this.finder callback to findIndex
        return str.match(/\/(\w+)_/.exec(cur)[1]);
      };
    }
  }
  let $painter = null,
    throttlePause,
    getDesktop = pApply(Modernizr.mq, ipad);

  const broadcaster = Publisher.from(),
  utils = nW1.utils,
    always = utils.always,
    ptL = utils.ptL,
    looper = nW1.Looper(),
    curry2 = utils.curry2,
    curry3 = utils.curry3,
    pass = utils.pass,
    curryL2 = (fun) => (a) => (b) => fun(a, b),
    curryL33 = (fun) => (a) => (b) => (c) => () => fun(a, b, c),
    compose = utils.compose,
    doMake = utils.doMake,
    append = utils.append,
    prepend = utils.prepend,
    doText = utils.doText,
    invoke = utils.invoke,
    setKlas = utils.setKlas,
    setId = utils.setId,
    getParent = utils.getParent,
    getParent2 = utils.getParent2,
    setAttribute = utils.setAttribute,
    invokeMethod = utils.invokeMethod,
    invokeMethodBridge = utils.invokeMethodBridge,
    $ = utils.$,
    $$ = utils.$$,
    $q = utils.$q,
    $$q = utils.$$q,
    matchImg =  compose(
        curry3(invokeMethod)(/^img/i)("match"),
        curry2(utils.getter)("nodeName"),
        utils.getTarget
      ),
    getLast = (array) => array[array.length - 1],
    getTgt = (str) => $$(str),
    getImgPath = compose(utils.getImgSrc, utils.getTarget),
    setVal = curry2(setAttribute("value")),
    setMin = curry2(setAttribute("min")),
    setMax = curry2(setAttribute("max")),
    setType = curry2(setAttribute("type")),
    setSrc = curry2(setAttribute("src")),
    setAlt = curry2(setAttribute("alt")),
    abbr = (el, repl) => {
      return toArray(getResult(el).childNodes)
        .filter((node) => node.nodeType === 3)
        .map((node, i) => (node.textContent = repl[i]));
    },
    negater = function (alternators) {
      if (!getDesktop()) {
        alternators.forEach((f) => f());
        getDesktop = pApply(utils.negate, getDesktop);
      }
    },
    $recur = nW1.recurMaker(300, 99, 1, true).init(),
    routes = router($recur),
    prepAttrs = (keys, vals) => curryL33(zip)("map")(keys)(vals),
    prepare2Append = (doEl, doAttrs) =>
      compose(
        append,
        curry2(utils.invoke)(doEl),
        ptL(doIterate, "forEach"),
        doAttrs
      )(),
    doDiv = doMake("div"),
    doImg = doMake("img"),
    doH2 = compose(
      append,
      getParent,
      prepend(doMake("h2")),
      doText("Navigation")
    )(),
    doRenderNav = compose(
      prepend($$q(".submenu")),
      utils.setHref,
      getParent,
      prepend(doMake("a"))
    ),
    addClickHover = curry2(ptL(utils.lazyVal, "addEventListener", "mouseover"))(
        hover
      ).wrap(pass),
    setDiv = prepare2Append(doDiv, prepAttrs([setId], ["slidepreview"])),
    setSubMenu = prepare2Append(doDiv, prepAttrs([setKlas], ["submenu"])),
    setInnerDiv = prepare2Append(doDiv, prepAttrs([setKlas], ["inner"])),
    setPara = prepare2Append(doMake("p"), prepAttrs([setId], ["tracker"])),
    setSpan1 = prepare2Append(doMake("span"), prepAttrs([setId], ["tracked"])),
    setSpan2 = prepare2Append(doMake("span"), prepAttrs([setId], ["max"])),
    setImg = prepare2Append(doImg, prepAttrs([utils.setAlt], ["currentpicture"])),
    //setButtonLinks = prepare2Append(doImg, prepAttrs([setAlt], ['#'])),
    headings = compose(
      curry2(toArray)(curryL2(utils.negate)(utils.matchPath)),
      $$q("#navigation a", true)
    ),
    doSliderOutput = ptL(utils.setter, $$("tracked"), "innerHTML"),
    doSliderInput = ptL(utils.setter, $$("myrange"), "value"),
    addClickPreview = curry2(ptL(utils.lazyVal, "addEventListener", "click"))(
      routes.sidebar
    ).wrap(pass),
    displayPause = ptL(utils.invokeMethodV, $$("slideshow"), "classList", "pause"),
    displaySwap = curry2(ptL(invokeMethod, document.body.classList))("swap"),
    queryInplay = curry2(ptL(invokeMethod, document.body.classList))("inplay"),
    painter = function (slide, base, container) {
      let ret = {
        doOpacity: function (o) {
          let el = getResult(slide);
          el.style.opacity = o;
        },
        cleanup: function () {
          queryInplay("remove");
          displayPause("remove");
          displaySwap("remove");
          base.onload = null;
          slide.onload = null;
        }
      };
      return nW1.Publish().makepublisher(ret);
    },
    myconfig = config[document.body.id],
    pg = window.web ? 27 : 52,
    loader = function () {
      getDesktop = Mod.mq(ipad) ? getDesktop : pApply(utils.negate, getDesktop);
      //create sidebar
      compose(
        setSubMenu,
        getParent,
        getParent,
        setImg,
        setDiv,
        getParent,
        doH2,
        getParent,
        curry2(invoke)($q("#display ul")),
        prepend,
        addClickHover,
        addClickPreview,
        utils.setNavId,
        append(doMake("section")()),
        prepend($("content")),
        doMake("aside")
      )();
      myconfig
        .map(utils.getKeys)
        .map(doRenderNav)
        .forEach(prepareHeadings($q("#navigation ul"), myconfig));
      //post creation of sidebar
      headers = Finder.from(headings());
      const getExtent = $$q("#navigation ul li a", true),
        getMyLinks = compose(
          utils.curryL3(invokeMethodBridge)("map")((a) => a.getAttribute("href")),
          toArray,
          getExtent
        ),
        src = compose(utils.getAttrs("href"), utils.getZero, getExtent)(),
        machDiv = prepare2Append(doDiv, prepAttrs([setId], ["slideshow"])),
        machControls = prepare2Append(doDiv, prepAttrs([setId], ["controls"])),
        machButtons = prepare2Append(doDiv, prepAttrs([setId], ["buttons"])), //container for buttons
        machSlider = prepare2Append(
          doDiv,
          prepAttrs([setId], ["slidecontainer"])
        ),
        machSliderInput = prepare2Append(
          doMake("input"),
          prepAttrs(
            [setType, setMin, setMax, setVal, setId],
            ["range", 1, pg, 1, "myrange"]
          )
        ),
        machBase = prepare2Append(
          doImg,
          prepAttrs([setSrc, setAlt, setId], [src, "current", "base"])
        ),
        machSlide = prepare2Append(
          doImg,
          prepAttrs([setSrc, setAlt, setId], [src, "current", "slide"])
        ),
        previewer = ptL(replacePathSimple, $$q("#slidepreview img")),
        displayer = curryL2(replacePath)($$("base")),
        thumbs = Finder.from($q("#navigation ul li", true)),
        addPlayClick = curry2(ptL(utils.lazyVal, "addEventListener", "click"))(
          routes.menu
        ).wrap(pass),
        buttontext = ["start", "back", "play", "forward", "end"].map(
          utils.doTextCBNow
        ),
        sliderTxtAlt = ["", "/"],
        sliderTxt = ["Image ", " of "],
        sliderLoad = Mod.mq(ipad) ? sliderTxt : sliderTxtAlt,
        slidertext = sliderLoad.map(utils.doTextCBNow),
        sliderRestore = pApply(abbr, $$("tracker"), sliderTxt),
        sliderReplace = pApply(abbr, $$("tracker"), sliderTxtAlt),
        sliderOptions = Mod.mq(ipad)
          ? [sliderRestore, sliderReplace]
          : [sliderReplace, sliderRestore],
        sliderActions = doAlternate()(sliderOptions),
        sliderspans = [
          curry2(insertB4)($$("tracked")),
          curry2(insertB4)($$("max"))
        ],
        doSliders = (i) => {
       doSliderInput(i);
       doSliderOutput(i);
        },
        sliderBridge = function (path) {
          let members = looper.get("members"),
            i = members.findIndex(curry2(equals)(path)),
            l = members.length,
            member = members[i],
            //reached end
            j = !member ? 1 : i + 1,
            txt = getLast($("slide").src.split("/"));
          //looper members zero indexed...
          /*also as it stands looper reverses the array when the back button is pressed
                    before counting forwards may have to fix that but at the moment this undoes that */
          j = looper.get("rev") ? l - i : j;
          if (!$("base").onload || path.match(txt)) {
            doSliders(j);
          }
        },
        fixInnerHTML = (el) =>
          compose(utils.clearInnerHTML, utils.setHref, setId(el.innerHTML).wrap(pass))(el),
        buttonEl = Mod.backgroundsize ? "a" : "button",
        buttons = compose(getParent, compose(prepend, doMake)(buttonEl)),
        buttonCb = Mod.backgroundsize ? fixInnerHTML : (arg) => arg;
      compose(
        getParent,
        machSlide,
        getParent,
        machBase,
        setInnerDiv,
        getParent,
        getParent2,
        getParent2,
        append(utils.doTextNow(pg)),
        setSpan2,
        getParent2,
        append(utils.doTextNow(1)),
        setSpan1,
        setPara,
        getParent,
        machSliderInput,
        machSlider,
        addPlayClick,
        getParent,
        machButtons,
        machControls,
        machDiv
      )($("display"));
      buttontext
        .map(buttons)
        .map(utils.appendCB)
        .map(curry2(invoke)($("buttons")))
        .map(buttonCb);
      headers.search = headersSearch;
      thumbs.search = thumbsSearch;
      zip("forEach", sliderspans, slidertext);
      $slider = sliderFactory($$("myrange"));
      broadcaster.attach(headers.setFinder.bind(headers));
      broadcaster.attach(thumbs.setFinder.bind(thumbs));
      broadcaster.attach(previewer);
      broadcaster.notify(src);
      looper.build(getMyLinks(), utils.incrementer, []);
      looper.attach(displayer);
      looper.attach(broadcaster.notify.bind(broadcaster));
      looper.attach(sliderBridge);
      $painter = painter(getTgt("slide"), getTgt("base"), document.body);
      $recur.attach($painter.doOpacity.bind($painter));
      $recur.attach($painter.cleanup.bind($painter), "delete");
      $slider.attach(looper.set.bind(looper));
      sliderActions();
      window.addEventListener(
        "resize",
        pApply(throttle, pApply(negater, [sliderActions]), 222)
      );
      setTimeout(function () {
        compose(utils.applyPortait($("wrapper")), utils.doCompare)($("base"));
        compose(utils.applyPortait($("navigation")), utils.doCompare)($("base"));
      }, 666);
    };
  window.addEventListener("load", loader);
}(
  {
    web: [
      {
        FOP: 4
      },
      {
        AFEN: 3
      },
      {
        "Distillery House": 3
      },
      {
        "Benson Design": 4
      },
      {
        BP: 2
      },
      {
        UKOOA: 4
      },
      {
        "Orkney Holiday Cottages": 3
      },
      {
        "Safari Afrika": 4
      }
    ],
    print: [
      {
        "Concilliation Resources": 12
      },
      {
        "Rory Peck Trust": 12
      },
      {
        IWPR: 8
      },
      {
        "The FreedomForum": 7
      },
      {
        "Reporting The World": 8
      },
      {
        "London Fields Cycles": 5
      }
    ]
  },
  Modernizr,
  "(min-width: 1024px)"
));
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
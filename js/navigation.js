/*jslint nomen: true */
/*global Modernizr: false */
/*global Publisher: false */
/*global nW1: false */
/* eslint-disable indent */

(function (Mod, ipad, mob) {
  "use strict";

  let $wrapper = {};

  function getResult(o) {
    if (typeof o === "function") {
      return o();
    }
    return o;
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
  function headersSearch() {
    const links = getLinksDeep(toArray(this.grp)),
      i = links
        .map((strs) => strs.findIndex(this.finder))
        .findIndex((n) => n >= 0);
    return compose(this.notify.bind(this), this.show.bind(this))(this.grp[i]);
  }

  function thumbsSearch() {
    const paths = getLinks(toArray(this.grp)),
    [first, second] = paths.filter(this.finder),
    hi = paths.findIndex( cur => cur === second),
    lo = paths.findIndex( cur => cur === first);
    //img1.jpg would match the condition before img10.jpg, so use the second if > -1, ie exists;
    return this.show(this.grp[Math.max(hi, lo)]);
  }

  function makePortrait(el = nW1.meta.$("wrapper")) {
    let kls = this.naturalHeight > this.naturalWidth ? "portrait" : "";
    $wrapper.notify(kls);
    //https://stackoverflow.com/questions/49241330/javascript-domtokenlist-prototype
    if (el === nW1.meta.$("wrapper")) {
      el.classList = kls;
    }
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
        const func = meta.doAlternate(),
          displayPause = ptL(
            meta.invokeMethodV,
            $$("slideshow"),
            "classList",
            "pause"
          ),
          exec = compose(
            displayPause,
            meta.always("remove"),
            $recur.play.bind($recur, true)
          ),
          undo = compose(
            displayPause,
            meta.always("add"),
            $recur.suspend.bind($recur, null)
          );
        return func([exec, undo]);
      },
      loop = deferPTL(meta.invokeMethodBind, nW1.Looper),
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
          which = curry2(ptL(invokeMethodBridge, "match"))(found),
          i = [/^start$/, /^back$/, /^forward$/, /^end$/].findIndex(which);
        player = player || playMaker();
        if (found.match(/^p/i)) {
          nW1.Looper.setStrategy(true);
          player();
        } else {
          player = null;
          nW1.Looper.setStrategy();
          $recur.suspend();
          if (routines[i]) {
            routines[i]();
          }
        }
      },
      sidebar: function (e) {
        e.preventDefault();
        let img = utils.getImgPath(e),
          visit = false;
          toArray($Q(".active", true)).forEach((el) =>
            el.classList.remove("active")
          );
        if (utils.matchLink(e)) {
          headers.show(utils.getTarget(e), true);
          visit = true;
        }
        if (img) {
          visit = true;
          nW1.Looper.find(img);
          utils.doActive(utils.getTargetNode(e.target, /li/i, 'parentNode'));
          makePortrait.call(e.target);
        }
        if (visit) {
          player = null;
          $recur.suspend();
        }
      }
    };
  } //router
  let $painter = null,
    throttlePause,
    getDesktop = nW1.meta.pApply(Modernizr.mq, ipad);
  const meta = nW1.meta,
    Finder = nW1.getFinder(),
    utils = nW1.utils,
    broadcaster = Publisher.from(),
    looper = nW1.Looper,
    $ = meta.$,
    $$ = meta.$$,
    $Q = meta.$Q,
    $$Q = meta.$$Q,
    compose = meta.compose,
    curry2 = meta.curryRight(2),
    curry22 = meta.curryRight(2, true),
    curryL2 = meta.curryLeft(2),
    curry3 = meta.curryRight(3),
    curryL3 = meta.curryLeft(3),
    curryL33 = meta.curryLeft(3, true),
    invoke = meta.invoke,
    invokeMethod = meta.invokeMethod,
    invokeMethodBridge = meta.invokeMethodBridge,
    ptL = meta.doPartial(),
    deferPTL = meta.doPartial(true),
    pApply = meta.pApply,
    doMake = utils.doMake,
    getTgt = (str) => $(str),
    getAttribute = ptL(invokeMethodBridge, "getAttribute"),
    getLinks = (grp) => {
      const get = curry3(utils.getTargetNode)("firstChild")(/^a$/i);
      return grp.map((lis) => compose(utils.getAttrs("href"), get)(lis));
    },
    getLinksDeep = (grp) => {
      const ul = grp.map(curry3(utils.getTargetNode)("nextSibling")(/ul/i)),
        lis = ul.map(({ children }) => meta.toArray(children));
      return lis.map(getLinks);
    },
    getHref = (a) => a.getAttribute("href"),
    matchImg = compose(
      curry3(invokeMethod)(/^img/i)("match"),
      curry2(meta.getter)("nodeName"),
      utils.getTarget
    ),
    resolvePath = (o, src, tgt = meta.$("wrapper")) => {
      let el = getResult(o),
        f = ptL(meta.invokePair, el, "setAttribute", "src"),
        repl =
          el.id === "base"
            ? src
            : src.replace("thumbs", "fullsize").replace("tmb", "fs");
      f(repl);
     el.onload = el.onload || makePortrait.bind(el, tgt);
    // el.addEventListener('load', makePortrait.bind(el, tgt));
    },
    hover = (e) => {
      const preview = meta.$Q("#slidepreview img");
      preview.onload = null;
      if (meta.$("slide").onload) {
        return;
      }
      if (matchImg(e) && e.target !== preview) {
        resolvePath(
          preview,
          getAttribute("src")(e.target),
          meta.$("navigation")
        );
      }
    },
    addClickHover = curry2(ptL(meta.lazyVal, "addEventListener", "mouseover"))(
      hover
    ),
    append = utils.append,
    prepend = utils.prepend,
    getParent = utils.getParent,
    setId = utils.setId,
    setAlt = utils.setAlt,
    setSrc = utils.setSrc,
    setter = meta.setter,
    toArray = meta.toArray,
    negate = meta.negate,
    abbr = (el, repl) => {
      let isEl = (node) => node.nodeType === 3,
        setText = (node, i) => (node.textContent = repl[i]);
      return meta.toArray(getResult(el).childNodes).filter(isEl).map(setText);
    },
    isDesktop = function (alternators) {
      if (!getDesktop()) {
        alternators.forEach((f) => f());
        getDesktop = pApply(meta.negate, getDesktop);
      }
    },
    $recur = nW1.recurMaker(300, 99, 1, true).init(),
    routes = router($recur),
    prepAttrs = (keys, vals) => curryL33(meta.zip)("map")(keys)(vals),
    prep2Append = (doEl, doAttrs) =>
      compose(
        append,
        curry2(invoke)(doEl),
        ptL(doIterate, "forEach"),
        doAttrs
      )(),
    doDiv = doMake("div"),
    doImg = doMake("img"),
    setInnerDiv = prep2Append(doDiv, prepAttrs([utils.setKlas], ["inner"])),
    setPara = prep2Append(doMake("p"), prepAttrs([setId], ["tracker"])),
    setSpan1 = prep2Append(doMake("span"), prepAttrs([setId], ["tracked"])),
    setSpan2 = prep2Append(doMake("span"), prepAttrs([setId], ["max"])),
    //setButtonLinks = prep2Append(doImg, prepAttrs([setAlt], ['#'])),
    headings = compose(
      curry2(toArray)(curryL2(negate)(utils.matchPath)),
      $$Q("#navigation a", true)
    ),
    doSliderOutput = ptL(setter, $$("tracked"), "innerHTML"),
    doSliderInput = ptL(setter, $$("myrange"), "value"),
    addClickPreview = curry2(ptL(meta.lazyVal, "addEventListener", "click"))(
      routes.sidebar
    ).wrap(meta.pass),
    displayPause = ptL(
      meta.invokeMethodV,
      $$("slideshow"),
      "classList",
      "pause"
    ),
    bodyKlas = curry2(ptL(invokeMethod, document.body.classList)),
    displaySwap = bodyKlas("swap"),
    queryInplay = bodyKlas("inplay"),
    painter = function (slide, base) {
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
    m = meta.mittelFactory(),
    f = m(meta.setter, "classList"),
    prepClassListNav = meta.pApply(f, meta.$$("navigation")),
    pg = window.web ? 27 : 52,
    gtThanEq = (a, b) => a >= b,
    loader = function () {
      getDesktop = Mod.mq(ipad) ? getDesktop : pApply(negate, getDesktop);
      //post creation of sidebar
      headers = Finder.from(headings());
      $wrapper = nW1.Publish().makepublisher(meta.$$("wrapper"));
      $wrapper.attach(prepClassListNav);

      addClickPreview($("navigation"));
      addClickHover($("navigation"));

      const getExtent = $$Q("#navigation ul li a", true),
        getMyLinks = compose(
          curryL3(invokeMethodBridge)("map")(getHref),
          toArray,
          getExtent
        ),
        src = compose(utils.getAttrs("href"), utils.getZero, getExtent)(),
        machDiv = prep2Append(doDiv, prepAttrs([setId], ["slideshow"])),
        machControls = prep2Append(doDiv, prepAttrs([setId], ["controls"])),
        machButtons = prep2Append(doDiv, prepAttrs([setId], ["buttons"])), //container for buttons
        machSlider = prep2Append(doDiv, prepAttrs([setId], ["slidecontainer"])),
        attrs = [utils.setType, utils.setMin, utils.setMax, utils.setVal, setId],
        machSliderInput = prep2Append(
          doMake("input"),
          prepAttrs(attrs, ["range", 1, pg, 1, "myrange"])
        ),
        machBase = prep2Append(
          doImg,
          prepAttrs([setSrc, setAlt, setId], [src, "current", "base"])
        ),
        machSlide = prep2Append(
          doImg,
          prepAttrs([setSrc, setAlt, setId], [src, "current", "slide"])
        ),
        previewer = ptL(resolvePath, $$Q("#slidepreview img")),
        displayer = curryL2(resolvePath)($$("base")),
        //projector = curryL2(resolvePath)($$("slide")),
        thumbs = Finder.from($Q("#navigation ul li", true)),
        addPlayClick = curry2(ptL(meta.lazyVal, "addEventListener", "click"))(
          routes.menu
        ).wrap(meta.pass),
        buttontext = ["start", "back", "play", "forward", "end"].map(
          utils.doTextCBNow
        ),
        sliderTxtAlt = ["", "/"],
        sliderTxt = ["Image ", " of "],
        sliderLoad = Mod.mq(ipad) ? sliderTxt : sliderTxtAlt,
        slidertext = sliderLoad.map(utils.doTextCBNow),
        sliderRestore = curry22(abbr)(sliderTxt)($$("tracker")),
        sliderReplace = curry22(abbr)(sliderTxtAlt)($$("tracker")),
        sliderOptions = Mod.mq(ipad)
          ? [sliderRestore, sliderReplace]
          : [sliderReplace, sliderRestore],
        sliderActions = meta.doAlternate()(sliderOptions),
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
            i = members.findIndex(curry2((a, b) => a === b)(path)),
            l = members.length,
            member = members[i],
            //reached end
            j = !member ? 1 : i + 1,
            txt = utils.getLast($("slide").src.split("/"));
          //looper members zero indexed...
          /*also as it stands looper reverses the array when the back button is pressed
                      before counting forwards may have to fix that but at the moment this undoes that */
          j = looper.get("rev") ? l - i : j;
          if (!$("slide").onload || path.match(txt)) {
            doSliders(j);
          }
        },
        fixInnerHTML = (el) =>
          compose(
            utils.clearInnerHTML,
            utils.setHref,
            setId(el.innerHTML).wrap(meta.pass)
          )(el),
        buttonEl = Mod.backgroundsize ? "a" : "button",
        buttons = compose(getParent, compose(prepend, doMake)(buttonEl)),
        buttonCb = Mod.backgroundsize ? fixInnerHTML : (arg) => arg,
        climb = compose(getParent, utils.getParent2, utils.getParent2),
        setState = ptL(meta.eitherOr, "add", "remove"),
        doCompare = compose(
          setState,
          curry3(meta.compare(gtThanEq))("naturalWidth")("naturalHeight")
        );
      compose(
        getParent,
        machSlide,
        getParent,
        machBase,
        setInnerDiv,
        climb,
        append(utils.doTextNow(pg)),
        setSpan2,
        utils.getParent2,
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
      meta.zip("forEach", sliderspans, slidertext);
      $slider = sliderFactory($$("myrange"));
      broadcaster.attach(headers.setFinder.bind(headers));
      broadcaster.attach(thumbs.setFinder.bind(thumbs));
      broadcaster.attach(previewer);
      broadcaster.notify(src);
      looper.build(getMyLinks(), utils.incrementer, []);
      looper.attach(displayer);
      //looper.attach(projector);
      looper.attach(broadcaster.notify.bind(broadcaster));
      looper.attach(sliderBridge);
      $painter = painter(getTgt("slide"), getTgt("base"), document.body);
      $recur.attach($painter.doOpacity.bind($painter));
      $recur.attach($painter.cleanup.bind($painter), "delete");
      $slider.attach(looper.set.bind(looper));
      sliderActions();
      //$Q('.active').classList.remove('active');

      window.addEventListener(
        "resize",
        pApply(throttle, pApply(isDesktop, [sliderActions]), 222)
      );

      window.setTimeout(function () {
        compose(utils.applyPortrait($("wrapper")), doCompare)($("base"));
        compose(utils.applyPortrait($("navigation")), doCompare)($("base"));
      }, 666);
    };
  window.addEventListener("load", loader);
}(Modernizr, "(min-width: 1024px)", "(max-width: 667px)"));
/*

  FOP : 17/12/14
  BENSON
  AFEN : 01/08/15
  DIS HOUSE 30/04/16
  BP 11/06/12
  UKOOA 15/10/13   23/12/15
  ORKNEY 26/04/10 08/10/20
  SAFARI 31/10/04 - 26/02/04  -22/03/04
      getMobile = nW1.meta.pApply(Modernizr.mq, mob);
        window.addEventListener(
        "resize",
        pApply(throttle, pApply(isMobile, [sliderActions]), 222)
      );
       sliderLoad = Mod.mq(ipad) || Mod.mq(mob) ? sliderTxt : sliderTxtAlt,
       sliderOptions = Mod.mq(ipad) || Mod.mq(mob)
       getMobile = Mod.mq(mob) ? getMobile : pApply(negate, getMobile);
         isMobile = function (alternators) {
      if (!getMobile()) {
        alternators.forEach((f) => f());
        getMobile = pApply(meta.negate, getMobile);
      }
    },
  */

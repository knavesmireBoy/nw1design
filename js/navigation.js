/*jslint nomen: true */
/*global Modernizr: false */
/*global Publisher: false */
/*global Header: false */
/*global Thumbs: false */
/*global Slider: false */
/*global nW1: false */
/* eslint-disable indent */

(function (Mod, ipad) {
  "use strict";

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
//await domContent...
  let $wrapper = Publisher.from(), 
    $slider = {},
    $painter = {},
    $mediator = {},
    throttlePause,
    getDesktop = nW1.meta.pApply(Modernizr.mq, ipad);

  const meta = nW1.meta,
    utils = nW1.utils,
    $broadcaster = Publisher.from(),
    looper = nW1.Looper,
    $ = meta.$,
    $$ = meta.$$,
    $Q = meta.$Q,
    $$Q = meta.$$Q,
    compose = meta.compose,
    getResult = meta.getResult,
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
    pApply = meta.pApply,
    doMakeDefer = utils.doMakeDefer,
    getById = (str) => $(str),
    getStyle = curry2(meta.getter)("style"),
    setProperty = meta.pApply(
      meta.mittelFactory(getStyle),
      meta.invokePair,
      "setProperty"
    ),
    sliderFactory = function (element) {
      let $s = new Slider();
      $s.init(element);
      return $s;
    },
    setDisplay = setProperty("display"),
    hide = compose(curry2(setDisplay)("none")),
    getHref = (a) => a.getAttribute("href"),
    matchImg = compose(
      curry3(invokeMethod)(/^img/i)("match"),
      curry2(meta.getter)("nodeName"),
      utils.getTarget
    ),
    //ES5; need access to this
    makePortrait = function (el = nW1.meta.$("wrapper")) {
      let kls = this.naturalHeight > this.naturalWidth ? "portrait" : "";
      $wrapper.notify(kls);
      //https://stackoverflow.com/questions/49241330/javascript-domtokenlist-prototype
      if (el === $("wrapper")) {
        el.classList = kls;
      }
    },
    resolvePath = (o, src, tgt = meta.$("wrapper")) => {
      let el = getResult(o),
        repl =
          el.alt === "currentpicture"
            ? src.replace("thumbs", "fullsize").replace("tmb", "fs")
            : src;
      setSrc(repl)(el);
      el.onload = el.onload || makePortrait.bind(el, tgt);
    },
    hover = (e) => {
      const preview = meta.$Q("#slidepreview img");
      preview.onload = null;
      if (meta.$("slide").onload) {
        return;
      }
      if (matchImg(e) && e.target !== preview) {
        resolvePath(preview, utils.getImgPath(e), meta.$("navigation"));
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
    doIterate = (m, funs) => {
      return (o) => {
        if (funs) {
          let obj = getResult(o);
          funs[m]((f) => f(obj));
          return obj;
        }
        return o;
      };
    },
    attach = Publisher.attachAll,
    $recur = nW1.recurMaker(300, 99, 1, true).init(),
    routes = nW1.router($recur),
    prepAttrs = (keys, vals) => curryL33(meta.zip)("map")(keys)(vals),
    prep2Append = (doEl, doAttrs) =>
      compose(
        append,
        curry2(invoke)(doEl),
        ptL(doIterate, "forEach"),
        doAttrs
      )(),
    doDiv = doMakeDefer("div"),
    doImg = doMakeDefer("img"),
    setInnerDiv = prep2Append(doDiv, prepAttrs([utils.setKlas], ["inner"])),
    setPara = prep2Append(doMakeDefer("p"), prepAttrs([setId], ["tracker"])),
    setSpan1 = prep2Append(
      doMakeDefer("span"),
      prepAttrs([setId], ["tracked"])
    ),
    setSpan2 = prep2Append(doMakeDefer("span"), prepAttrs([setId], ["max"])),
    headings = compose(
      curry2(toArray)(curryL2(negate)(utils.matchPath)),
      $$Q("#navigation a", true)
    ),
    doSliderOutput = ptL(setter, $$("tracked"), "innerHTML"),
    doSliderInput = ptL(setter, $$("myrange"), "value"),
    addClickPreview = curry2(ptL(meta.lazyVal, "addEventListener", "click"))(
      routes.sidebar
    ).wrap(meta.pass),
    m = meta.mittelFactory(),
    f = m(meta.setter, "classList"),
    prepClassListNav = meta.pApply(f, meta.$$("navigation")),
    pg = window.web ? 27 : 52,
    gtThanEq = (a, b) => a >= b,
    /////LOADER//////////LOADER//////////LOADER//////////LOADER//////////LOADER/////
    loader = function () {
      getDesktop = Mod.mq(ipad) ? getDesktop : pApply(negate, getDesktop);
      //post creation of sidebar
      //$wrapper = nW1.Publish().makepublisher(meta.$$("wrapper"));
      $wrapper.attach(prepClassListNav);
      addClickPreview($("navigation"));
      addClickHover($("navigation"));

      const $headers = Header.from(headings()),
        getExtent = $$Q("#navigation ul li a", true),
        getMyLinks = compose(
          curryL3(invokeMethodBridge)("map")(getHref),
          toArray,
          getExtent
        ),
        insertB4 = (neu, elm) => {
          const el = getResult(elm),
            p = el.parentNode;
          return p.insertBefore(getResult(neu), el);
        },
        src = compose(utils.getAttrs("href"), utils.getZero, getExtent)(),
        machDiv = prep2Append(doDiv, prepAttrs([setId], ["slideshow"])),
        machControls = prep2Append(doDiv, prepAttrs([setId], ["controls"])),
        machButtons = prep2Append(doDiv, prepAttrs([setId], ["buttons"])), //container for buttons
        machSlider = prep2Append(doDiv, prepAttrs([setId], ["slidecontainer"])),
        attrs = [
          utils.setType,
          utils.setMin,
          utils.setMax,
          utils.setVal,
          setId
        ],
        machSliderInput = prep2Append(
          doMakeDefer("input"),
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
        previewUpdate = (data) => {
          setSrc(getResult(data))(meta.$Q("#slidepreview img"));
        },
        displayer = curryL2(resolvePath)($$("base")),
        //projector = curryL2(resolvePath)($$("slide")),
        $thumbs = Thumbs.from($Q("#navigation ul li", true)),
        addPlayClick = curry2(ptL(meta.lazyVal, "addEventListener", "click"))(
          routes.menu
        ).wrap(meta.pass),
        buttontext = ["start", "back", "play", "forward", "end"].map(
          utils.doTextCBNow
        ),
        sliderTxtAlt = ["", " of "],
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
          let mypath = getResult(path),
            members = looper.get("members"),
            i = members.findIndex(curry2((a, b) => a === b)(mypath)),
            l = members.length,
            member = members[i],
            //reached end
            j = !member ? 1 : i + 1,
            txt = utils.getLast($("slide").src.split("/"));
          //looper members zero indexed...
          /*also as it stands looper reverses the array when the back button is pressed
                      before counting forwards. may have to fix that but at the moment this undoes that */
          j = looper.get("rev") ? l - i : j;
          if (!$("slide").onload || mypath.match(txt)) {
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
        buttons = compose(getParent, compose(prepend, doMakeDefer)(buttonEl)),
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
      meta.zip("forEach", sliderspans, slidertext);

      $slider = sliderFactory($$("myrange"));

      attach($broadcaster, null, [
        [$headers.setFinder.bind($headers)],
        [$thumbs.setFinder.bind($thumbs)],
        [previewer]
      ]);
      $broadcaster.notify(src);
      looper.build(getMyLinks(), utils.incrementer, []);
      attach(looper, null, [
        [displayer],
        [$broadcaster.notify.bind($broadcaster)],
        [sliderBridge]
      ]);
      $painter = nW1.Painter.from(getById("slide"), getById("base"), $recur);
      $mediator = nW1.Mediator.from(looper, $painter, $recur),
      attach($recur, $painter, [
        ["updateOpacity", "opacity"],
        ["cleanup", "delete"]
      ]);

      //when "base" pic is hidden we need "slide" pic to inform subscribers of the new path to image
      attach(
        $painter,
        null,
        [
          [previewUpdate],
          [sliderBridge],
          [$thumbs.setFinder.bind($thumbs)],
          [$headers.setFinder.bind($headers)]
        ],
        "swap"
      );
      attach($recur, null, [
        [$mediator.next.bind($mediator), "base"],
        [$mediator.update.bind($mediator), "update"]
      ]);

      $slider.attach(looper.set.bind(looper));

      $painter.attach($recur.setPlayer.bind($recur), "query");
      $recur.attach($mediator.exit, "delete");
      sliderActions();
      window.addEventListener(
        "resize",
        pApply(throttle, pApply(isDesktop, [sliderActions]), 222)
      );

      window.setTimeout(function () {
        compose(utils.applyPortrait($("wrapper")), doCompare)($("base"));
        compose(utils.applyPortrait($("navigation")), doCompare)($("base"));
      }, 666);
      hide(meta.$("slide"));
    };
  window.addEventListener("load", loader);
}(Modernizr, "(min-width: 1024px)"));

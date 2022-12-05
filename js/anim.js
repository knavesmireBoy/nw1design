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
    exit.opacity = Math.min(fadeEl.style.opacity, 0.45);
    toggle("inplay", "pause");
  }

  function enter(x) {
    timer = 1;
    doFade(exit.opacity || x);
    toggle("pause", "inplay");
  }

  function getNext(el) {
    return nW1.utils.getNextElement(el) || nW1.utils.getPrevElement(el);
  }

  function toggle(a, b) {
    container.classList.remove(a);
    container.classList.add(b);
  }

  let fadeEl = null,
    j = 3;

  const meta = nW1.meta,
    utils = nW1.utils,
    pass = meta.pass,
    curry22 = meta.curryRight(2, true),
    paths = [1, 2, 3, 4].map(
      (n) => "./assets/img/misc/bensondesign" + n + "_fs.jpg"
    ),
    makeDiv = meta.compose(
      utils.prepend,
      curry22(utils.insertNeu)(1),
      utils.setId("benami").wrap(pass),
      meta.invoker(utils.doMake("div")),
      utils.prepend,
      meta.$Q
    )("main > aside section"),
    cb = (path, i, grp) => {
      if (grp[i + 1]) {
        return meta.compose(
        makeDiv,
          utils.setSrc(path).wrap(pass),
          utils.doMake
        )("img");
      }
        return meta.$('benami');
    },
    [container] = paths.map(cb).reverse(),
    getNextNum = (n) => n % paths.length,
    defer = (fun) => (arg) => () => fun(arg),
    shuffle = (el) => {
      el.insertBefore(fadeEl, getNext(el.firstChild));
    },
    doFade = (i = 101) => {
      fadeEl.style.opacity = i / 100;
      return setTimeout(defer(fader)(i), 7);
    },
    doAlt = meta.doAlternate()([enter, exit]),
    fader = function (i) {
      i -= 1;
      if (timer) {
        if (i >= 0) {
          timer = doFade(i);
        } else {
          shuffle(container);
          fadeEl.style.opacity = 1;
          //outgoing element sent to bottom of pile, but will need to be 100% opacity when it becomes base element
          fadeEl = getNext(container.lastChild);
          getNext(container.firstChild).src = paths[getNextNum(j++)];
          setTimeout(defer(fader)(101), 2222);
        }
      }
    };
  return (e) => {
    fadeEl = getNext(e.currentTarget.lastChild);
    doAlt(101);
  };
}());

nW1.meta.$('benami').addEventListener("click", anim);

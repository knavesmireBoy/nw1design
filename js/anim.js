/*jslint nomen: true */
/*global nW1: false */
/* eslint-disable indent */
/* eslint-disable max-len */
/* eslint-disable no-param-reassign */

/*
elected not to use this in favour of css animation
however, this is a slight improvement on previous attempts where we set the src attribute of the image
on both the fading element and the base element
in this version we shuffle 3 images
when the top image has faded to zero opacity we move it to the bottom of the dom stack and start fading the new top image, the just faded element src attribute gets set to the next element in an array of paths. Using a third element helps because the delay caused by setting the path is concealed, experimented with the 2 image approach but this offered no advantage to the swapping method used before. To be fair the first experiment with this "shuffle" approach had 4 images and it was hardly worth while just using 3 as with 4 no src setting is required, we just shuffle and fade
and so I would say it only becomes worthwhile with 5 plus images, but keeping this for reference

here's the css, using a background image for the play button and fading top image slightly (.85) on load, so we can just make it out on load

#container img {
  float: left;
  cursor: pointer;
}
#container {
  margin: 1em 1em .5em;
  position: relative;
  overflow: hidden;
  background: url(./assets/bg/misc/play.png) no-repeat center / 30%;
  background: url(../assets/bg/misc/play.png) no-repeat right top / 5%;
}
//middle image
#container img {
  //allows us to view the play button on load
  opacity: .1;
}
#container img:first-child {
  display: none;
}
#container img:last-child {
  margin-left: -100%;
  display: block;
  opacity: .85;
}
#container.inplay img {
  opacity: 1;
}
#container.pause img {
  opacity: 0.5 !important;
}
*/
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
      return meta.$("benami");
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

nW1.meta.$("benami").addEventListener("click", anim);

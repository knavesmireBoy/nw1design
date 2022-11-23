/*jslint nomen: true */
/* eslint-disable indent */

/*global nW1: false */
if (!window.nW1) {
  window.nW1 = {};
}
let meta = nW1.meta,
  utils = nW1.utils,
  pass = meta.pass,
  curry4 = meta.curryRight(4),
  ptl = meta.doPartial(1),
  setAttrs = curry4(meta.invokePair),
  setId = setAttrs("circle")("id")("setAttribute"),
  setHref = setAttrs(".")("href")("setAttribute"),
  setAlt = setAttrs("")("alt")("setAttribute"),
  setSrc = setAttrs("./assets/img/circle1.png")("src")("setAttribute"),
  doAlt = meta.doAlternate(),
  anc = meta.$Q("main > section"),
  [img, link] = ["img", "a"].map((el) => document.createElement(el)),
  splat = meta.compose(
    utils.getParent,
    setSrc.wrap(pass),
    setAlt.wrap(pass),
    utils.append(img),
    setHref.wrap(pass),
    setId.wrap(pass),
    utils.append(link)
  )(anc),
  outbound = utils.prepend(meta.$Q("main > aside")),
  inbound = utils.prepend(anc),
  func = ptl(meta.setterBridge(), meta.$("innerwrap"), "classList"),
  exec = meta.compose(func("alt"), outbound),
  undo = meta.compose(func(""), inbound);
splat.addEventListener("click", function (e) {
    e.preventDefault();
    doAlt([exec, undo])(this);
});

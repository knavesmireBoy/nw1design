/*jslint nomen: true */
/*global nW1: false */
/* eslint-disable indent */

const meta = nW1.meta,
ptL = meta.doPartial(),
setter = meta.setter,
doSliderOutput = ptL(setter, meta.$$("tracked"), "innerHTML"),
doSliderInput = ptL(setter, meta.$$("myrange"), "value"),
doSliders = (i) => {
    doSliderInput(i);
    doSliderOutput(i + 1);
  },
  staticSlider = function(path) {
    const i = getCurrentIndex(path);
    doSliders(i);
  },
  inPlaySlider = function(path){
    const mypath = getResult(path),
    i = getCurrentIndex(path),
    txt = utils.getLast($("slide").src.split("/"));
    if(mypath.match(txt)){
      doSliders(i);
    }
};
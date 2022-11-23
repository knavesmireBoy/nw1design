/*jslint nomen: true */
/* eslint-disable indent */

/*global nW1: false */
if (!window.nW1) {
    window.nW1 = {};
  }
  
  let meta = nW1.meta,
    utils = nW1.utils,
    splat = meta.$('splat');

    splat.addEventListener('click', function () {
        meta.$('innerwrap').classList.add('alt');
        let tgt = meta.$Q('main > aside');
        tgt.appendChild(this);
        tgt.style.position = "relative";
    });
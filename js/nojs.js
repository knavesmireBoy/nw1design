/*jslint nomen: true */
/* eslint-disable indent */

/*global nW1: false */
if (!window.nW1) {
  window.nW1 = {};
}

let myutils = nW1.utils,
  ops = nW1.ops,
  ULS = myutils.$$Q("aside ul", 1),
  links = myutils.toArray(myutils.$Q("aside a", 1)),
  labels = myutils.toArray(myutils.$Q("aside label", 1)),
  divs,
  toLis = (a, i) => {
    let li = document.createElement("li"),
      preview = document.createElement("div"),
      img = document.createElement("img"),
      div = a.parentNode;
    li.appendChild(a);
    div.appendChild(li);
    if (!i) {
      preview = myutils
        .$("navigation")
        .insertBefore(preview, myutils.$Q(".submenu"));
      preview.setAttribute("id", "slidepreview");
      preview.appendChild(img);
      img.setAttribute("alt", "currentpicture");
      img.setAttribute("src", a.getAttribute("href"));
    }
  },
  toHead = (label) => {
    let input = ops.getPrevElement(label.previousSibling),
      link = document.createElement("a"),
      list = document.createElement("ul"),
      div = label.parentNode;
    link.innerHTML = label.innerHTML;
    div.removeChild(input);
    div.insertBefore(list, label);
    div.insertBefore(link, list);
    link.setAttribute('href', '.');
    div.removeChild(label);
  },
  toFrag = (div, i) => {
    let frag = document.createDocumentFragment(),
      nodes = myutils.toArray(div.children),
      tgt = myutils.$Q(".submenu");
    nodes.forEach((kid) => frag.appendChild(kid));
    tgt.appendChild(frag);
    div.parentNode.removeChild(div);
  };

links.forEach(toLis);
labels.forEach(toHead);

myutils.toArray(ULS()).forEach((ul) => {
  let li;
  while ((li = ops.getNextElement(ul.nextSibling))) {
    ul.appendChild(li);
  }
});
divs = myutils.toArray(myutils.$Q(".submenu > div", 1));
divs.forEach(toFrag);

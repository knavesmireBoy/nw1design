/*jslint nomen: true */
/* eslint-disable indent */

/*global nW1: false */
if (!window.nW1) {
  window.nW1 = {};
}

let mymeta = nW1.meta,
  utils = nW1.utils,
  ULS = mymeta.$$Q("aside ul", 1),
  links = mymeta.toArray(mymeta.$Q("aside a", 1)),
  labels = mymeta.toArray(mymeta.$Q("aside label", 1)),
  divs,
  toLis = (a, i) => {
    let [li, preview, img] = ["li", "div", "img"].map((txt) =>
        document.createElement(txt)
      ),
      div = a.parentNode;
    mymeta.compose(utils.prepend(div), utils.getParent, utils.prepend(li))(a);
    if (!i) {
      preview = mymeta
        .$("navigation")
        .insertBefore(preview, mymeta.$Q(".submenu"));
      preview.setAttribute("id", "slidepreview");
      preview.appendChild(img);
      img.setAttribute("alt", "currentpicture");
      img.setAttribute("src", a.getAttribute("href"));
    }
  },
  toHead = (label) => {
    let input = utils.getPrevElement(label.previousSibling),
      [link, list] = ["a", "ul"].map((txt) => document.createElement(txt)),
      div = label.parentNode;
    link.innerHTML = label.innerHTML;
    div.removeChild(input);
    div.insertBefore(list, label);
    div.insertBefore(link, list);
    link.setAttribute("href", ".");
    div.removeChild(label);
  },
  toFrag = (div, i) => {
    let frag = document.createDocumentFragment(),
      nodes = mymeta.toArray(div.children),
      tgt = mymeta.$Q(".submenu");
    nodes.forEach((kid) => frag.appendChild(kid));
    tgt.appendChild(frag);
    div.parentNode.removeChild(div);
  };

links.forEach(toLis);
labels.forEach(toHead);

mymeta.toArray(ULS()).forEach((ul) => {
  let li;
  while ((li = utils.getNextElement(ul.nextSibling))) {
    ul.appendChild(li);
  }
});
divs = mymeta.toArray(mymeta.$Q(".submenu > div", 1));
divs.forEach(toFrag);

console.log(mymeta.$('splat'));

 function doPartial(flag) {
     return function p(f, ...vs) {
         if (f.length === vs.length) {
             return flag ? () => f(...vs) : f(...vs);
         }
         return (...rest) => p(f, ...vs, ...rest);
     };
 }

 function doReturn(ptl, o) {
     ptl(o);
     return o;
 }

 if (typeof Function.prototype.wrap === 'undefined') {
     Function.prototype.wrap = function (wrapper, ..._vs) {
         let _method = this; //the function
         return function (...vs) {
             return wrapper.apply(this, [_method.bind(this), ..._vs, ...vs]);
         };
     };
 }

 function remove() {
     let tgt = this.parentNode;
     tgt.parentNode.removeChild(tgt);
 }

 function getResult(o) {
     if (typeof o === 'function') {
         return o();
     }
     return o;
 }


 function FF(m, funs, o) {
     o = getResult(o);
     return funs[m]((f) => f(o));
 }

 function EE(m, funs) {
     return function (o) {
         o = getResult(o);
         funs[m]((f) => f(o));
         return o;
     };
 }

 function zip(m, funs, vals) {
     return vals[m]((v, i) => funs[i](v));
 }

 function find(reg) {
     return function (node) {
         while (!node.nodeName.match(reg)) {
             node = node.parentNode;
         }
     }
     return node;
 }


 const deferPTL = doPartial(true),
     ptL = doPartial(),
     //con = (v) => console.log(v),
     compose = (...fns) => fns.reduce((f, g) => (...vs) => f(g(...vs))),
     getter = (o, p) => o[p],
     curry2 = fun => b => a => fun(a, b),
     lightbox = document.querySelector('.lightbox'),
     invoke = (f, v) => f(v),
     invokeMethod = (o, m, v) => o[m](v),
     lazyInvoke2 = (m, p, o, v) => o[m](p, v),
     invokeMethodBridge = (m, v, o) => {
         return invokeMethod(getResult(o), m, v);
     },
     invokeMethodBridgeCB = (cb) => (m, v, o) => {
         return invokeMethod(cb(o), m, v);
     },

     getParent = curry2(getter)('parentNode'),
     doMake = deferPTL(invokeMethod, document, 'createElement'),
     doText = ptL(invokeMethod, document, 'createTextNode'),
     doMakeNow = ptL(invokeMethod, document, 'createElement'),
     getClassList = curry2(getter)('classList'),
     getTarget = curry2(getter)('target'),
     getAttribute = ptL(invokeMethodBridge, 'getAttribute'),
     getParentAttribute = ptL(invokeMethodBridgeCB(getParent), 'getAttribute'),
     setAttribute = ptL(lazyInvoke2, 'setAttribute'),
     addListener = curry2(ptL(lazyInvoke2, 'addEventListener', 'click'))(remove),
     setSrc = curry2(setAttribute('src')),
     setAlt = curry2(setAttribute('alt')),
     doOverlay = ptL(invokeMethodBridge, 'add', 'overlay'),
     doDiv = doMake('div'),
     doImg = doMake('img'),
     prepend = curry2(ptL(invokeMethodBridge, 'appendChild')),
     append = ptL(invokeMethodBridge, 'appendChild'),
     doClose = append(doText('CLOSE')),
     doRender = prepend(document.body),
     /*puzzled as to why figure was being created with an extra image on evry click
     the argument to prepend was an element and was being extended on evry call, needs a fresh instance per click*/
     //doFig = prepend(doMakeNow('figure')),
     doFig = prepend(doMake('figure')),
     doCap = append(doMakeNow('figcaption')),
     //doTest = ptL(invokeMethod, console, 'log'),
     makeDiv = compose(doRender, doDiv),
     git = ptL(FF, 'map', [getParentAttribute('href'), getAttribute('alt')]),
     sit = ptL(zip, 'map', [setSrc, setAlt]),
     enhance = compose(doOverlay, getClassList).wrap(doReturn),
     doGit = compose(enhance, getParent, curry2(append)(makeDiv), addListener.wrap(doReturn), getParent, getParent, doClose, doCap, getParent, doFig, curry2(invoke)(doImg), ptL(EE, 'forEach'), sit, git, getTarget);
 lightbox.addEventListener('click', (e) => {
     e.preventDefault();
     e.stopPropagation();
     document.body.scrollTop = document.documentElement.scrollTop = 0;
     //doWhen(matcher, doGit, e);
     doGit(e);

 });

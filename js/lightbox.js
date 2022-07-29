 function doPartial(flag) {
    return function p(f, ...vs) {
      if (f.length === vs.length) {
        return flag ? () => f(...vs) : f(...vs);
      }
      return (...rest) => p(f, ...vs, ...rest);
    };
  }

  function curryFactory(dir) {
    let defer = fun => a => () => fun(a),
      right = function(config) {
        if (!config || !config.defer || !config.deflt) {
          return defer;
        }
        let options = {
          deflt: {
            two: fun => b => a => fun(a, b),
            three: fun => c => b => a => fun(a, b, c),
            four: fun => d => c => b => a => fun(a, b, c, d)
          },
          defer: {
            two: fun => b => a => () => fun(a, b),
            three: fun => c => b => a => () => fun(a, b, c),
            four: fun => d => c => b => a => () => fun(a, b, c, d)
          }
        };
        return config.defer ? options.defer[config.defer] : options.deflt[config.deflt];
      },
      left = function(config) {
        if (!config || !config.defer || !config.deflt) {
          return defer;
        }
        let options = {
          deflt: {
            two: fun => a => b => fun(a, b),
            three: fun => a => b => c => fun(a, b, c),
            four: fun => a => b => c => d => fun(a, b, c, d)
          },
          defer: {
            two: fun => a => b => () => fun(a, b),
            three: fun => a => b => c => () => fun(a, b, c),
            four: fun => a => b => c => d => () => fun(a, b, c, d)
          }
        };
        return config.defer ? options.defer[config.defer] : options.deflt[config.deflt];
      };
    return dir === 'right' ? right : dir === 'left' ? left : defer;
  }

function wrap (f, o, ...vs){
        f.apply(o, [o, vs]);
        return o;
      }

function doReturn (ptl, o){
    ptl(o);
    return o;
      }

function doInvoke (ptl, v){
    return ptl(v);
      }


 if(typeof Function.prototype.wrap ==='undefined'){          
        Function.prototype.wrap = function(wrapper, ..._vs) {
            let _method = this;//the function
            return function(...vs) {
                return wrapper.apply(this, [_method.bind(this), ..._vs, ...vs]);
            };
        };
    }

function remove() {
    this.parentNode.removeChild(this);
}

function getResult(o) {
    if(typeof o === 'function'){
        return o();
    }
    return o;
}


function FF(m, funs, o){
        o = getResult(o);
        return funs[m]((f) => f(o));
}

function EE(m, funs){
    return function(o){
        o = getResult(o);
        funs[m]((f) => f(o));
        return o;
    };
}


function zip(m, funs, vals){
        return vals[m]((v, i) => funs[i](v));
}

function F(o, p, m, v){
    o = getResult(o);
    return o[p][m](v);
}


const deferPTL = doPartial(true),
      ptL = doPartial(),
      con = (v) => console.log(v),
      compose = (...fns) => fns.reduce((f, g) => (...vs) => f(g(...vs))),
      getter = (o, p) => o[p],
      curry2 = fun => b => a => fun(a, b),
      curry3 = fun => c => b => a => fun(a, b, c),
      lightbox = document.querySelector('.lightbox'),
      invoke = (f, v) => f(v),
      invokeMethod = (o, m, v) => o[m](v),
      lazyInvoke2 = (m, p, o, v) => o[m](p, v),
      invokeMethodBridge = (m, v, o) => {
          o = getResult(o);
          return invokeMethod(o, m, v);
      },
      
      doMake = deferPTL(invokeMethod, document, 'createElement'),
      doMakeNow = ptL(invokeMethod, document, 'createElement'),
      getClassList = curry2(getter)('classList'),
      getTarget = curry2(getter)('target'),
      //getAttribute = curry3(invokeMethod)('src')('getAttribute'),
      getAttribute = ptL(invokeMethodBridge, 'getAttribute'),
      setAttribute = ptL(lazyInvoke2, 'setAttribute'),
      invokeThen = invokeMethodBridge.wrap(doReturn),
      addListener = curry2(ptL(lazyInvoke2, 'addEventListener', 'click'))(remove),
      setSrc = curry2(setAttribute('src')),
      setAlt = curry2(setAttribute('alt')),
      doOverlay = ptL(invokeMethodBridge, 'add', 'overlay'),
      doDiv = doMake('div'),
      doLink = doMake('a'),
      doImg = doMake('img'),
      doCaption = doMake('figcaption'),
      prepend = curry2(ptL(invokeMethodBridge, 'appendChild')),
      append = ptL(invokeMethodBridge, 'appendChild'),
      doRender = prepend(document.body),
      doFig = prepend(doMakeNow('figure')),
      doTest = ptL(invokeMethod, console, 'log'),
      //makeDiv = compose(doOverlay, getClassList, doRender, doDiv),
      makeDiv = compose(doRender, doDiv),
      getSrc = compose(getAttribute('src'), getTarget),
      getAlt = compose(getAttribute('alt'), getTarget),
      git = ptL(FF, 'map', [getAttribute('src'), getAttribute('alt')]),
      sit = ptL(zip, 'map', [setSrc, setAlt]),
      enhance = compose(doOverlay, getClassList).wrap(doReturn),
      doGit = compose(addListener, enhance, curry2(getter)('parentNode'), curry2(append)(makeDiv), curry2(getter)('parentNode'), doFig, curry2(invoke)(doImg), ptL(EE, 'forEach'), sit, git, getTarget);


lightbox.addEventListener('click', (e) => {
    e.preventDefault();    
    doGit(e);
});
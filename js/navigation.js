
/* don't use partially applied callbacks in map, forEach etc.. as argument length will confound...*/
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
    var tgt = this.parentNode;
    tgt.parentNode.removeChild(tgt);
}

function remove1() {
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

function find (reg) {
    return function (node){
        while(!node.nodeName.match(reg)){
            node = node.parentNode;
        }
    }
    return node;
}

function doWhen(pred, action, v){
    if(pred(v)){
        return action(v);
    }
}

function $(str){
    return document.getElementById(str);
}
function $$(str){
    return function(){
        return document.getElementById(str);
    };
}
function $q(str, flag = false) {
    const m = flag ? 'querySelectorAll' : 'querySelector';
    return document[m](str);
}

function test(e) {
    e.preventDefault();
    alert(e);
}


const config = [{FOP: 4}, {AFEN: 3}, {'Distillery House': 3}, {'Benson Design': 4}, {BP: 2}, {UKOOA: 4}, {'Orkney Holiday Cottages': 3}, {'Safari Afrika': 4}];


const deferPTL = doPartial(true),
      ptL = doPartial(),
      con = (v) => console.log(v),
      compose = (...fns) => fns.reduce((f, g) => (...vs) => f(g(...vs))),
      getter = (o, p) => o[p],
      curry2 = fun => b => a => fun(a, b),
      curry3 = fun => c => b => a => fun(a, b, c),
      curryL3 = fun => a => b => c => fun(a, b, c),
      invoke = (f, v) => f(v),
      invokeMethod = (o, m, v) => o[m](v),
      lazyInvoke2 = (m, p, o, v) => o[m](p, v),
      invokeMethodBridge = (m, v, o) => {
          o = getResult(o);
          return invokeMethod(o, m, v);
      },
      invokeMethodBridgeCB = (cb) => (m, v, o) => {
          o = cb(o);
          return invokeMethod(o, m, v);
      },
      contentarea = $('content'),
      lightbox = document.querySelector('.lightbox'),
      getParent = curry2(getter)('parentNode'),
      doMake = deferPTL(invokeMethod, document, 'createElement'),
      doMakeNow = ptL(invokeMethod, document, 'createElement'),
      doText = ptL(invokeMethod, document, 'createTextNode'),
      prepend = curry2(ptL(invokeMethodBridgeCB(getResult), 'appendChild')),
      append = ptL(invokeMethodBridgeCB(getResult), 'appendChild'),
      getClassList = curry2(getter)('classList'),
      getTarget = curry2(getter)('target'),
      matcher = compose(curry3(invokeMethod)(/img/i)('match'), curry2(getter)('nodeName'), getTarget),
      getAttribute = ptL(invokeMethodBridge, 'getAttribute'),
      getParentAttribute = ptL(invokeMethodBridgeCB(getParent), 'getAttribute'),
      setAttribute = ptL(lazyInvoke2, 'setAttribute'),
      addListener = curry2(ptL(lazyInvoke2, 'addEventListener', 'click'))(test).wrap(doReturn),
      setSrc = curry2(setAttribute('src')),
      setAlt = curry2(setAttribute('alt')),
      setId = curry2(setAttribute('id'))('navigation').wrap(doReturn),
      setHref = curry2(setAttribute('href'))('.').wrap(doReturn),
      getNav = $$('navigation'),
      doOverlay = ptL(invokeMethodBridge, 'add', 'overlay'),
      doDiv = doMake('div'),
      doAside = doMake('aside'),
      doSection = doMake('section'),
      doLink = doMake('a'),
      doImg = doMake('img'),
      doUL = doMake('ul'),
      getZero = curry2(getter)(0),
      getKeys = compose(doText, getZero, curryL3(invokeMethod)(window.Object)('keys')),
      getValues = compose(getZero, curryL3(invokeMethod)(window.Object)('values')),
      doRender = prepend(document.body),
      doRenderNav = compose(prepend($$('navigation')), setHref, getParent, prepend(doLink)),
      doTest = ptL(invokeMethod, console, 'log'),
      makeDiv = compose(doRender, doDiv),
      getHref = getAttribute('href'),
      git = ptL(FF, 'map', [getParentAttribute('href'), getAttribute('alt')]),
      sit = ptL(zip, 'map', [setSrc, setAlt]);

var loader = function(){
    compose(curry2(invoke)($q('#display ul')), prepend, addListener, setId, append(doSection()), prepend(contentarea), doAside)();
  var nums = config.map(getValues),
      nodes = config.map(getKeys),
      headings = nodes.map(doRenderNav).map(F($q('#navigation ul')));
    
    function F(ul){
        return function(el, i, els){
           var n = Object.values(config[i])[0],
               j = 0,
               lis = ul.children,
               ol;
            while(j < n){
                if(!j) {
                    ol = doUL();
                }
                if(j === n) {
                    j = -1;
                }
                var x = append(lis[0], ol).parentNode;
                if(els[i+1]){
                  el.parentNode.insertBefore(x, els[i+1]);  
                }
                else {
                    el.parentNode.append(x);
                }
                
                j++;
            }
            if(!els[i+1]){
                ul.parentNode.removeChild(ul);
            }
        };
    }
    
};


/*
lightbox.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    doWhen(matcher, doGit, e);
   // doGit(e);
    
});
*/
window.addEventListener('load', loader);
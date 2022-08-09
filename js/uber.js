/*jslint nomen: true */
/*global window: false */
/*global nW1: false */
if (!window.nW1) {
	window.nW1 = {};
}

class Publisher {
    constructor(h = []) {
        this.handlers = h;
    }
    notify(...args) {
        this.handlers.forEach((handler) => handler(...args));
    }
    attach(handler, v) {
        this.handlers = [...this.handlers, handler];
    }
    static from(h = []) {
        return new Publisher(h);
    }
}

function noOp(){}

function identity(arg) {
		return arg;
	}

var inherit = (function () {
    var F = function () {};
    return function (C, P) {
        F.prototype = P.prototype;
        C.prototype = new F();
        C.uber = P.prototype;
        C.prototype.constructor = C;
    }
}());

function create(o) {
   function F() {}
    F.prototype = o;
    return new F();
}

function extend(parent, child) {
    var i;
    child = child || {};
    for (i in parent) {
        if (parent.hasOwnProperty(i)) {
            //conditionally overwrite
            child[i] = child[i] || parent[i];
        }
    }
return child;
}

	function equals(a, b) {
		return a === b;
	}

	function modulo(n, i) {
		return i % n;
	}

	function increment(i) {
		return i + 1;
	}

function getResult(o) {
		if (typeof o === 'function') {
			return o();
		}
		return o;
	}

function insertB4(neu, el) {
    el = getResult(el);
    var p = el.parentNode;
    return p.insertBefore(getResult(neu), el);
}

function mapArgs (f, ...args) {
    const mapped = args.map(getResult);
    return f(...mapped);
}


function random (n = 10) {
    return Math.floor(Math.random() * n);
}

	function doPartial(flag) {
		return function p(f, ...args) {
			if (f.length === args.length) {
				return flag ? () => f(...args) : f(...args);
			}
			return (...rest) => p(f, ...args, ...rest);
		};
	}

function doPartialCB(flag) {
		return function p(f, ...args) {
			if (f.length === args.length) {
				return flag ? () => f(...args) : f(...args);
			}
			return (...rest) => p(f, ...args, ...rest);
		};
	}

/*
https://gist.github.com/JamieMason/1228339132986291693726d11bd8dd1f
const pApply = (fn, ...cache) => (...args) => {
  const all = cache.concat(args);
  return all.length >= fn.length ? fn(...all) : pApply(fn, ...all);
};
*/

const thunk = (f, ...args) => f(...args);
	//note a function that ignores any state of champ or contender will return the first element if true and last if false
	function best(fun, coll, arg) {
		//fun = arg ? doPartialCB()(fun, arg) : fun;
		return toArray(coll).reduce((champ, contender) => fun(champ, contender) ? champ : contender);
	}

function doOnce(i) {
    return function () {
        i--;
        return i > 0;
			};
		};

function alternate(i, n) {
    return function () {
        i = (i += 1) % n;
        return i;
    };
}


function doAlternate() {
    var  f = alternate(0, 2);
    return function (actions, ...args) {               
        return function () {
            return best(f, [actions[0], actions[1]])();
			};
		};
}

function toArray(coll, cb = () => true) {
		return Array.prototype.slice.call(coll).filter(cb);
	}
	if (typeof Function.prototype.wrap === 'undefined') {
		Function.prototype.wrap = function(wrapper, ..._vs) {
			let _method = this; //the function
			return function(...vs) {
				return wrapper.apply(this, [_method.bind(this), ..._vs, ...vs]);
			};
		};
	}


	function doInc(n) {
		return compose(ptL(modulo, n), increment);
	}
	/* don't use partially applied callbacks in map, forEach etc.. as argument length will confound...*/

	function doIterate(m, funs) {
		return function(o) {
			if (funs) {
				o = getResult(o);
				funs[m]((f) => f(o));
				return o;
			}
			return o;
		};
	}

	function doIterateCB(m, coll, cb) {
		o = getResult(o);
		return coll[m](cb);
	}

	function zip(m, funs, vals) {
		return vals[m]((v, i) => funs[i](v));
	}

	function doWhenFactory(n) {
        
       const both = (pred, action, v) => {
           if (pred(v)) { return action(v); }
       },
             action = (pred, action, v) => {
                 if(getResult(pred)) { return action(v); }
             },
             pred = (pred, action, v) => {
                if(pred(v)) { return action(); }
            },
             none = (pred, action) => {
                 if(getResult(pred)) { return action(); }
        },
             all = [none, pred, action, both];
        
        return all[n] || none;
    }
        





	class Grouper extends Publisher {
		constructor(grp = [], kls = 'active', h = []) {
			super(h);
			this.grp = grp;
			this.current = null;
			this.finder = () => null;
		}
		getCurrent() {
			return this.strategy();
		}
		undo(el, click) {
			if ((el === this.current) && click) {
				this.current = null;
				return undoActive(el);
			}
		}
		execute(el, click) {
			if (!this.undo(el, click)) {
				undoActiveCB(this.grp);
				this.current = doActive(el);
			}
		}
		setFinder(src) {
			this.finder = Grouper.doFind(src);
			return this.getCurrent();
		}
		setSearch(s = () => []) {
			this.strategy = s;
			return this;
		}
		setGroup(grp) {
			this.grp = grp;
			return this;
		}
		static from(grp, kls = 'active') {
			return new Grouper(grp, kls);
		}
		static doFind(str) {
			return function(cur) {
				return str.match(/\/(\w+)_/.exec(cur)[1]);
			};
		}
	}

	function replacePath(o, src) {
		o = getResult(o);
		o.setAttribute('src', src.replace('thumbs', 'fullsize').replace('tmb', 'fs'));
	}

	function hover(e) {
		var preview = $q('#slidepreview img');
		if (matchImg(e) && e.target !== preview) {
			replacePath(preview, getAttribute('src')(e.target));
		}
	}

	function getNextElement(node) {
		if (node && node.nodeType === 1) {
			return node;
		}
		if (node && node.nextSibling) {
			return getNextElement(node.nextSibling);
		}
		return null;
	}

	function getTargetNode(node, reg, dir = 'firstChild') {
		if (!node) {
			return null;
		}
		node = node.nodeType === 1 ? node : getNextElement(node);
		var res = node && node.nodeName.match(reg);
		if (!res) {
			node = node && getNextElement(node[dir]);
			return node && getTargetNode(node, reg, dir);
		}
		return node;
	}

const looper = nW1.Looper(),
		config = [{
			FOP: 4
		}, {
			AFEN: 3
		}, {
			'Distillery House': 3
		}, {
			'Benson Design': 4
		}, {
			BP: 2
		}, {
			UKOOA: 4
		}, {
			'Orkney Holiday Cottages': 3
		}, {
			'Safari Afrika': 4
		}],
      pApply = (fn, ...cache) => (...args) => {
          const all = cache.concat(args);
          return all.length >= fn.length ? fn(...all) : pApply(fn, ...all);
      },
		deferPTL = doPartial(true),
		ptL = doPartial(),
      pass = (ptl, o) => {
			ptl(getResult(o));
			return o;
		},
		con = (v) => console.log(v),
		compose = (...fns) => fns.reduce((f, g) => (...vs) => f(g(...vs))),
		getter = (o, p) => {
			o = getResult(o);
			return o[p];
		},
		setter = (o, k, v) => {
            o = getResult(o);
            getResult(o)[k] = v;
            return o;
        },
		setterBridge = (k, o, v) => {
            o = getResult(o);
            o[k] = v;
            return o;
        },
      always = (arg) => () => arg,
		curry = fun => a => fun(a),
		curry2 = fun => b => a => fun(a, b),
		curry22 = fun => b => a => () => fun(a, b),
		curryL2 = fun => a => b => fun(a, b),
		curryL22 = fun => a => b => () => fun(a, b),
		curry3 = fun => c => b => a => fun(a, b, c),
		curryL3 = fun => a => b => c => fun(a, b, c),
		curryL33 = fun => a => b => c => () => fun(a, b, c),
		invoke = (f, v) => f(v),
      invokeMethod = (o, m, v) => o[m](v),
      invokeMethodV = (o, p, m, v) => {
          o = getResult(o);
          return o[p][v](m)
      },
      invokeMethodPair = (o, m, p, v) => {
          o = getResult(o);
          return o[m](p, v)
      },
		lazyVal = (m, p, o, v) => o[m](p, v),
		invokeMethodBridge = (m, v, o) => {
			o = getResult(o);
			return invokeMethod(o, m, v);
		},

		invokeMethodBridgeCB = (cb) => (m, v, o) => {
			o = cb(o);
			return invokeMethod(o, m, v);
		},
      invokeMethodBridgeCBT = (cb) => (m, v, o) => {
			o = cb(o);
			return invokeMethod(o, m, v);
		},
		negate = (f, last_arg) => !f(last_arg),
		
		$ = (str) => document.getElementById(str),
		$$ = (str) => () => $(str),
		$q = (str, flag = false) => {
			const m = flag ? 'querySelectorAll' : 'querySelector';
			return document[m](str);
		},
		$$q = (str, flag = false) => () => $q(str, flag),
      getTarget = curry2(getter)('target'),
		getParent = curry2(getter)('parentNode'),
      getParent2 = compose(getParent, getParent),
		getText = curry2(getter)('innerHTML'),
		getNodeName = curry2(getter)('innerHTML'),
		getClassList = curry2(getter)('classList'),
		getTextFromTarget = compose(getText, getTarget),
		getNodeNameTarget = compose(getText, getTarget),
		doMake = deferPTL(invokeMethod, document, 'createElement'),
		doMakeCB = curryL3(invokeMethod)(document)('createElement'),
		doMakeNow = ptL(invokeMethod, document, 'createElement'),
		doText = deferPTL(invokeMethod, document, 'createTextNode'),
		doTextNow = ptL(invokeMethod, document, 'createTextNode'),
		doTextCB = curryL33(invokeMethod)(document)('createTextNode'),
		doTextCBNow = curryL3(invokeMethod)(document)('createTextNode'),
		prepend = curry2(ptL(invokeMethodBridgeCB(getResult), 'appendChild')),
		prependCB = curry2(curryL3(invokeMethodBridgeCB(getResult))('appendChild')),
		insertBeforeCB = curry2(curryL3(invokeMethodBridgeCBT(getResult))('insertBefore')),
		append = ptL(invokeMethodBridgeCB(getResult), 'appendChild'),
		appendCB = curryL3(invokeMethodBridgeCB(getResult))('appendChild'),
		getAttribute = ptL(invokeMethodBridge, 'getAttribute'),
		getAttrs = curryL3(invokeMethodBridge)('getAttribute'),
		getParentAttribute = ptL(invokeMethodBridgeCB(getParent), 'getAttribute'),
		setAttribute = ptL(lazyVal, 'setAttribute'),
		matchLink = compose(curry3(invokeMethod)(/^a$/i)('match'), curry2(getter)('nodeName'), getTarget),
		matchImg = compose(curry3(invokeMethod)(/^img/i)('match'), curry2(getter)('nodeName'), getTarget),
		matchPath = compose(curry3(invokeMethod)(/jpe?g/i)('match'), curryL3(invokeMethodBridge)('getAttribute')('href')),
		getImgSrc = curryL3(invokeMethodBridge)('getAttribute')('src'),
		getImgPath = compose(getImgSrc, getTarget),
		addClickHover = curry2(ptL(lazyVal, 'addEventListener', 'mouseover'))(hover).wrap(pass),
		onLoad = curry2(ptL(lazyVal, 'addEventListener', 'load')),
		reset_opacity = compose(curry3(setter)(3)('opacity'), curry22(getter)('style')($$('slide'))),
		doResetOpacity = onLoad(reset_opacity).wrap(pass),
      setId = curry2(setAttribute('id')),
      setLink = curry2(setAttribute('href')),
		setSrc = curry2(setAttribute('src')),
		setAlt = curry2(setAttribute('alt')),
		setVal = curry2(setAttribute('value')),
		setMin = curry2(setAttribute('min')),
		setMax = curry2(setAttribute('max')),
		setType = curry2(setAttribute('type')),
		
		setNavId = curry2(setAttribute('id'))('navigation').wrap(pass),
		setHref = setLink('.').wrap(pass),
		getNav = $$('navigation'),
		addKlas = ptL(invokeMethodBridge, 'add'),
		remKlas = ptL(invokeMethodBridge, 'remove'),
		doActive = compose(addKlas('active'), getClassList).wrap(pass),
		undoActive = compose(remKlas('active'), getClassList).wrap(pass),
		doEach = curryL3(invokeMethodBridgeCB(getResult))('forEach'),
		doFindIndex = curryL3(invokeMethodBridgeCB(getResult))('findIndex'),
		undoActiveCB = doEach(undoActive),
		doElement = compose(doMake, identity),
		doElementNow = compose(getResult, doElement),
      getZero = curry2(getter)(0),
		getZeroPlus = curry2(getter)(10),
            getLength = curry2(getter)('length'),
		getKey = compose(getZero, curryL3(invokeMethod)(window.Object)('keys')),
		getKeys = compose(doTextNow, getKey),
		getValues = compose(getZero, curryL3(invokeMethod)(window.Object)('values')),
		doRender = prepend(document.body),
    incrementer = compose(doInc, getLength),
      doTest = function(x) {
			console.log(x);
			return x;
		};
   
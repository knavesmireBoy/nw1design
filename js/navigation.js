/* don't use partially applied callbacks in map, forEach etc.. as argument length will confound...*/
function doPartial(flag) {
	return function p(f, ...vs) {
		if (f.length === vs.length) {
			return flag ? () => f(...vs) : f(...vs);
		}
		return (...rest) => p(f, ...vs, ...rest);
	};
}

function pass(ptl, o) {
	ptl(o);
	return o;
}

function doInvoke(ptl, v) {
	return ptl(v);
}
if (typeof Function.prototype.wrap === 'undefined') {
	Function.prototype.wrap = function(wrapper, ..._vs) {
		let _method = this; //the function
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
	if (typeof o === 'function') {
		return o();
	}
	return o;
}

function invokeCB(m, funs, o) {
	o = getResult(o);
	return funs[m]((f) => f(o));
}

function doIterate(m, funs) {
	return function(o) {
		o = getResult(o);
		funs[m]((f) => f(o));
		return o;
	};
}

function zip(m, funs, vals) {
	return vals[m]((v, i) => funs[i](v));
}

function F(o, p, m, v) {
	o = getResult(o);
	return o[p][m](v);
}

function find(reg) {
	return function(node) {
		while (!node.nodeName.match(reg)) {
			node = node.parentNode;
		}
	}
	return node;
}

function doWhen(pred, action, v) {
	try {
		if (pred(v)) {
			return action(v);
		}
	} catch (e) {
		if (pred) {
			return action(v);
		}
	}
}

function $(str) {
	return document.getElementById(str);
}

function $$(str) {
	return function() {
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

function equals(a, b) {
	return a === b;
}

function gtEq(a, b) {
	return a >= b;
}

function always(arg) {
	return function() {
		return arg;
	};
}

function truthy() {
	return true;
}

function toArray(coll, cb = truthy) {
	return Array.prototype.slice.call(coll).filter(cb);
}

class Grouper {
    constructor(grp, kls = 'active') {
        this.grp = grp;
        //this.execute(this.grp[0]);
        this.current = null;
    }
    getCurrent () {
        return compose(ptL(getter, this.grp), doFindIndex(this.strategy))(this.grp);
    }
    undo (el) {
        if(el === this.current){
            this.current = null;
            return undoActive(el);
        }
    }
    execute (el) {
        if(!this.undo(el)){
            undoActiveCB(this.grp);
            this.current = doActive(el);
        }
    }
    setStrategy (s) {
        this.strategy = s;
        return this;
    }
}

function GG() {
    let grouper = null;
    return function G(e) {
        e.preventDefault();
        if (matchLink(e)) {
            grouper = grouper || new Grouper(toArray(this.getElementsByTagName('a'), (a) => !a.href.match(/jpg/)));
            grouper.execute(getTarget(e));
	}
};
}

function X(e){
    if(matchImg(e)){
      var src = getAttribute('src')(e.target);
        //src.replace('fullsize', 'thumbs').replace('fs', 'tmb'));
      $q('#slidepreview img').setAttribute('src', src.replace('thumbs', 'fullsize').replace('tmb', 'fs'));
    }
}

function Y(){
    //stop slideshow; set display pic; set index;  trigger click    
   // con(this);
}
const config = [{
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
}];
const deferPTL = doPartial(true),
	ptL = doPartial(),
	con = (v) => console.log(v),
	compose = (...fns) => fns.reduce((f, g) => (...vs) => f(g(...vs))),
	getter = (o, p) => o[p],
	curry2 = fun => b => a => fun(a, b),
	curry3 = fun => c => b => a => fun(a, b, c),
	curryL3 = fun => a => b => c => fun(a, b, c),
	curryL33 = fun => a => b => c => () => fun(a, b, c),
	invoke = (f, v) => f(v),
	justinvoke = (f) => f(),
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
      invokeMethodBridgeCBT = (cb) => (m, v, o) => {
		o = cb(o);
		return invokeMethod(o, m, v);
	},
	contentarea = $('content'),
	lightbox = document.querySelector('.lightbox'),
	getTarget = curry2(getter)('target'),
	getParent = curry2(getter)('parentNode'),
	getText = curry2(getter)('innerHTML'),
	getNodeName = curry2(getter)('innerHTML'),
	getClassList = curry2(getter)('classList'),
	getTextFromTarget = compose(getText, getTarget),
	getNodeNameTarget = compose(getText, getTarget),
	doMake = deferPTL(invokeMethod, document, 'createElement'),
	doMakeNow = ptL(invokeMethod, document, 'createElement'),
	doText = deferPTL(invokeMethod, document, 'createTextNode'),
	doTextNow = ptL(invokeMethod, document, 'createTextNode'),
      
	prepend = curry2(ptL(invokeMethodBridgeCB(getResult), 'appendChild')),
	prependTest = curry2(curryL3(invokeMethodBridgeCB(getResult))('appendChild')),
	append = ptL(invokeMethodBridgeCB(getResult), 'appendChild'),
	appendT = ptL(invokeMethodBridge, 'appendChild'),
      
	matchLink = compose(curry3(invokeMethod)(/^a$/i)('match'), curry2(getter)('nodeName'), getTarget),
	matchImg = compose(curry3(invokeMethod)(/^img/i)('match'), curry2(getter)('nodeName'), getTarget),
	getAttribute = ptL(invokeMethodBridge, 'getAttribute'),
	getParentAttribute = ptL(invokeMethodBridgeCB(getParent), 'getAttribute'),
	setAttribute = ptL(lazyInvoke2, 'setAttribute'),
      
	addClickPreview = curry2(ptL(lazyInvoke2, 'addEventListener', 'click'))(GG()).wrap(pass),
	addClickHover = curry2(ptL(lazyInvoke2, 'addEventListener', 'mouseover'))(X).wrap(pass),
	addImgLoad = curry2(ptL(lazyInvoke2, 'addEventListener', 'load'))(Y).wrap(pass),
      
	setSrc = curry2(setAttribute('src')),
	setAlt = curry2(setAttribute('alt')),
	setLink = curry2(setAttribute('href')),
	setId = curry2(setAttribute('id')),
	setNavId = curry2(setAttribute('id'))('navigation').wrap(pass),
	setHref = curry2(setAttribute('href'))('.').wrap(pass),
	getNav = $$('navigation'),
	addKlas = ptL(invokeMethodBridge, 'add'),
	remKlas = ptL(invokeMethodBridge, 'remove'),
	doActive = compose(addKlas('active'), getClassList).wrap(pass),
	undoActive = compose(remKlas('active'), getClassList).wrap(pass),
    doEach = curryL3(invokeMethodBridgeCB(getResult))('forEach'),
    doFindIndex = curryL3(invokeMethodBridgeCB(getResult))('findIndex'),
	undoActiveCB = doEach(undoActive),
	doDiv = doMake('div'),
	doAside = doMake('aside'),
	doSection = doMake('section'),
	doLink = doMake('a'),
	doImg = doMake('img'),
	doUL = doMake('ul'),
      doTest = function(x){
        console.log(x);
        return x;
    },
      
    doH2 = compose(append, getParent, prepend(doMake('h2')), doText('Navigation'))(),
	getZero = curry2(getter)(0),
	getKey = compose(getZero, curryL3(invokeMethod)(window.Object)('keys')),
	getKeys = compose(doTextNow, getKey),
	getValues = compose(getZero, curryL3(invokeMethod)(window.Object)('values')),
	doRender = prepend(document.body),
	doRenderNav = compose(prepend($$('navigation')), setHref, getParent, prepend(doLink)),
	
	makeDiv = compose(doRender, doDiv),
	getHref = getAttribute('href'),
	//git = ptL(invokeCB, 'map', [getParentAttribute('href'), getAttribute('alt')]),
	setImageAttrs = curryL33(zip)('map')([setAlt])(['currentpic']),
	setDivAttrs = curryL33(zip)('map')([setId])(['slidepreview']),
    setDiv = compose(append, curry2(invoke)(doDiv), ptL(doIterate, 'forEach'), setDivAttrs)(),
    setImg = compose(append, curry2(invoke)(doImg), ptL(doIterate, 'forEach'), setImageAttrs)();

var loader = function() {
    compose(addImgLoad, setImg, setDiv, getParent, doH2, getParent, curry2(invoke)($q('#display ul')), prepend, addClickHover, addClickPreview, setNavId, append(doSection()), prepend(contentarea), doAside)();
	var nums = config.map(getValues),
		nodes = config.map(getKeys),
		headings = nodes.map(doRenderNav).map(F($q('#navigation ul')));

	function F(ul) {
		return function(el, i, els) {
			var n = Object.values(config[i])[0],
				j = 0,
				lis = ul.children,
				ol,
				neu;
			while (j < n) {
				if (!j) {
					ol = doUL();
				}
				if (j === n) {
					j = -1;
				}
				neu = append(lis[0], ol).parentNode;
				if (els[i + 1]) {
					el.parentNode.insertBefore(neu, els[i + 1]);
				} else {
					el.parentNode.append(neu);
				}
				j++;
			} //
			if (!els[i + 1]) {
				ul.parentNode.removeChild(ul);
			}
		};
	}
};

window.addEventListener('load', loader);
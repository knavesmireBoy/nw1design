(function() {
	"use strict";
	/* don't use partially applied callbacks in map, forEach etc.. as argument length will confound...*/
	function doPartial(flag) {
		return function p(f, ...vs) {
			if (f.length === vs.length) {
				return flag ? () => f(...vs) : f(...vs);
			}
			return (...rest) => p(f, ...vs, ...rest);
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

	function getResult(o) {
		if (typeof o === 'function') {
			return o();
		}
		return o;
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
	class Publisher {
		constructor(h = []) {
			this.handlers = h;
		}
		notify(...args) {
			this.handlers.forEach((handler) => handler(...args));
		}
		attach(handler) {
			this.handlers = [...this.handlers, handler];
		}
		static from(h = []) {
			return new Publisher(h);
		}
	}
	class Grouper extends Publisher {
		constructor(grp = [], kls = 'active') {
			super();
			this.grp = grp;
			this.current = null;
			this.finder = () => null;
		}
		getCurrent() {
			return this.strategy();
		}
		undo(el) {
			if (el === this.current) {
				this.current = null;
				return undoActive(el);
			}
		}
		execute(el) {
			if (!this.undo(el)) {
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

	function sideBarListener(e) {
		e.preventDefault();
		if (matchLink(e)) {
			headers.execute(getTarget(e));
		}
	}

	function hover(e) {
		var preview = $q('#slidepreview img');
		if (matchImg(e) && e.target !== preview) {
			var src = getAttribute('src')(e.target);
			preview.setAttribute('src', src.replace('thumbs', 'fullsize').replace('tmb', 'fs'));
		}
	}

	function imageLoad() {
		//stop slideshow; set display pic; set index;  trigger click    
		// con(this);
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
		}],
		broadcaster = Publisher.from();
	let headers = {},
		thumbs = {};
	const deferPTL = doPartial(true),
		ptL = doPartial(),
		con = (v) => console.log(v),
		compose = (...fns) => fns.reduce((f, g) => (...vs) => f(g(...vs))),
		getter = (o, p) => o[p],
		curry2 = fun => b => a => fun(a, b),
		curryL2 = fun => a => b => fun(a, b),
		curryL22 = fun => a => b => () => fun(a, b),
		curry3 = fun => c => b => a => fun(a, b, c),
		curryL3 = fun => a => b => c => fun(a, b, c),
		curryL33 = fun => a => b => c => () => fun(a, b, c),
		invoke = (f, v) => f(v),
		invokeMethod = (o, m, v) => {
			return o[m](v);
		},
		lazyInvoke2 = (m, p, o, v) => o[m](p, v),
		invokeMethodBridge = (m, v, o) => {
			o = getResult(o);
			return invokeMethod(o, m, v);
		},
		invokeMethodBridgeCB = (cb) => (m, v, o) => {
			o = cb(o);
			return invokeMethod(o, m, v);
		},
		negate = (f, last_arg) => !f(last_arg),
		pass = (ptl, o) => {
			ptl(o);
			return o;
		},
		$ = (str) => document.getElementById(str),
		$$ = (str) => () => $(str),
		$q = (str, flag = false) => {
			const m = flag ? 'querySelectorAll' : 'querySelector';
			return document[m](str);
		},
		$$q = (str, flag = false) => () => $q(str, flag),
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
		append = ptL(invokeMethodBridgeCB(getResult), 'appendChild'),
		getAttribute = ptL(invokeMethodBridge, 'getAttribute'),
		getAttrs = curryL3(invokeMethodBridge)('getAttribute'),
		getParentAttribute = ptL(invokeMethodBridgeCB(getParent), 'getAttribute'),
		setAttribute = ptL(lazyInvoke2, 'setAttribute'),
		matchLink = compose(curry3(invokeMethod)(/^a$/i)('match'), curry2(getter)('nodeName'), getTarget),
		matchImg = compose(curry3(invokeMethod)(/^img/i)('match'), curry2(getter)('nodeName'), getTarget),
		matchPath = compose(curry3(invokeMethod)(/jpe?g/i)('match'), curryL3(invokeMethodBridge)('getAttribute')('href')),
		addClickPreview = curry2(ptL(lazyInvoke2, 'addEventListener', 'click'))(sideBarListener).wrap(pass),
		addClickHover = curry2(ptL(lazyInvoke2, 'addEventListener', 'mouseover'))(hover).wrap(pass),
		addImgLoad = curry2(ptL(lazyInvoke2, 'addEventListener', 'load'))(imageLoad).wrap(pass),
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
		doTest = function(x) {
			console.log(x);
			return x;
		},
		doH2 = compose(append, getParent, prepend(doMake('h2')), doText('Navigation'))(),
		getZero = curry2(getter)(0),
		getZeroPlus = curry2(getter)(5),
		getKey = compose(getZero, curryL3(invokeMethod)(window.Object)('keys')),
		getKeys = compose(doTextNow, getKey),
		getValues = compose(getZero, curryL3(invokeMethod)(window.Object)('values')),
		doRender = prepend(document.body),
		doRenderNav = compose(prepend($$('navigation')), setHref, getParent, prepend(doLink)),
		makeDiv = compose(doRender, doDiv),
		getHref = getAttribute('href'),
		prepAttrs = (keys, vals) => curryL33(zip)('map')(keys)(vals),
		prepare2Append = (doEl, doAttrs) => compose(append, curry2(invoke)(doEl), ptL(doIterate, 'forEach'), doAttrs)(),
		setDiv = prepare2Append(doDiv, prepAttrs([setId], ['slidepreview'])),
		setImg = prepare2Append(doImg, prepAttrs([setAlt], ['currentpicture'])),
		headings = compose(curry2(toArray)(curryL2(negate)(matchPath)), $$q('#navigation a', true));
	var loader = function() {
		function getLinksDeep() {
			var get = curry3(getTargetNode),
				ul = this.grp.map(get('nextSibling')(/ul/i)),
				getA = get('firstChild')(/^a$/i);
			return ul.map(({
				children
			}) => toArray(children)).map(lis => lis.map(compose(getAttrs('href'), getA)));
		}

		function getLinks() {
			var get = curry3(getTargetNode)('firstChild')(/^a$/i);
			return this.grp.map(lis => compose(getAttrs('href'), get)(lis));
		}

		function headers_search_strategy() {
			var links = getLinksDeep.call(this),
				i = links.map(strs => strs.findIndex(this.finder)).findIndex(n => n >= 0);
			this.index = i;
			if (this.grp[i]) {
				this.execute(this.grp[i]);
				this.notify(this.grp[i]);
			}
		}

		function thumbs_search_strategy() {
			var links = getLinks.call(this),
				i = links.findIndex(this.finder);
			this.index = i;
			if (this.grp[i]) {
				this.execute(this.grp[i]);
			}
		}

		function groupFrom(el) {
			var getUL = curry3(getTargetNode)('nextSibling')(/ul/i),
				grp = compose(toArray, curry2(getter)('children'), getUL)(el);
			this.grp = grp;
			this.getCurrent();
		}
		compose(addImgLoad, setImg, setDiv, getParent, doH2, getParent, curry2(invoke)($q('#display ul')), prepend, addClickHover, addClickPreview, setNavId, append(doSection()), prepend(contentarea), doAside)();
		var nums = config.map(getValues),
			nodes = config.map(getKeys);
		nodes.map(doRenderNav).forEach(prepareHeadings($q('#navigation ul')));

		function prepareHeadings(ul) {
			return function(el, i, els) {
				var n = Object.values(config[i])[0],
					j = 0,
					lis = ul.children,
					ol,
					neu,
					grp;
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
				}
				if (!els[i + 1]) {
					ul.parentNode.removeChild(ul);
				}
			};
		}
		headers = Grouper.from(headings());
		headers.setSearch(headers_search_strategy.bind(headers));
		var machDiv = prepare2Append(doDiv, prepAttrs([setId], ['slideshow'])),
			src = compose(getAttrs('href'), getZeroPlus, $$q('#navigation ul li a', true))(),
			machImg = prepare2Append(doImg, prepAttrs([setSrc, setAlt], [src, 'current']));
		//set preview image to first pic
		compose(curry2(setAttribute('src'))(src), $$q('#slidepreview img'))();
		//display first pic
		compose(machImg, machDiv)($('display'));
		thumbs = Grouper.from([]);
		thumbs.setGroup = groupFrom;
		thumbs.setSearch(thumbs_search_strategy.bind(thumbs));
		broadcaster.attach(headers.setFinder.bind(headers));
		broadcaster.attach(thumbs.setFinder.bind(thumbs));
		headers.attach(thumbs.setGroup.bind(thumbs));
		broadcaster.notify(src);
	};
	window.addEventListener('load', loader);
}());
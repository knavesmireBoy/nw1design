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
		return toArray(this.grp).map(lis => compose(getAttrs('href'), get)(lis));
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

const factory = function(){
    var alt = doAlternate();
    return alt([$recur.execute.bind($recur), $recur.undo.bind($recur, null)]);
}
var alt = null;
function route(e) {
    alt = alt || factory();
    if(compose(curry3(invokeMethod)(/play/i)('match'), getText, getTarget)(e)){
        alt();
       }
    else {
        alt = factory();
        $recur.undo();
    }
}

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
					ol = doMake('ul')();
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
let headers = {};
	const prepAttrs = (keys, vals) => curryL33(zip)('map')(keys)(vals),
		prepare2Append = (doEl, doAttrs) => compose(append, curry2(invoke)(doEl), ptL(doIterate, 'forEach'), doAttrs)(),
		doDiv = doMake('div'),
		doImg = doMake('img'),
		doH2 = compose(append, getParent, prepend(doMake('h2')), doText('Navigation'))(),
		doRenderNav = compose(prepend($$('navigation')), setHref, getParent, prepend(doMake('a'))),
		setDiv = prepare2Append(doDiv, prepAttrs([setId], ['slidepreview'])),
		setImg = prepare2Append(doImg, prepAttrs([setAlt], ['currentpicture'])),
		headings = compose(curry2(toArray)(curryL2(negate)(matchPath)), $$q('#navigation a', true)),
		sideBarListener = (e) => {
			e.preventDefault();
			//remove all active classes. will need to stop slideshow
			toArray($q('.active', true)).forEach((el) => el.classList.remove('active'));
			if (matchLink(e)) {
				headers.execute(getTarget(e), true);
			}
		},
		addClickPreview = curry2(ptL(lazyVal, 'addEventListener', 'click'))(sideBarListener).wrap(pass),
		loader = function() {
			//create sidebar
			compose(addImgLoad, setImg, setDiv, getParent, doH2, getParent, curry2(invoke)($q('#display ul')), prepend, addClickHover, addClickPreview, setNavId, append(doMake('section')()), prepend($('content')), doMake('aside'))();
			config.map(getKeys).map(doRenderNav).forEach(prepareHeadings($q('#navigation ul')));
			//post creation of sidebar
            headers = Grouper.from(headings());
			const getMyLinks = compose(curryL3(invokeMethodBridge)('map')((a) => a.getAttribute('href')), toArray, $$q('#navigation ul li a', true)),
				src = compose(getAttrs('href'), getZero, $$q('#navigation ul li a', true))(),
				machDiv = prepare2Append(doDiv, prepAttrs([setId], ['slideshow'])),
				machControls = prepare2Append(doDiv, prepAttrs([setId], ['controls'])),
				machBase = prepare2Append(doImg, prepAttrs([setSrc, setAlt, setId], [src, 'current', 'base'])),
				machSlide = prepare2Append(doImg, prepAttrs([setSrc, setAlt, setId], [src, 'current', 'slide'])),
				previewer = ptL(replacePath, $$q('#slidepreview img')),
				slideshower = curryL2(replacePath)($$('slide')),
				displayer = curryL2(replacePath)($$('base')),
				thumbs = Grouper.from($q('#navigation ul li', true)),
				addPlayClick = curry2(ptL(lazyVal, 'addEventListener', 'click'))(route).wrap(pass),
				text = ['begin', 'back', 'play', 'forward', 'end'].map(doTextCBNow),
				buttons = compose(getParent, compose(prepend, doMake)('button'));
            
			compose(machSlide, getParent, machBase, getParent, addPlayClick, machControls, machDiv)($('display'));
			text.map(buttons).map(appendCB).map(curry2(invoke)($('controls')));
			headers.setSearch(headers_search_strategy.bind(headers));
			thumbs.setSearch(thumbs_search_strategy.bind(thumbs));
			broadcaster.attach(headers.setFinder.bind(headers));
			broadcaster.attach(thumbs.setFinder.bind(thumbs));
			broadcaster.attach(previewer);
			broadcaster.notify(src);
			looper.build(getMyLinks(), incrementer, []);
			looper.attach(displayer);
			//looper.attach(slideshower);//hide...
			looper.attach(broadcaster.notify.bind(broadcaster));
			/*
            setTimeout(function(){
                looper.forward();
            }, 2222)
		*/
		};
	window.addEventListener('load', loader);
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

let headers = {};

let sliderFactory = function(element) {
 function Slider(el) {
        this.el = el;
        this.handlers = [];
        var that = this;
        this.el.oninput = function() {
            that.notify(this.value, true);
        };
    };
    Slider.prototype = new Publisher();
    Slider.prototype.constructor = Slider;
    return new Slider(element);
}

function router($slider) {
    let player = null;
    const playMaker = function(){
        var func = doAlternate(),
            display_pause = ptL(invokeMethodV, $$('slideshow'), 'classList', 'pause');
        return func([compose(display_pause, always('remove'), $slider.execute.bind($slider, true)), compose(display_pause, always('add'), $slider.undo.bind($slider, null))]);
    },
        loop = deferPTL(invokeMethod, looper),
        set = loop('set'),
        routines = [set(false), loop('back')(null), loop('forward')(null), set(true)],
        play = curry3(invokeMethod)(/play/i)('match');
    return {
    menu: function(e) {
        var found = compose(getText, getTarget)(e),
            which = curry2(ptL(invokeMethodBridge, 'match'))(found),
            i = [/^begin$/, /^back$/, /^forward$/, /^end$/].findIndex(which);
       player = player || playMaker();
 if(found === 'play'){ player(); }
    else {
        player = null;
        $slider.undo();
        if(routines[i]){ routines[i](); }
    }
    },
        sidebar: function (e)  {
			e.preventDefault();
            var img = getImgPath(e),
                visit = false;
			if (matchLink(e)) {
                toArray($q('.active', true)).forEach((el) => el.classList.remove('active'));
				headers.execute(getTarget(e), true);
                visit = true;
			}
            if(img){
                visit = true;
                looper.find(img);;
            }
            if(visit){
                alt = null;
                $slider.undo() 
            }
		}
};
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
    
	const broadcaster = Publisher.from(),
          $recur = recurMaker(300, 99).init(),
          routes = router($recur),
          slider = $("myrange"),
          $slider = sliderFactory(slider),
          prepAttrs = (keys, vals) => curryL33(zip)('map')(keys)(vals),
		prepare2Append = (doEl, doAttrs) => compose(append, curry2(invoke)(doEl), ptL(doIterate, 'forEach'), doAttrs)(),
		doDiv = doMake('div'),
		doImg = doMake('img'),
		doH2 = compose(append, getParent, prepend(doMake('h2')), doText('Navigation'))(),
		doRenderNav = compose(prepend($$('navigation')), setHref, getParent, prepend(doMake('a'))),
		setDiv = prepare2Append(doDiv, prepAttrs([setId], ['slidepreview'])),
		setImg = prepare2Append(doImg, prepAttrs([setAlt], ['currentpicture'])),
		headings = compose(curry2(toArray)(curryL2(negate)(matchPath)), $$q('#navigation a', true)),
        doSliderOutput = ptL(setter, $("demo"), 'innerHTML'),
        doSliderInput = ptL(setter, slider, 'value'),
        doMax = ptL(setter, $("max"), 'innerHTML'),
		addClickPreview = curry2(ptL(lazyVal, 'addEventListener', 'click'))(routes.sidebar).wrap(pass),
		loader = function() {
			//create sidebar
			compose(addImgLoad, setImg, setDiv, getParent, doH2, getParent, curry2(invoke)($q('#display ul')), prepend, addClickHover, addClickPreview, setNavId, append(doMake('section')()), prepend($('content')), doMake('aside'))();
			config.map(getKeys).map(doRenderNav).forEach(prepareHeadings($q('#navigation ul')));
			//post creation of sidebar
            headers = Grouper.from(headings());
			const getExtent = $$q('#navigation ul li a', true),
                  getMyLinks = compose(curryL3(invokeMethodBridge)('map')((a) => a.getAttribute('href')), toArray, getExtent),
				src = compose(getAttrs('href'), getZero, getExtent)(),
				machDiv = prepare2Append(doDiv, prepAttrs([setId], ['slideshow'])),
				machControls = prepare2Append(doDiv, prepAttrs([setId], ['controls'])),
				machButtons = prepare2Append(doDiv, prepAttrs([setId], ['buttons'])),//container for buttons
				machSlider = prepare2Append(doDiv, prepAttrs([setId], ['slidecontainer'])),
				machSliderInput = prepare2Append(doMake('input'), prepAttrs([setType, setMin, setMax, setVal, setId], ['range', 1, 27, 1, 'myrange'])),
				machBase = prepare2Append(doImg, prepAttrs([setSrc, setAlt, setId], [src, 'current', 'base'])),
				machSlide = prepare2Append(doImg, prepAttrs([setSrc, setAlt, setId], [src, 'current', 'slide'])),
				previewer = ptL(replacePath, $$q('#slidepreview img')),
				slideshower = curryL2(replacePath)($$('slide')),
				displayer = curryL2(replacePath)($$('base')),
				thumbs = Grouper.from($q('#navigation ul li', true)),
				addPlayClick = curry2(ptL(lazyVal, 'addEventListener', 'click'))(routes.menu).wrap(pass),
				text = ['begin', 'back', 'play', 'forward', 'end'].map(doTextCBNow),
				buttons = compose(getParent, compose(prepend, doMake)('button')),
                sliderBridge = function(path){
                    var i = looper.get('members').findIndex(curry2(equals)(path));
                    //looper members zero indexed...
                    doSliderInput(i+1);
                    doSliderOutput(i+1);
                };
            
			compose(machSlide, getParent, machBase, getGrandParent, machSliderInput, machSlider, addPlayClick, getParent, machButtons, machControls, machDiv)($('display'));
			text.map(buttons).map(appendCB).map(curry2(invoke)($('buttons')));
			headers.setSearch(headers_search_strategy.bind(headers));
			thumbs.setSearch(thumbs_search_strategy.bind(thumbs));
            
			broadcaster.attach(headers.setFinder.bind(headers));
			broadcaster.attach(thumbs.setFinder.bind(thumbs));
			broadcaster.attach(previewer);
			broadcaster.notify(src);
            
			looper.build(getMyLinks(), incrementer, []);
			looper.attach(displayer);
			looper.attach(broadcaster.notify.bind(broadcaster));
			looper.attach(sliderBridge);
            
            $painter = painter(getTgt('slide'), getTgt('base'), document.body);
            $recur.attach($painter.doOpacity);
           // $recur.attach($painter.cleanup);
            $painter.attach($recur.setPlayer);
            $slider.attach(doSliderOutput);
            $slider.attach(looper.set.bind(looper));
            doMax(getExtent().length);
            
		};
	window.addEventListener('load', loader);

/*
FOP : 17/12/14
BENSON
AFEN : 01/08/15
DIS HOUSE 30/04/16
BP 11/06/12
UKOOA 15/10/13   23/12/15
ORKNEY 26/04/10 08/10/20
SAFARI 31/10/04 - 26/02/04  -22/03/04
*/
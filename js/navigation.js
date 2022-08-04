(function() {
	"use strict";

	
	let headers = {};
	
		const contentarea = $('content'),
		lightbox = document.querySelector('.lightbox'),
              
		
		doDiv = doMake('div'),
		doButton = doMake('button'),
		doAside = doMake('aside'),
		doSection = doMake('section'),
		doLink = doMake('a'),
		doImg = doMake('img'),
		doUL = doMake('ul'),
		doTest = function(x) {
			console.log(x);
			return x;
		},
		getLength = curry2(getter)('length'),
		doH2 = compose(append, getParent, prepend(doMake('h2')), doText('Navigation'))(),
		getZero = curry2(getter)(0),
		getZeroPlus = curry2(getter)(10),
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
		incrementer = compose(doInc, getLength),
		loader = function() {
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
            
            let $recur = (function (count, dur) {
                
                function doRecur() {
					player.inc();
					$recur.t = window.requestAnimationFrame($recur.execute.bind($recur));
				}

				function doOpacity(flag) {
					var slide = $('slide'),
						key,
						val;
                    
					if (slide) {
						val = flag ? 1 : ($recur.i / dur);
						slide.style.opacity = val;
					}
				}
                
                function doPic(pic, src){
                    pic.src = src;
                }

				function doSlide() {
					var s = $('slide'),
						b = $('base');
					doPic(s, b.src);
                    
					s.onload = function() {
                        doOpacity();
                        this.parentNode.classList.add('inplay') 
                        doPic(b, looper.forward().value);
                    }
					b.onload = function() {
                        doRecur();
					}
				}
                
            let player = (function() {				
				return {
					validate: function() {
						return $recur.i <= -1;
					},
					inc: function() {
						$recur.i -= 1;
					},
					reset: function() {
						$recur.i = count;
						doSlide();
					}
				};
			}());
                return {
					execute: function() {
						if (player.validate()) {
							player.reset();
						} else {
							doOpacity();
							doRecur();
						}
					},
					undo: function(flag) {
						doOpacity(flag);
						window.cancelAnimationFrame($recur.t);
						//$controlbar.set(do_static_factory());
						$recur.t = flag; //either set to undefined(forward/back/exit) or null(pause)
						if (!isNaN(flag)) { //is null
							//doMakePause(); //checks path to pause pic
						}
					}
				};
			}(300, 100));
            
            $recur.i = 50;
            
			compose(addImgLoad, setImg, setDiv, getParent, doH2, getParent, curry2(invoke)($q('#display ul')), prepend, addClickHover, addClickPreview, setNavId, append(doSection()), prepend(contentarea), doAside)();
			config.map(getKeys).map(doRenderNav).forEach(prepareHeadings($q('#navigation ul')));

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
			//post creation of sidebar
			headers = Grouper.from(headings())
			headers.setSearch(headers_search_strategy.bind(headers));
			var $$$ = function(str) {
				return function() {
					return document.getElementById(str);
				};
			};
			var getLinks = compose(curryL3(invokeMethodBridge)('map')((a) => a.getAttribute('href')), toArray, $$q('#navigation ul li a', true)),
				src = compose(getAttrs('href'), getZero, $$q('#navigation ul li a', true))(),
				machDiv = prepare2Append(doDiv, prepAttrs([setId], ['slideshow'])),
				machControls = prepare2Append(doDiv, prepAttrs([setId], ['controls'])),
				machBase = prepare2Append(doImg, prepAttrs([setSrc, setAlt, setId], [src, 'current', 'base'])),
				machSlide = prepare2Append(doImg, prepAttrs([setSrc, setAlt, setId], [src, 'current', 'slide'])),
				//beButton = prepare2Append(doMake('button')),
				previewer = ptL(replacePath, $$q('#slidepreview img')),
				slideshower = curryL2(replacePath)($$('slide')),
				displayer = curryL2(replacePath)($$('base')),
				thumbs = Grouper.from($q('#navigation ul li', true)),
				addPlayClick = curry2(ptL(lazyVal, 'addEventListener', 'click'))($recur.execute.bind($recur)).wrap(pass),
                text = ['begin', 'back', 'play', 'forward', 'end'].map(doTextCBNow),
                buttons = compose(getParent, compose(prepend, doMake)('button'))
            
            compose(machSlide, getParent, machBase, getParent, addPlayClick,  machControls, machDiv)($('display'));
            text.map(buttons).map(appendCB).map(curry2(invoke)($('controls')));
            
			thumbs.setSearch(thumbs_search_strategy.bind(thumbs));
			broadcaster.attach(headers.setFinder.bind(headers));
			broadcaster.attach(thumbs.setFinder.bind(thumbs));
			broadcaster.attach(previewer);
			broadcaster.notify(src);
			looper.build(getLinks(), incrementer, []);
			looper.attach(displayer);
			//looper.attach(slideshower);//hide...
			looper.attach(broadcaster.notify.bind(broadcaster));
            /*
            setTimeout(function(){
                looper.forward();
            }, 2222)
		*/
			//slide 100 to 0
			//swap slide src to base src
			//opacity to 100
			//onload /swap base src to next src
			//onload inc
		};
	window.addEventListener('load', loader);
}());
/*jslint nomen: true */
/*global window: false */
/*global document: false */
/*global looper: false */
/*global $: false */
/*global $$: false */
/*global $$q: false */

if (!window.nW1) {
    window.nW1 = {};
}

function onload (img) {
    
}

const getTgt = (str) => $$(str),
	is_inplay = $$q('.inplay'),
	getHeight = curry2(getter)('height'),
      
	testProp = (a, b, getprop) => [a, b].map(getTgt).map((item) => getResult(item)).map(getprop),
	doPic = ptL(setterBridge, 'src'),
	display_pause = ptL(invokeMethodV, $$('slideshow'), 'classList', 'pause'),
	display_swap = curry2(ptL(invokeMethod, document.body.classList))('swap'),
	query_inplay = curry2(ptL(invokeMethod, document.body.classList))('inplay'),
	display_inplay = ptL(invokeMethod, document.body.classList, 'add'),
      advance = compose(curry22(invoke)('inplay')(display_inplay), doPic($$('base')), curry2(getter)('value'), deferPTL(invokeMethod, looper, 'forward', null)),
      reducer = curry3(invokeMethod)(equals)('reduce'),
     updateBase = curry2(doWhenFactory())(advance),
     once = doOnce(2),

	doOpacity = function(o) {
		//$('slide').style.opacity = o || (this.i / this.wait); //paint
		$('slide').style.opacity = o; //paint
	},
	doSwap = function() {
		var bool = compose(reducer)(testProp('base', 'slide', getHeight));
		display_swap(bool ? 'remove' : 'add'); //paint
		return !bool;
	},
	painter = function(slide, base, container) {
		let ret =  {
			doOpacity: function(o) {
				var el = getResult(slide);
				el.style.opacity = o;
			},
            cleanup: function(){
                query_inplay('remove');
                display_pause('remove');
                display_swap('remove');
            }
            
		};
        return nW1.Publish().makepublisher(ret);
	},
	playMaker = function($recur) {
        
        var doLoad = curry22(doWhenFactory())(compose($recur.setPlayer.bind($recur), doSwap))(is_inplay);            
        
		function updateImages(flag) {
			var s = $('slide'),
				b = $('base');
			doPic(s, getImgSrc(b));
			s.onload = () => updateBase(flag);
			b.onload = b.onload || doLoad;
        }
		var fade = {
				validate: function() {
					return $recur.i <= -1;
				},
				inc: function() {
					$recur.i -= 1;
				},
				reset: function(arg) {
					$recur.i = $recur.dur;
					updateImages(true);
				}
			},
                        
            fadeOut = {
				validate: function() {
					return $recur.i <= -.1;
				},
				inc: function() {
					$recur.i -= 1;
				},
				reset: function() {
					updateImages();
                    //ensure fadeIn will follow
					$recur.setPlayer(true);
				}
			},
			fadeIn = {
				validate: function() {
					return $recur.i >= 222;
				},
				inc: function() {
					$recur.i += 1;
				},
				reset: function() {
					doPic($('base'), looper.forward().value);
				}
			},
			actions = [fadeIn, fadeOut];  
                
		return function(flag) {
			return flag ? actions.reverse()[0] : fade;
		};
	},
	recurMaker = function(duration = 100, wait = 50, i = 1, makePub = false) {
        let ret = {
			init: function() {
				this.nextplayer = playMaker(this);
				this.player = this.nextplayer();
				this.dur = duration;
				this.wait = wait;
				this.i = i;
				this.t = null;
				this.handlers = [];
            	return this;
			},
			execute: function() {
				if (this.player.validate()) {
					this.player.reset();
				} else {
					this.notify(this.i / this.wait);
                    this.recur(); 
				}
			},
			undo: function(flag) {
				var o = !isNaN(flag) ? .5 : 1;
                this.notify(o);
                window.cancelAnimationFrame(this.t);
                this.t = flag; //either set to undefined(forward/back/exit) or null(pause)
				if (o === 1) {
                    this.notify(null, 'delete');
                }
			},
			setPlayer: function(arg) {
				this.player = this.nextplayer(arg);
				this.execute();
			},
			recur: function() {
				this.player.inc();
				this.t = window.requestAnimationFrame(this.execute.bind(this));
			}
		};
        if(makePub){
            return nW1.Publish().makepublisher(ret);
        }
        return ret;
	};


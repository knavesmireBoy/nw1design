/*jslint nomen: true */
/*global window: false */
/*global document: false */
/*global looper: false */
/*global $: false */
/*global $$: false */
/*global $$q: false */
const getTgt = (str) => $$(str),
	doOn = function(o, f) {
		o = getResult(o);
		return o ? f(o) : noOp;
	},
	getHeight = curry2(getter)('height'),
	testProp = (a, b, getprop) => [a, b].map(getTgt).map((item) => getResult(item)).map(getprop),
	setPic = (tgt, val) => tgt.src = val,
	doPic = ptL(setterBridge, 'src'),
	display_inplay = ptL(invokeMethod, document.body.classList, 'add'),
	display_swap = curry2(ptL(invokeMethod, document.body.classList))('swap'),
	playMaker = (function() {
		var swapping = $$q('.swap'),
			fadeOut = {
				validate: function() {
					return $recur.i <= -15.5;
				},
				inc: function() {
					$recur.i -= 1;
				},
				reset: function() {
					doSlide();
					setPlayer(swapping());
				}
			},
			fadeIn = {
				validate: function() {
					return $recur.i >= 134.5;
				},
				inc: function() {
					$recur.i += 1;
				},
				reset: function() {
					doPic($('base'), looper.forward().value);
				}
			},
			fade = {
				validate: function() {
					return $recur.i <= -1;
				},
				inc: function() {
					$recur.i -= 1;
				},
				reset: function() {
					$recur.i = this.dur;
					doSlide(true);
				}
			},
			actions = [fadeIn, fadeOut];
		return function(flag) {
			return flag ? actions.reverse()[0] : fade;
		};
	}()),
	recurMaker = function(duration = 100, wait = 50, i = 50, player) {
        
		function doSwap() {
			var bool = testProp('base', 'slide', getHeight).reduce(equals);
			display_swap(bool ? 'remove' : 'add'); //paint
			return !bool;
		}


		function doSlide(flag) {
			var s = $('slide'),
				b = $('base');
			doPic(s, b.src);
			s.onload = function() {
				doOpacity();
				display_inplay('inplay');
				if (flag) {
					doPic(b, looper.forward().value); //broadcast
				}
			}
			b.onload = compose(setPlayer, doSwap);
		}
		return {
			init: function() {
				this.player = player;
				this.dur = duration;
				this.wait = wait;
				this.i = i;
				this.t = null;
                return this;
			},
			execute: function() {
				if (this.player.validate()) {
					player.reset();
				} else {
					this.doOpacity();
					this.recur();
				}
			},
			undo: function(flag) {
				var o = !isNaN(flag) ? .5 : 1;
				this.doOpacity(o);
				if (1) {
					//cleanup
				}
				window.cancelAnimationFrame(this.t);
				//$controlbar.set(do_static_factory());
				this.t = flag; //either set to undefined(forward/back/exit) or null(pause)
				if (!isNaN(flag)) { //is null
					//doMakePause(); //checks path to pause pic
				}
			},
			setPlayer: function(arg) {
				this.player = Playmaker(arg);
				this.execute();
			},
			recur: function () {
				this.player.inc();
				this.t = window.requestAnimationFrame(this.execute.bind(this));
			},
            doOpacity: function(o) {
                $('slide').style.opacity = o || (this.i / this.dur); //paint
            }
		};
	},
      $recur = recurMaker(300, 100, 50, playMaker()).init();

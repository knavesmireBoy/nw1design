/*jslint nomen: true */
/*global window: false */
/*global document: false */
/*global looper: false */
/*global $: false */
/*global $$: false */
/*global $$q: false */

function objectPlus(o, stuff) {
    var n;
    function F() {}
    F.prototype = o;
    n = new F();
    n.uber = o;
    for (var i in stuff) {
        n[i] = stuff[i];
    }
    return n;
}

const getTgt = (str) => $$(str),
	doOn = function(o, f) {
		o = getResult(o);
		return o ? f(o) : noOp;
	},
	getHeight = curry2(getter)('height'),
	testProp = (a, b, getprop) => [a, b].map(getTgt).map((item) => getResult(item)).map(getprop),
	setPic = (tgt, val) => tgt.src = val,
	doPic = ptL(setterBridge, 'src'),
	display_swap = curry2(ptL(invokeMethod, document.body.classList))('swap'),
      display_inplay = ptL(invokeMethod, document.body.classList, 'add'),
    doOpacity = function(o) {
                $('slide').style.opacity = o || (this.i / this.wait); //paint
            },
      doSwap = function () {
			var bool = testProp('base', 'slide', getHeight).reduce(equals);
			display_swap(bool ? 'remove' : 'add'); //paint
			return !bool;
		},
      
      painter = function(slide, base, container){
          
          return {
              handlers: [],
              doOpacity: function(o) {
                  var el = getResult(slide);
                  el.style.opacity = o;
              },
            doSlide: function(flag) {
                var s = getResult(slide),
                    b = getResult(base),
                that = this;
                s.setAttribute('src', b.getAttribute(src));
                s.onload = function() {
                    doOpacity.call(that);
                    display_inplay('inplay');
                    if (flag) {
                        b.setAttribute('src', looper.forward().value)
                    }
                }
                //b.onload = compose($recur.setPlayer.bind($recur), doSwap);
                b.onload = ptL(that.notify, doWrap());
            },
              attach: function(h) {
              this.handlers.push(h);
            },
            notify: function(...arg){
                this.handlers.forEach((f) => f(...arg));
            },
      };
      },
      
	playMaker = function($recur) {
        

		function doSlide(flag) {
			var s = $('slide'),
				b = $('base');
			doPic(s, b.src);
			s.onload = function() {
				doOpacity.call($recur);
				display_inplay('inplay');
				if (flag) {
					doPic(b, looper.forward().value); //broadcast
				}
			}
			b.onload = compose($recur.setPlayer.bind($recur), doSwap);
		}
        
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
					$recur.setPlayer(swapping());
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
					$recur.i = $recur.dur;
					doSlide(true);
				}
			},
			actions = [fadeIn, fadeOut];
		return function(flag) {
			return flag ? actions.reverse()[0] : fade;
		};
	},
	recurMaker = function(duration = 100, wait = 50, i = 50) {
        
		return {
			init: function() {
				this.play = playMaker(this);
                this.player = this.play();
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
				this.player = this.play(arg);
				this.execute();
			},
			recur: function () {
				this.player.inc();
				this.t = window.requestAnimationFrame(this.execute.bind(this));
			},
            attach: function(h) {
              this.handlers.push(h);
            },
            notify: function(...arg){
                this.handlers.forEach((f) => f(...arg));
            }
		};
	},
      $recur = recurMaker(300, 100, 50).init(),
      $painter = painter(getTgt('slide'), getTgt('base'), document.body);
$recur.attach($painter.doOpacity);
$painter.attach($recur.setPlayer);

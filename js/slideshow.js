/*jslint nomen: true */
/*global window: false */
/*global document: false */
/*global looper: false */
/*global $: false */
/*global $$q: false */
var $recur = (function(count, dur, player) {
    function test() {
		return [$$('base'), $$('slide')].map(function(f) {
			return f().height;
		});
	}

	function doSwap() {
		var coll = test(),
			bool = coll[0] === coll[1],
			body = document.body.classList,
			m = bool ? 'remove' : 'add';
		body[m]('swap');
		return !bool;
	}
    
     function setPlayer(arg) {
         player = playmaker(arg);
         $recur.execute();
			}
            

	function doRecur() {
		player.inc();
		$recur.t = window.requestAnimationFrame($recur.execute.bind($recur));
	}

	function doOpacity(flag) {
		var slide = $('slide'),
			val;
		if (slide) {
			val = flag ? 1 : ($recur.i / dur);
			slide.style.opacity = val;
		}
	}

	function doPic(pic, src) {
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
        b.onload = function(){
           console.log(this.src, s.src);
            setPlayer(doSwap());
        }
	}
	var playmaker = (function() {
		var doPlay = compose(curry2(getter)('value'), looper.forward.bind(looper)),
			//doBase = ptL(invoke, loadImageBridge, doPlay, 'base', setPlayer, doSwap),
			doBase = function(){
             // setPlayer(doSwap());
             $('base').src = doPlay();
            },
			swapping = $$q('.swap'),
			fadeOut = {
				validate: function() {
					return $recur.i <= -15.5;
				},
				inc: function() {
					$recur.i -= 1;
				},
				reset: function() {
                   //doBase();
					//setPlayer(swapping());
                    doSlide();
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
                   // con('hello')
                   // setPlayer(doSwap());
                   doSlide();
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
					$recur.i = count;
                    doSlide();   
				}
			},
            actions = [fadeIn, fadeOut];
		return function(flag) {
			return flag ? actions.reverse()[0] : fade;
			//return fade;
		};
	}());
	player = playmaker();
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
}(155, 50, {}));
$recur.i = 50;
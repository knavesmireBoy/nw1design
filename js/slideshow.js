/*jslint nomen: true */
/*global window: false */
/*global document: false */
/*global looper: false */
/*global $: false */
/*global $$: false */
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
			val = flag || ($recur.i / dur);
			slide.style.opacity = val;
		}
	}

	function doPic(pic, src) {
		pic.src = src;
	}

	function doSlide(flag) {
		var s = $('slide'),
			b = $('base');
		doPic(s, b.src);
		s.onload = function() {
			doOpacity();
			this.parentNode.classList.add('inplay');
            if(flag) {
                doPic(b, looper.forward().value);
            }
		}
        b.onload = function(){
          setPlayer(doSwap());
        }
	}
	var playmaker = (function() {
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
					$recur.i = count;
					doSlide(true);
				}
			},
            actions = [fadeIn, fadeOut];
		return function(flag) {
			return flag ? actions.reverse()[0] : fade;
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
            var o = !isNaN(flag) ? .5 : 1;
			doOpacity(o);
			window.cancelAnimationFrame($recur.t);
			//$controlbar.set(do_static_factory());
			$recur.t = flag; //either set to undefined(forward/back/exit) or null(pause)
			if (!isNaN(flag)) { //is null
				//doMakePause(); //checks path to pause pic
			}
		}
	};
}(99, 20, {}));
$recur.i = 50;
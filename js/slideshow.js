/*jslint nomen: true */
/*global window: false */
/*global document: false */
/*global looper: false */
/*global $: false */
/*global $$: false */
/*global $$q: false */

var swapping = $$q('.swap'),
      getTgt = (str) => $$(str),
        doOn = function(o, f) {
            o = getResult(o);
            return o ? f(o) : noOp;
        },
      getHeight = curry2(getter)('height'),
      testProp = (a, b, getprop) => [a, b].map(getTgt).map((item) => getResult(item)).map(getprop),
      setPic = (tgt, val) => tgt.src = val,
      doPic = ptL(setterBridge, 'src'),
        display_inplay = ptL(invokeMethod, document.body.classList, 'add'),
        display_swap = curry2(ptL(invokeMethod, document.body.classList))('swap');


var $recur = (function(count, dur, player) {
    
	function doSwap() {
        var bool = testProp('base', 'slide', getHeight).reduce(equals);
        display_swap(bool ? 'remove' : 'add');//paint
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

	function doOpacity(o) {  
        $('slide').style.opacity = o || ($recur.i / dur);//paint
	}

	function doSlide(flag) {
		var s = $('slide'),
			b = $('base');
		doPic(s, b.src);
		s.onload = function() {
            doOpacity();
            display_inplay('inplay');
            if(flag) {
                doPic(b, looper.forward().value);//broadcast
            }
		}
        b.onload = compose(setPlayer, doSwap);
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
            if(1){
                //cleanup
            }
			window.cancelAnimationFrame($recur.t);
			//$controlbar.set(do_static_factory());
			$recur.t = flag; //either set to undefined(forward/back/exit) or null(pause)
			if (!isNaN(flag)) { //is null
				//doMakePause(); //checks path to pause pic
			}
		}
	};
}(300, 100, {}));
$recur.i = 50;
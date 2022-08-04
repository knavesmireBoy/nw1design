/*jslint nomen: true */
/*global window: false */
/*global nW1: false */
if (!window.nW1) {
	window.nW1 = {};
}


const $recurFactory = function (count, dur) {
                
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
			};
            
            $recurFactory.i = 50;
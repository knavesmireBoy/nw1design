

let meplayer = {
    function doRecur() {
	player.inc();
	$recur.t = window.requestAnimationFrame(_.bind($recur.execute, $recur));
}

function doOpacity(flag) {
	var slide = $('slide'),
		key,
		val;
	if (slide) {
		val = flag ? 1 : ($recur.i / 100);
        slide.style.opacity = val;
	}
}
    
    function doSlide(){
    var s = $('slide'),
        b = $('base');
    s.src = b.src;
    
    s.onload(){
        this.style.opacity = $recur.i;
        b.src = $looper.forward();
    }
    b.onload() {
        doRecur();
    }
}
	
    
    return {
	validate: function() {
		//utils.report($recur.i);
		return $recur.i <= -1;
	},
	inc: function() {
		$recur.i -= 1;
	},
	reset: function() {
		$recur.i = 150;
		doSlide();
		doOpacity();
		doBase();
		//$controlbar.execute();
	}
};

}
let $recur = ((player) {

              
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
}(meplayer));
/*
            	$recur = (function (player) {
        
			function test() {
				return _.map([getBaseChild(), getSlideChild()], function (img) {
					return img && img.width > img.height;
				});
			}

			function doSwap() {
				var coll = test(),
					bool = coll[0] === coll[1],
					body = utils.getClassList(utils.getBody()),
					m = bool ? 'remove' : 'add';
				body[m]('swap');
				return !bool;
			}

			function doRecur() {
				player.inc();
				$recur.t = window.requestAnimationFrame(_.bind($recur.execute, $recur));
			}

			function doOpacity(flag) {
				var slide = $('slide'),
					key,
                    val;
				if (slide) {
					val = flag ? 1 : ($recur.i / 100);
					val = cssopacity.getValue(val);
                    key = cssopacity.getKey();
                    doMap(slide, [
						[
							[key, val]
						]
					]);
				}
			}
			var playmaker = (function () {
				var setPlayer = function (arg) {
						player = playmaker(arg);
						$recur.execute();
					},
					doPlay = doComp(doVal, _.bind($looper.forward, $looper, true)),
					doBase = ptL(invoke, loadImageBridge, doPlay, 'base', setPlayer, doSwap),
					doSlide = ptL(invoke, loadImageBridge, doComp(utils.drillDown(['src']), utils.getChild, utils.getChild, $$('base')), 'slide', doOrient),
					fadeOut = {
						validate: function () {
							return $recur.i <= -15.5;
						},
						inc: function () {
							$recur.i -= 1;
						},
						reset: function () {
							doSlide();
							setPlayer(swapping());
						}
					},
					fadeIn = {
						validate: function () {
							return $recur.i >= 134.5;
						},
						inc: function () {
							$recur.i += 1;
						},
						reset: function () {
							doBase();
						}
					},
					fade = {
						validate: function () {
                            //utils.report($recur.i);
							return $recur.i <= -1;
						},
						inc: function () {
							$recur.i -= 1;
						},
						reset: function () {
							$recur.i = 150;
							doSlide();
							doOpacity();
							doBase();
							$controlbar.execute();
						}
					},
					actions = [fadeIn, fadeOut];
				return function (flag) {
					return flag ? actions.reverse()[0] : fade;
				};
			}());
			player = playmaker();
			return 
            */
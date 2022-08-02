/*jslint nomen: true */
/*global window: false */
/*global nW1: false */
if (!window.nW1) {
	window.nW1 = {};
}

nW1.Looper = function () {
	"use strict";
    
        	/* don't use partially applied callbacks in map, forEach etc.. as argument length will confound...*/
	function doPartial(flag) {
		return function p(f, ...vs) {
			if (f.length === vs.length) {
				return flag ? () => f(...vs) : f(...vs);
			}
			return (...rest) => p(f, ...vs, ...rest);
		};
	}
    
    const curry2 = fun => b => a => fun(a, b),
          getter = (o, p) => o[p],
          compose = (...fns) => fns.reduce((f, g) => (...vs) => f(g(...vs))),
          deferPTL = doPartial(true),
          ptL = doPartial(),
          negate = (f, lastarg) => !f(lastarg),
          tagTester = (name) => {
              var tag = '[object ' + name + ']';
              return function(obj) {
                  return toString.call(obj) === tag;
              };
          },
          isBoolean = tagTester('Boolean'),
          isFunction = tagTester('Function');

    function getResult(o) {
		if (isFunction(o)) {
			return o();
		}
		return o;
	}

	function equals(a, b) {
		return a === b;
	}

	function modulo(n, i) {
		return i % n;
	}

	function increment(i) {
		return i + 1;
	}

	function doInc(n) {
		return compose(ptL(modulo, n), increment);
	}

	function makeProxyIterator(src, tgt, methods) {
		function mapper(method) {
			if (src[method] && isFunction(src[method])) {
				tgt[method] = function () {
					return this.$subject[method].apply(this.$subject, arguments);
				};
			}
		}
		tgt.setSubject(src);
		methods.forEach(mapper);
		return tgt;
	}
	nW1.LoopIterator = function (group, advancer) {
		this.group = group;
		this.position = 0;
		this.rev = false;
		this.advance = advancer;
	};
	nW1.Group = function () {
		this.members = [];
	};
	nW1.Group.prototype = {
		constructor: nW1.Group,
		add: function (value) {
			if (!this.has(value)) {
				this.members.push(value);
			}
		},
		remove: function (value) {
			this.members.filter(negate(ptL(equals, value)));
		},
		has: function (value) {
			return this.members.includes(value);
		},
		visit: function (cb) {
			this.members.forEach(cb, this);
		}
	};
	nW1.Group.from = function (collection) {
		var group = new nW1.Group(),
			i,
			L = collection.length;
		for (i = 0; i < L; i += 1) {
			group.add(collection[i]);
		}
		return group;
	};
    
	nW1.LoopIterator.from = function (coll, advancer) {
		return new nW1.LoopIterator(nW1.Group.from(coll), advancer);
	};
	nW1.LoopIterator.onpage = null;
	nW1.LoopIterator.prototype = {
		constructor: nW1.LoopIterator,
		back: function (flag) {
			if (!this.rev || (flag && isBoolean(flag))) {
				this.group.members = this.group.members.reverse();
				this.position = this.group.members.length - 2 - (this.position);
				this.position = this.advance(this.position);
				this.rev = !this.rev;
			}
			return this.forward(this.rev);
		},
		find: function (tgt) {
			return this.set(this.group.members.findIndex(ptL(equals, tgt)));
		},
		forward: function (flag) {
			if (!flag && this.rev) {
				return this.back(true);
			}
			this.position = this.advance(this.position);
			return this.status();
		},
		get: function (m = 'value') {
			return this.status()[m];
		},
		set: function (pos) {
			if (!isNaN(parseFloat(pos)) && pos >= 0) {
				this.position = pos;
			}
			return {
				value: this.group.members[this.position],
				index: this.position
			};
		},
		status: function () {
			return {
				members: this.group.members,
				value: this.group.members[this.position],
				index: this.position
			};
		},
		visit: function (cb) {
			this.group.visit(cb);
		}
	};
	var target = {
			setSubject: function (s) {
				this.$subject = s;
			},
			getSubject: function () {
				return this.$subject;
			},
			build: function (coll, advancer) {
				this.setSubject(nW1.LoopIterator.from(coll, advancer(coll)));
			}
		},
		doGet = curry2(getter),
		getLength = doGet('length'),
		incrementer = compose(doInc, getLength);
	return makeProxyIterator(nW1.LoopIterator.from([], incrementer), target, ['back', 'status', 'find', 'forward', 'get', 'play', 'set', 'visit']);
};
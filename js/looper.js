/*jslint nomen: true */
/*global window: false */
/*global Publisher: false */
/*global nW1: false */
if (!window.nW1) {
  window.nW1 = {};
}

nW1.Looper = function() {
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

  function getResult(o) {
    if (isFunction(o)) {
      return o();
    }
    return o;
  }

  const curry2 = fun => b => a => fun(a, b),
    curry22 = fun => b => a => () => fun(a, b),
    curryL3 = fun => a => b => c => fun(a, b, c),
    invokeMethod = (o, m, v) => o[m](v),
    invokeMethodBridge = (m, v, o) => {
      return invokeMethod(getResult(o), m, v);
    },
    getter = (o, p) => o[p],
    compose = (...fns) => fns.reduce((f, g) => (...vs) => f(g(...vs))),
    ptL = doPartial(),
    negate = (f, lastarg) => !f(lastarg),
    tagTester = (name) => {
      const tag = '[object ' + name + ']';
      return function(obj) {
        return toString.call(obj) === tag;
      };
    },
    isBoolean = tagTester('Boolean'),
    isFunction = tagTester('Function');

    function preNotify() {
      this.notify(this.get());
      this.position = this.advance(this.position);
      return this.status();
    }
    function postNotify() {
      this.position = this.advance(this.position);
      this.notify(this.get());
      return this.status();
    }

  function makeProxyIterator(src, tgt, methods) {
    function mapper(method) {
      if (src[method] && isFunction(src[method])) {
        tgt[method] = function() {
          return this.$subject[method].apply(this.$subject, arguments);
        };
      }
    }
    tgt.setSubject(src);
    methods.forEach(mapper);
    return tgt;
  }

  class LoopIterator extends Publisher {
    constructor(group = [], advancer = () => 1, handlers = []) {
      super(handlers);
      this.group = group;
      this.position = 0;
      this.rev = false;
      this.advance = advancer;
    }
    back(flag) {
      if (!this.rev || (flag && isBoolean(flag))) {
        this.group.members = this.group.members.reverse();
        this.position = this.group.members.length - 2 - (this.position);
        this.position = this.advance(this.position);
        this.rev = !this.rev;
      }
      return this.forward(this.rev);
    }
    forward(flag) {
      /*
      when slidehow is playing the sidebar column will be receiving the src of the base pic
      which won't correspond to the current visible (slide) pic in the main display area
      so we notify, THEN advance
      not happy it depends on a flag maybe a fresh looper is required
      */

      if (!flag && this.rev) {
        return this.back(true);
      }
      if(flag){
        return preNotify.call(this);
      }
      return postNotify.call(this);
    }
    find(tgt) {
      // return this.set(_.findIndex(this.group.members, _.partial(equals, tgt)));
      const match = curryL3(invokeMethodBridge)('match'),
        cb = compose(match, curry2(getter)(1), ptL(invokeMethod, /\/(\w+)_/, 'exec'))(tgt);
      this.set(this.group.members.findIndex(cb));
      this.notify(this.get());
    }
    get(m = 'value') {
      return this.status()[m];
    }
    set(pos, flag) {
      //override ideally if an integer is being sent by an input slider it won't be zero indexed
      const ps = flag ? pos - 1 : pos;
      //receives an integer or ...
      if (!isNaN(parseFloat(ps)) && ps >= 0 && this.group.members[ps]) {
        this.position = ps;
      } else {
        this.position = ps ? this.group.members.length - 1 : 0;
      }
      this.notify(this.get());
      return {
        value: this.group.members[this.position],
        index: this.position
      };
    }
    status() {
      return {
        members: this.group.members,
        value: this.group.members[this.position],
        index: this.position,
        rev: this.rev
      };
    }
    visit(cb) {
      this.group.visit(cb);
    }
    static from(coll, advancer, handlers = []) {
      return new LoopIterator(Group.from(coll), advancer, handlers);
    }
  }
  class Group {
    constructor(m = []) {
      this.members = m;
    }
    add(value) {
      if (!this.has(value)) {
        this.members.push(value);
      }
    }
    remove(value) {
      this.members = this.members.filter(negate(ptL(equals, value)));
    }
    has(value) {
      return this.members.includes(value);
    }
    visit(cb) {
      this.members.forEach(cb, this);
    }
    static from(collection) {
      let group = new Group(),
        i,
        L = collection.length;
      for (i = 0; i < L; i += 1) {
        group.add(collection[i]);
      }
      return group;
    }
  }
  const target = {
      setSubject: function(s) {
        this.$subject = s;
      },
      getSubject: function() {
        return this.$subject;
      },
      build: function(coll, advancer, handlers = []) {
        this.setSubject(LoopIterator.from(coll, advancer(coll), handlers));
      }
    },
    doGet = curry22(getter),
    incrementer = compose(doInc, doGet('length')),
    methods = ['attach', 'back', 'status', 'find', 'forward', 'get', 'notify', 'play', 'set', 'visit'];
  return makeProxyIterator(LoopIterator.from([], incrementer, []), target, methods);
};

/*jslint nomen: true */
/*global Publisher: false */
/*global nW1: false */
/* eslint-disable indent */

if (!window.nW1) {
  window.nW1 = {};
}

nW1.Looper = (function () {
  "use strict";

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

  const meta = nW1.meta,
    curry2 = meta.curryRight(2),
    curry22 = meta.curryRight(2, true),
    curryL3 = meta.curryLeft(3),
    getter = (o, p) => o[p],
    compose = meta.compose,
    ptL = meta.doPartial(),
    isBoolean = meta.tagTester("Boolean"),
    isFunction = meta.tagTester("Function"),
    equals = (a, b) => a === b,
    modulo = (n, i) => i % n,
    increment = (i) => i + 1,
    doInc = (n) => compose(ptL(modulo, n), increment),
    makeProxyIterator = (src, tgt, methods) => {
      const mapper = (method) => {
        if (src[method] && isFunction(src[method])) {
          tgt[method] = function () {
            return this.$subject[method].apply(this.$subject, arguments);
          };
        }
      };
      tgt.setSubject(src);
      methods.forEach(mapper);
      return tgt;
    };

  class LoopIterator extends Publisher {
    constructor(group = [], advancer = () => 1, flag = false) {
      super();
      this.group = group;
      this.position = 0;
      this.rev = false;
      this.advance = advancer;
      this.setStrategy(flag);
    }
    back(flag) {
      if (!this.rev || (flag && isBoolean(flag))) {
        this.group.members = this.group.members.reverse();
        this.position = this.group.members.length - 2 - this.position;
        this.position = this.advance(this.position);
        this.rev = !this.rev;
      }
      return this.forward(this.rev);
    }
    forward(flag) {
      /*
    when slidehow is playing the sidebar column will be receiving the src of the base pic
    which won't correspond to the current visible (slide) pic in the main display area
    so we notify, THEN advance, setStrategy
    */
      if (!flag && this.rev) {
        return this.back(true);
      }
      return this.notifier.call(this);
    }
    find(tgt) {
      // return this.set(_.findIndex(this.group.members, _.partial(equals, tgt)));
      const match = curryL3(meta.invokeMethodBridge)("match"),
        cb = compose(
          match,
          curry2(getter)(1),
          ptL(meta.invokeMethod, /\/(\w+)_/, "exec")
        )(tgt);
      this.set(this.group.members.findIndex(cb));
      this.notify(this.get());
    }
    get(m = "value") {
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
    setStrategy(flag) {
      this.notifier = flag ? preNotify : postNotify;
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
    static from(coll, advancer) {
      return new LoopIterator(Group.from(coll), advancer);
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
      this.members = this.members.filter(meta.negate(ptL(equals, value)));
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
      setSubject: function (s) {
        this.$subject = s;
      },
      getSubject: function () {
        return this.$subject;
      },
      build: function (coll, advancer) {
        this.setSubject(LoopIterator.from(coll, advancer(coll)));
      }
    },
    doGet = curry22(getter),
    incrementer = compose(doInc, doGet("length")),
    methods = [
      "attach",
      "back",
      "status",
      "find",
      "forward",
      "get",
      "notify",
      "play",
      "set",
      "visit",
      "setStrategy"
    ];

  return makeProxyIterator(
    LoopIterator.from([], incrementer),
    target,
    methods
    );
  }());

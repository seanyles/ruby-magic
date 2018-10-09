
class Ruby {
  constructor(value) {
    this.value = value;
  }

  class() {
    return typeof this.value;
  }

  derubify() {
    return this.value;
  }

  toString() {
    if (this.value === null || this.value === undefined) {
      return '';
    } return this.value.toString();
  }

  toBoolean() {
    return Boolean(this.value);
  }
}

class RubyArray extends Ruby {
  static class() {
    return 'array';
  }

  length() {
    return this.value.length;
  }

  index(n) {
    return this.value[n];
  }

  first() {
    return this.value[0];
  }

  last() {
    return this.value[this.value.length - 1];
  }

  second() {
    return this.value[1];
  }

  third() {
    return this.value[2];
  }

  fourth() {
    return this.value[3];
  }

  fifth() {
    return this.value[4];
  }

  sixth() {
    return this.value[5];
  }

  seventh() {
    return this.value[6];
  }

  eighth() {
    return this.value[7];
  }

  ninth() {
    return this.value[8];
  }

  product(arr) {
    const array = degem(arr);
    const ans = [];
    this.value.forEach((item1) => {
      array.forEach((item2) => {
        ans.push([item1, item2]);
      });
    });
    return ans;
  }

  uniq() {
    const unique = [];
    this.value.forEach((item) => {
      if (!unique.includes(item)) {
        unique.push(item);
      }
    });
    return unique;
  }

  flatten(depth) {
    const flat = [];
    const d = degem(depth);
    this.value.forEach((item) => {
      const member = rubify(item);
      if (!Array.isArray(item) || d === 0) {
        flat.push(item);
      } else if (d > 0) {
        flat.push(...member.flatten(d - 1));
      } else {
        flat.push(...member.flatten());
      }
    });
    return flat;
  }

  maxBy(func) {
    return this.value.reduce((winner, contender) => {
      if (func(contender) > func(winner)) {
        return contender;
      } return winner;
    });
  }

  minBy(func) {
    if (this.value.length === 0) { return null; }
    return this.value.reduce((winner, contender) => {
      if (func(contender) < func(winner)) {
        return contender;
      } return winner;
    });
  }

  eachWithObject(acc, func) {
    const accumulator = degem(acc);
    this.value.forEach(value => func(value, accumulator));
    return accumulator;
  }

  merge(other) {
    degem(other).forEach(val => (this.value.includes(val) ? null : this.value.push(val)));
  }

  compact() {
    return this.value.filter(arg => arg);
  }
}

class RubyString extends Ruby {
  length() {
    return this.value.length;
  }

  casecmp(other) {
    const self = this.value.toLowerCase();
    const otherStr = other.toLowerCase();
    if (self === otherStr) {
      return 0;
    } if (self.includes(otherStr)) {
      return 1;
    } return -1;
  }
}

class RubyHash extends Ruby {
  constructor(hash) {
    super(hash);
    Object.keys(this.value).forEach((key) => {
      this[key] = this.value[key];
    });
  }

  compact() {
    const ans = {};
    Object.keys(this.value).forEach((key) => {
      if (this.value[key] !== null) {
        ans[key] = this.value[key];
      }
    });
    return ans;
  }

  transformKeys(func) {
    const obj = {};
    Object.keys(this.value).forEach((oldKey) => {
      const newKey = func(oldKey);
      obj[newKey] = this.value[oldKey];
    });
    return obj;
  }

  slice(keys) {
    const allowedKeys = degem(keys);
    const obj = {};
    Object.keys(this.value)
      .filter(key => allowedKeys.includes(key)).forEach((key) => {
        obj[key] = this.value[key];
      });
    return obj;
  }

  values() {
    const vals = [];
    Object.keys(this.value).forEach(key => vals.push(this.value[key]));
    return vals;
  }

  keys() {
    return Object.keys(this.value);
  }

  get(key) {
    return this.value[key];
  }
}

class RubyNumber extends Ruby {}

class RubyBoolean extends Ruby {}

function degem(param) {
  if (param instanceof Ruby) {
    return param.derubify();
  } return param;
}

function inheritFromJsClass(jsParent, rubyChild) {
  Object.getOwnPropertyNames(jsParent)
    .filter(p => !Object.getOwnPropertyNames(rubyChild).includes(p))
    .forEach((p) => {
      if (typeof jsParent[p] === 'function') {
        rubyChild[p] = function (...args) {
          const degemmed = args.map(arg => degem(arg));
          return jsParent[p].apply(this.value, degemmed);
        };
      }
    });
  funcR(rubyChild);
}

function funcR(rubyPro) {
  Object.getOwnPropertyNames(rubyPro)
    .filter(p => typeof rubyPro[p] === 'function')
    .forEach((p) => {
      if (!Object.getOwnPropertyNames(rubyPro).includes(`${p}R`)) {
        rubyPro[`${p}R`] = function (...args) {
          return rubify(rubyPro[p].apply(this, args));
        };
      }
    });
}

inheritFromJsClass(Array.prototype, RubyArray.prototype);
inheritFromJsClass(Number.prototype, RubyNumber.prototype);
inheritFromJsClass(Boolean.prototype, RubyBoolean.prototype);
inheritFromJsClass(String.prototype, RubyString.prototype);
inheritFromJsClass(Object.prototype, RubyHash.prototype);

function rubify(value) {
  if (value instanceof Ruby) return value;
  switch (typeof value) {
    case 'object':
      if (value === null) return new Ruby(null);
      if (Array.isArray(value)) return new RubyArray(value);
      return new RubyHash(value);
    case 'number':
      return new RubyNumber(value);
    case 'string':
      return new RubyString(value);
    case 'boolean':
      return new RubyBoolean(value);
    case 'function':
      return value;
    default:
      return new Ruby(value);
  }
}

module.exports.rubify = rubify;

// Generated by CoffeeScript 2.3.0
(function() {
  // require '../../../../testml-compiler/lib/testml-compiler/prelude'
  var lodash;

  require('../testml');

  lodash = require('lodash');

  module.exports = TestML.Run = (function() {
    class Run {
      //----------------------------------------------------------------------------
      constructor(params = {}) {
        var testml;
        ({file: this.file, bridge: this.bridge, stdlib: this.stdlib, testml = {}} = params);
        ({testml, code: this.code, data: this.data} = testml);
        this.version = testml;
        if (!TestML.browser) {
          global._ = lodash;
        }
        return;
      }

      from_file(file) {
        var fs, testml;
        this.file = file;
        fs = require('fs');
        ({testml, code: this.code, data: this.data} = JSON.parse(this.file === '-' ? fs.readFileSync('/dev/stdin').toString() : fs.readFileSync(this.file).toString()));
        this.version = testml;
        return this;
      }

      test() {
        this.initialize();
        this.testml_begin();
        this.exec_func([], this.code);
        this.testml_end();
      }

      //----------------------------------------------------------------------------
      getp(name) {
        var value;
        if (!this.block) {
          return;
        }
        value = this.block.point[name];
        if (_.isArray(value)) {
          value = this.exec(value)[0];
        }
        return value;
      }

      getv(name) {
        return this.vars[name];
      }

      setv(name, value) {
        this.vars[name] = value;
      }

      //----------------------------------------------------------------------------
      exec(expr, context = []) {
        var args, call, name, opcode, ref, return_;
        if (!(_.isArray(expr)) || _.isArray(expr[0]) || _.isString(expr[0]) && expr[0].match(/^(?:=>|\/|\?|\!)$/)) {
          return [expr];
        }
        args = _.clone(expr);
        opcode = name = args.shift();
        if (call = this.constructor.vtable[opcode]) {
          return_ = this[call](...args);
        } else {
          args = _.map(args, (x) => {
            if (_.isArray(x)) {
              return this.exec(x)[0];
            } else {
              return x;
            }
          });
          args.unshift(...(_.reverse(context)));
          if (name.match(/^[a-z]/)) {
            call = name.replace(/-/g, '_');
            if (!((ref = this.bridge) != null ? ref[call] : void 0)) {
              throw `Can't find bridge function: '${name}'`;
            }
            return_ = this.bridge[call](...args);
          } else if (name.match(/^[A-Z]/)) {
            call = _.lowerCase(name);
            if (!this.stdlib[call]) {
              throw `Unknown TestML Standard Library function: '${name}'`;
            }
            return_ = this.stdlib[call](...args);
          } else {
            throw `Can't resolve TestML function '${name}'`;
          }
        }
        if (return_ === void 0) {
          return [];
        } else {
          return [return_];
        }
      }

      exec_func(context, [signature, ...function_]) {
        var i, len, statement;
        for (i = 0, len = function_.length; i < len; i++) {
          statement = function_[i];
          this.exec(statement);
        }
      }

      exec_expr(...args) {
        var call, context, i, len;
        context = [];
        for (i = 0, len = args.length; i < len; i++) {
          call = args[i];
          context = this.exec(call, context);
        }
        if (!context.length) {
          return;
        }
        return context[0];
      }

      pick_loop(list, expr) {
        var block, i, j, len, len1, pick, point, ref;
        ref = this.data;
        for (i = 0, len = ref.length; i < len; i++) {
          block = ref[i];
          pick = true;
          for (j = 0, len1 = list.length; j < len1; j++) {
            point = list[j];
            if ((point.match(/^\*/) && (block.point[point.slice(1)] == null)) || (point.match(/^\!\*/) && (block.point[point.slice(2)] != null))) {
              pick = false;
              break;
            }
          }
          if (pick) {
            this.block = block;
            this.exec(expr);
          }
        }
        this.block = void 0;
      }

      get_str(string) {
        return this.interpolate(string);
      }

      get_point(name) {
        return this.getp(name);
      }

      set_var(name, expr) {
        this.setv(name, this.exec(expr)[0]);
      }

      assert_eq(left, right, label) {
        var got, method, want;
        this.vars.Got = got = this.exec(left)[0];
        this.vars.Want = want = this.exec(right)[0];
        method = this.get_method('assert_eq', got, want);
        this[method](got, want, label);
      }

      assert_str_eq_str(got, want, label) {
        return this.testml_eq(got, want, this.get_label(label));
      }

      assert_num_eq_num(got, want, label) {
        return this.testml_eq(got, want, this.get_label(label));
      }

      assert_bool_eq_bool(got, want, label) {
        return this.testml_eq(got, want, this.get_label(label));
      }

      assert_has(left, right, label) {
        var got, method, want;
        this.vars.Got = got = this.exec(left)[0];
        this.vars.Want = want = this.exec(right)[0];
        method = this.get_method('assert_has', got, want);
        this[method](got, want, label);
      }

      assert_str_has_str(got, want, label) {
        return this.testml_eq(got, want, this.get_label(label));
      }

      assert_like(left, right, label) {
        var got, method, want;
        got = this.exec(left)[0];
        want = this.exec(right)[0];
        method = this.get_method('assert_like', got, want);
        this[method](got, want, label);
      }

      assert_str_like_regex(got, want, label) {
        this.vars.Got = got;
        this.vars.Want = `/${want[1]}/`;
        return this.testml_like(got, want, this.get_label(label));
      }

      assert_str_like_list(got, want, label) {
        var i, len, ref, regex, results;
        ref = want[0];
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          regex = ref[i];
          results.push(this.assert_str_like_regex(got, regex, label));
        }
        return results;
      }

      assert_list_like_regex(got, want, label) {
        var i, len, ref, results, str;
        ref = got[0];
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          str = ref[i];
          results.push(this.assert_str_like_regex(str, want, label));
        }
        return results;
      }

      assert_list_like_list(got, want, label) {
        var i, len, ref, regex, results, str;
        ref = got[0];
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          str = ref[i];
          results.push((function() {
            var j, len1, ref1, results1;
            ref1 = want[0];
            results1 = [];
            for (j = 0, len1 = ref1.length; j < len1; j++) {
              regex = ref1[j];
              results1.push(this.assert_str_like_regex(str, regex, label));
            }
            return results1;
          }).call(this));
        }
        return results;
      }

      //----------------------------------------------------------------------------
      initialize() {
        this.code.unshift([]);
        this.data = _.map(this.data, (block) => {
          return new TestML.Block(block);
        });
        if (!this.bridge) {
          this.bridge = new (require(process.env.TESTML_BRIDGE));
        }
        if (!this.stdlib) {
          this.stdlib = new (require('../testml/stdlib'))(this);
        }
      }

      get_method(key, ...args) {
        var arg, i, len, method, sig;
        sig = [];
        for (i = 0, len = args.length; i < len; i++) {
          arg = args[i];
          sig.push(this.get_type(arg));
        }
        sig = sig.join(',');
        method = this.constructor.vtable[key][sig] || (function() {
          throw `Can't resolve ${key}(${sig})`;
        })();
        if (!this[method]) {
          throw `Method '${method}' does not exist`;
        }
        return method;
      }

      get_type(object) {
        var type;
        type = (function() {
          switch (false) {
            case object !== null:
              return 'null';
            case typeof object !== 'string':
              return 'str';
            case typeof object !== 'number':
              return 'num';
            case typeof object !== 'boolean':
              return 'bool';
            case !(object instanceof Array):
              switch (false) {
                case !(object[0] instanceof Array):
                  return 'list';
                case object[0] !== '/':
                  return 'regex';
                default:
                  return null;
              }
              break;
            default:
              return null;
          }
        })();
        if (!type) {
          throw `Can't get type of ${require('util').inspect(object)}`;
        }
        return type;
      }

      get_label(label_expr = '') {
        var block_label, label;
        label = this.exec(label_expr)[0];
        label || (label = this.getv('Label') || '');
        block_label = this.block != null ? this.block.label : '';
        if (label) {
          label = label.replace(/^\+/, block_label);
          label = label.replace(/\+$/, block_label);
          label = label.replace(/\{\+\}/, block_label);
        } else {
          label = block_label;
        }
        return this.interpolate(label, true);
      }

      interpolate(string, short = false) {
        string = string.replace(/\{([\-\w]+)\}/g, (m, name) => {
          if (short) {
            return (String(this.vars[name] || '')).replace(/\n[^]*/, '\\n...');
          } else {
            return String(this.vars[name] || '');
          }
        });
        string = string.replace(/\{\*([\-\w]+)\}/g, (m, name) => {
          if (short) {
            return (String(this.block.point[name] || '')).replace(/\n[^]*/, '\\n...');
          } else {
            return String(this.block.point[name] || '');
          }
        });
        return string;
      }

    };

    Run.vtable = {
      '==': 'assert_eq',
      assert_eq: {
        'str,str': 'assert_str_eq_str',
        'num,num': 'assert_num_eq_num',
        'bool,bool': 'assert_bool_eq_bool'
      },
      '~~': 'assert_has',
      assert_has: {
        'str,str': 'assert_str_has_str'
      },
      '=~': 'assert_like',
      assert_like: {
        'str,regex': 'assert_str_like_regex',
        'str,list': 'assert_str_like_list',
        'list,regex': 'assert_list_like_regex',
        'list,list': 'assert_list_like_list'
      },
      '%()': 'pick_loop',
      '.': 'exec_expr',
      "$''": 'get_str',
      '*': 'get_point',
      '=': 'set_var'
    };

    Run.prototype.block = void 0;

    Run.prototype.file = void 0;

    Run.prototype.version = void 0;

    Run.prototype.code = void 0;

    Run.prototype.data = void 0;

    Run.prototype.bridge = void 0;

    Run.prototype.stdlib = void 0;

    Run.prototype.vars = {};

    return Run;

  }).call(this);

  //------------------------------------------------------------------------------
  TestML.Block = class {
    constructor({
        label: label1,
        point: point1
      }) {
      this.label = label1;
      this.point = point1;
    }

  };

  // vim: set ft=coffee sw=2:

}).call(this);
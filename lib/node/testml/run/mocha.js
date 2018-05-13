// Generated by CoffeeScript 2.2.4
(function() {
  var Run;

  require('../../testml/run');

  module.exports = Run = class extends TestML.Run {
    static run(file) {
      return (new Run(file)).test();
    }

    constructor() {
      super(...arguments);
      this.mocha = new require('mocha');
    }

    // @mocha.ui('bdd').ignoreLeaks()
    // @mocha.reporter('list').ui('bdd').ignoreLeaks()
    test_begin() {}

    test_end() {}

    test_eq(got, want, label) {
      say(label);
      return process.exit(1);
    }

  };

}).call(this);
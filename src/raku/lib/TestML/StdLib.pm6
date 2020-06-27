class TestMLError {
  has Str $.msg;
}

class TestML::StdLib {

has $.run;

method argv {
  [@*ARGS,];
}

method block($selector=Nil) {
  return $.run.block
    if not defined $selector;
  for $.run.data -> $block {
    if $block<label> eq $selector {
      return $block;
    }
  }
  return;
}

method blocks {
  $.run.data;
}

multi method bool (Bool:D $value) {
  $value;
}
multi method bool (Any:U --> False){}
multi method bool (Any:D --> True){}

multi method cat(Array $strings) {
  $strings.join('');
}
multi method cat(+@strings) {
  @strings.join('');
}

method count($list) {
  $list.elems;
}

method error($msg='') {
  TestMLError.new(msg => $msg);
}

method env {
  %*ENV;
}

method false {
  False;
}

method join($list, $separator) {
  $list.join($separator);
}

method lines($text) {
  return [$text.chomp.split("\n")];
}

method msg($error) {
  $error.msg;
}

method none {
  return Empty;
}

method null {
  Nil;
}

method split($string, $delim) {
  $string.split($delim).Array;
}

method sum(+list){
  list.sum;
}

method text($list) {
  [|$list, ''].join("\n")
}

method throw($msg) {
  self.run.thrown = TestMLError.new(msg => $msg);
  return 0;
}

method true {
  True;
}

method type ($value=Empty) {
  $!run.type($!run.cook($value));
}

}

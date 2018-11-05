use strict; use warnings;
package TestMLBridge;
use TestML::Bridge;
use base 'TestML::Bridge';

use Capture::Tiny 'capture_merged';

sub _clean {
  my ($output) = @_;

  $output =~ s/\ +$//mg;
  $output =~ s/^Files=.*\n//m;
  $output =~ s/Ran (\d+) tests in .+s/Ran $1 tests in ...s/;

  return $output;
}

sub prove {
  my ($self, $testml_file) = @_;

  $ENV{TESTML_LIB} = 'src/perl5/test';
  _clean capture_merged {
    system "prove -v $testml_file";
  };
}

sub run_command {
  my ($self, $command) = @_;

  $ENV{LANG} = 'C';
  for (keys %ENV) { delete $ENV{$_} if /TESTML_/ }
  $ENV{TESTML_LIB} = 'src/perl5/test';

  _clean capture_merged {
    system "$command";
  };
}

1;

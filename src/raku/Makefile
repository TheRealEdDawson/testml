RUNTIME_LANG := raku
ROOT := ../..

#------------------------------------------------------------------------------
default:

test: test-tap

clean::
	find . | grep '\.precomp' | xargs rm -fr

#------------------------------------------------------------------------------
include $(ROOT)/.makefile/runtime.mk

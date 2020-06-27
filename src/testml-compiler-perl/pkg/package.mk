export PATH := $(PWD)/bin:$(PATH)

B := build
P := pkg
R := ../perl

NAME := $(shell grep '^name ' $P/dist.ini | awk '{print $$3}')
VERSION := $(shell grep '^version ' $P/dist.ini | awk '{print $$3}')
DISTDIR := $(NAME)-$(VERSION)
DIST := $(NAME)-$(VERSION).tar.gz
TAG_PREFIX := compiler-perl

DOCS := $(shell cd $P && find doc -type f)
LIBS := $(shell find lib -type f)
TESTS := $(shell cd test; echo *.tml)
TESTS := $(TESTS:%.tml=%)
ALL_DOCS := $(DOCS:doc/%=$B/lib/%)
ALL_LIBS := $(LIBS:%=$B/%)
ALL_TESTS := $(TESTS:%=$B/t/%.t) $B/t/TestMLBridge.pm
INC_BIN := $B/inc/bin/testml-cpan
INC_LIBS := $(LIBS:%=$B/inc/%)
INC_TESTS := $(TESTS:%=$B/inc/t/%.tml.json)

BUILD_FILES := \
    $B/Changes \
    $B/dist.ini \

BUILD_DIRS := \
    $B/lib/TestML/Compiler \
    $B/t \
    $B/inc/lib/TestML/Run \
    $B/inc/bin \
    $B/inc/t \

#------------------------------------------------------------------------------
.PHONY: build
build:: \
    $(EXT) \
    $(BUILD_DIRS) \
    $(BUILD_FILES) \
    $(ALL_DOCS) \
    $(ALL_LIBS) \
    $(ALL_TESTS) \
    $(INC_BIN) \
    $(INC_TESTS)

#     $(INC_LIBS) \

publish:: check dist
	cpan-upload $(DIST)
	git push
	git tag $(TAG_PREFIX)-$(VERSION)
	git push --tag

dist:: $(DIST)

distdir:: $(DISTDIR)

clean::
	rm -fr $B $(DIST) $(DISTDIR)

realclean:: clean

#------------------------------------------------------------------------------
$(BUILD_DIRS):
	mkdir -p $@

$B/%: $P/%
	cp $< $@

$B/lib/TestML.pm: $P/src/TestML.pm
	cp $< $@

$B/lib/%: lib/%
	cp $< $@

$B/lib/%.pod: $P/doc/%.pod
	cp $< $@

$B/t/%.t: test/%.tml
	cp $< $@
	perl -pi -e 's{#!/usr/bin/env testml}{#!inc/bin/testml-cpan}' $@

$B/t/TestMLBridge.pm: test/TestMLBridge.pm
	cp $< $@

$B/inc/bin/testml-cpan: $R/pkg/bin/testml-cpan
	cp $< $@

$B/inc/lib/TestML.pm: $P/src/TestML.pm
	cp $< $@

$B/inc/lib/%: lib/%
	cp $< $@

$B/inc/t/%.tml.json: $B/t/%.t
	testml-compiler $< > $@

$(DIST): $B/$(DIST)
	mv $< $@
	rm -fr $B/$(DISTDIR)

$(DISTDIR): $B/$(DISTDIR)
	mv $< $@
	rm -f $B/$(DIST)

$B/$(DIST) $B/$(DISTDIR): build
	cd $B && dzil build

#------------------------------------------------------------------------------
include $(ROOT)/.makefile/package.mk

SHELL = bash

export ROOT := ../..

export PATH := $(PWD)/node_modules/.bin:$(PATH)

WORK := \
    gh-pages \
    playground \

STATUS := $(WORK)

OPEN := $(shell command -v xdg-open)
OPEN ?= open

#------------------------------------------------------------------------------
default: status

publish: site
	make -C gh-pages publish
	make -C playground publish

site: gh-pages playground build
	(cd docs/ && find . | cpio -Ldump ../$<)
	rm -f $</v2/*.html
	make -C playground site

build: coffeescript node_modules
	PATH=$$PATH cake doc:site

.PHONY: test
test: site
	(sleep 0.5; $(OPEN) http://localhost:1234/ &>/dev/null) &
	(cd gh-pages && static -p 1234)

work: $(WORK)

clean::
	rm -f package-lock.json
	rm -f docs/v2/index.html

realclean:: clean
	rm -fr $(WORK) coffeescript node_modules

#------------------------------------------------------------------------------
coffeescript:
	git clone --depth=1 http://github.com/jashkenas/$@

$(WORK) node_modules:
	git branch --track $@ origin/$@ 2>/dev/null || true
	git worktree add -f $@ $@

#------------------------------------------------------------------------------
include ../.makefile/status.mk

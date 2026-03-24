NPM := mise exec -- npm

SCRIPTS := dev build preview lighthouse

.PHONY: install $(SCRIPTS)

install:
	$(NPM) install

$(SCRIPTS):
	$(NPM) run $@

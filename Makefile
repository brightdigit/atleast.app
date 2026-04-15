NPM := mise exec -- npm

SCRIPTS := dev build preview lighthouse generate-webp generate-presskit

.PHONY: install $(SCRIPTS)

install:
	$(NPM) install

$(SCRIPTS):
	$(NPM) run $@

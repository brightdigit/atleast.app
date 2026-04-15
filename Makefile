NPM := mise exec -- npm

SCRIPTS := dev build preview lighthouse generate\:webp generate\:presskit

.PHONY: install $(SCRIPTS)

install:
	SHARP_IGNORE_GLOBAL_LIBVIPS=1 $(NPM) install

$(SCRIPTS):
	$(NPM) run $@

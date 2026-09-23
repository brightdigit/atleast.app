NPM := mise exec -- npm

SCRIPTS := dev build preview lighthouse check\:links generate\:webp generate\:presskit

.PHONY: install $(SCRIPTS) product-hunt product-hunt-gif product-hunt-storyboard

install:
	SHARP_IGNORE_GLOBAL_LIBVIPS=1 $(NPM) install

$(SCRIPTS):
	$(NPM) run $@

# Product Hunt gallery assets → public/press/product-hunt/
product-hunt: product-hunt-gif product-hunt-storyboard

product-hunt-gif:
	./scripts/product-hunt/make-demo-gif.sh

product-hunt-storyboard:
	python3 scripts/product-hunt/make-storyboard.py

NPM := mise exec -- npm

SCRIPTS := dev build preview lighthouse generate\:webp generate\:presskit

.PHONY: install leads leads-known $(SCRIPTS)

install:
	SHARP_IGNORE_GLOBAL_LIBVIPS=1 $(NPM) install

$(SCRIPTS):
	$(NPM) run $@

# Outreach lead search. Pass flags through ARGS, e.g.
#   make leads ARGS="--only=press --num=25"
#   make leads ARGS="--help"
leads:
	$(NPM) run leads -- $(ARGS)

# Print outreach targets referenced by open GitHub issues, to keep
# KNOWN_TARGETS in scripts/find-leads.config.js current.
leads-known:
	$(NPM) run leads:known

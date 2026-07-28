NPM := mise exec -- npm

SCRIPTS := dev build preview lighthouse generate\:webp generate\:presskit

.PHONY: install leads leads-known studios podcasts $(SCRIPTS)

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

# Studio/spa leads from the Overture Maps Places open dataset. Needs the
# DuckDB CLI (brew install duckdb); no API key. Examples:
#   make studios ARGS="--metro=austin,denver --limit=50"
#   make studios ARGS="--list-metros"
studios:
	$(NPM) run leads:studios -- $(ARGS)

# Podcast leads from the Podcast Index API. Needs PODCAST_INDEX_KEY and
# PODCAST_INDEX_SECRET. Example:
#   make podcasts ARGS="--only=breathwork,cold"
podcasts:
	$(NPM) run leads:podcasts -- $(ARGS)

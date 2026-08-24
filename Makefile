NPM := mise exec -- npm

# Lead reports are gitignored here (they contain contact details) and live in
# their own private repo instead.
LEADS_REPO := git@github.com:brightdigit/atleast-leads.git

SCRIPTS := dev build preview lighthouse generate\:webp generate\:presskit

.PHONY: install leads leads-known leads-clone leads-pull leads-backup studios podcasts verify-leads $(SCRIPTS)

install:
	SHARP_IGNORE_GLOBAL_LIBVIPS=1 $(NPM) install

$(SCRIPTS):
	$(NPM) run $@

# Outreach lead search. Runs every category, home region included. Pass flags
# through ARGS, e.g.
#   make leads ARGS="--only=local"        # Michigan & Greater Lansing only
#   make leads ARGS="--only=press --num=25"
#   make leads ARGS="--help"
leads:
	$(NPM) run leads -- $(ARGS)

# Print outreach targets referenced by open GitHub issues, to keep
# KNOWN_TARGETS in scripts/find-leads.config.js current.
leads-known:
	$(NPM) run leads:known

# Studio/spa leads from the Overture Maps Places open dataset. Defaults to
# Greater Lansing, then Michigan statewide, then the national metros. Needs the
# DuckDB CLI (brew install duckdb); no API key. Examples:
#   make studios ARGS="--metro=lansing --limit=60"
#   make studios ARGS="--metro=michigan"
#   make studios ARGS="--metro=austin,denver --limit=50"
#   make studios ARGS="--list-metros"
studios:
	$(NPM) run leads:studios -- $(ARGS)

# Podcast leads from the Podcast Index API. Needs PODCAST_INDEX_KEY and
# PODCAST_INDEX_SECRET. Example:
#   make podcasts ARGS="--only=breathwork,cold"
podcasts:
	$(NPM) run leads:podcasts -- $(ARGS)

# Live-check every link and email domain in the latest lead reports.
# Example: make verify-leads ARGS="--only=studios --limit=20"
verify-leads:
	$(NPM) run leads:verify -- $(ARGS)

# Fetch the private lead-data repo into leads/ (fresh checkouts only).
leads-clone:
	git clone $(LEADS_REPO) leads

# Sync leads/ with the private repo (e.g. after updating it from another machine).
leads-pull:
	git -C leads pull

# Snapshot current lead reports to the private repo. Commits only when
# something changed; safe to run any time.
leads-backup:
	git -C leads add -A
	git -C leads diff --cached --quiet || git -C leads commit -m "Snapshot $$(date +%Y-%m-%d)"
	git -C leads push

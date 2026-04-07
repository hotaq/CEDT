PREFIX ?= /usr/local
BINDIR ?= $(PREFIX)/bin
CLI := bin/git-account

.PHONY: test install uninstall

test:
	bash tests/test.sh

install:
	install -d "$(DESTDIR)$(BINDIR)"
	install -m 0755 "$(CLI)" "$(DESTDIR)$(BINDIR)/git-account"

uninstall:
	rm -f "$(DESTDIR)$(BINDIR)/git-account"

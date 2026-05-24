# Claude Code Rules — workout-OS

- After every commit, run `git pull --rebase && git push` immediately. Never leave commits unpushed. Confirm push succeeded after every single commit. The browser's pushSilent() creates data.json commits on the remote between local commits — always rebase on top of those before pushing.

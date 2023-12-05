lint:
	npx eslint .

publish:
	npm publish --dry-run

install:
	npm ci

webpack:
	npx webpack serve

build:
	rm -rf dist
	NODE_ENV=production npx webpack
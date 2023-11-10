install:
	npm ci
test:
	npm test
lint:
	npx eslint .
test-coverage:
	npm test -- --coverage --coverageProvider=v8
publish:
	npm publish --dry-run
run:
	node bin/page-loader.js
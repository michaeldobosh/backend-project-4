install:
	npm ci
link:
	npm link
publish: 
	npm publish --dry-run
test:
	npm test
lint:
	npx eslint .
test-coverage:
	npm test -- --coverage --coverageProvider=v8
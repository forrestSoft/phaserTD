module.exports = {
	extends: ['eslint:recommended', 'prettier', 'prettier/react'],
	plugins: ['react', 'prettier'],
	parser: 'babel-eslint',
	parserOptions: {
		ecmaVersion: 2016,
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true
		}
	},
	env: {
		browser: true,
		node: true,
		es6: true
	},
	rules: {
		curly: ['error', 'all'],
		'prettier/prettier': [
			'error',
			{
				printWidth: 120,
				semi: false,
				singleQuote: true,
				trailingComma: 'none', // ideally 'all'...
				tabWidth: 1,
				useTabs: true
			}
		],
		"no-console": "off",
		"no-undef": "off",
		"array-element-newline":"off"
	},
	globals: {
		// phaser: true,
		game: true
	},
	settings: {
		'import/core-modules': ['phaser', 'pixi', 'p2'],
		'import/resolver': {
			webpack: {
				resolve: {
					extensions: ['.js', '.jsx']
				}
			}
		}
	}
}

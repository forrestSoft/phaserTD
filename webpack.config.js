var path = require('path')
var webpack = require('webpack')
var BrowserSyncPlugin = require('browser-sync-webpack-plugin')

// Phaser webpack config
var phaserModule = path.join(__dirname, '/node_modules/phaser-ce/')
var phaser = path.join(phaserModule, 'build/custom/phaser-split.js')
var pixi = path.join(phaserModule, 'build/custom/pixi.js')
var p2 = path.join(phaserModule, 'build/custom/p2.js')

var stampit = path.join(__dirname, '/node_modules/stampit/dist/stampit.full.js')

module.exports = {
	entry: {
		app: [
			'babel-polyfill',
			path.resolve(__dirname, 'src/main.js')
		],
		// vendor: ['pixi', 'p2', 'phaser']
	},
	output: {
		pathinfo: true,
		path: path.resolve(__dirname, 'dist'),
		publicPath: './dist/',
		filename: 'bundle.js'
	},
	watch: true,
	plugins: [
		new BrowserSyncPlugin({
			host: process.env.IP || 'localhost',
			port: process.env.PORT || 3000,
			server: {
				baseDir: ['./', './build']
			}
		})
	],
	module: {
	  rules: [
	    {
	      test: /\.js$/,
	      exclude: /(node_modules|bower_components)/,
	      use: {
	        loader: 'babel-loader',
	        options: {
	          presets: ['react','stage-2'],
	          // plugins: [require('babel-plugin-transform-object-rest-spread')]
	        }
	      }
	    },
	    {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['react', 'stage-2']
        }
      },
      { test: /pixi\.js/, use: ['expose-loader?PIXI']},
      { test: /p2\.js/, use: ['expose-loader?p2']},
      { test: /phaser-split\.js/, use: ['expose-loader?Phaser']},
      // { test: /stampit\.full\.js$/, use: ['expose-loader?Stampit'] }
	  ]
	},
	resolve: {
        alias: {
            pixi: pixi,
            p2: p2,
            phaser: phaser
        }
    }
}
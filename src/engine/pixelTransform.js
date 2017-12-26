import tinycolor from 'tinycolor2'
import nearestColor from 'nearest-color'
import chroma from 'chroma-js'

export const SpriteTinter = function(percent = 0, name, hue=225){
	if(!GLOBALS.rgbToTinycolor){
		GLOBALS.rgbToTinycolor = []
		GLOBALS.rgbToClamped = []
		GLOBALS.rgbToRGB = []
	}

	let cacheSpriteSheet = game.cache.getImage(name, true)
	let c = cacheSpriteSheet
	
	let dupe = game.add.bitmapData()
	game.cache.addBitmapData('sprites_'+name+percent,dupe)
	dupe.load(name)
	dupe.processPixelRGB( function(pixel,x,y){
		if (pixel.a === 0){
			return false
		}

		if(!GLOBALS.rgbToTinycolor[pixel.color]){
			GLOBALS.rgbToTinycolor[pixel.color] = tinycolor(pixel)
		}

		let color = GLOBALS.rgbToTinycolor[pixel.color]
		let hsl = color.toHsl()
		color = tinycolor({h:hue, s:hsl.s + percent/100, l:hsl.l, a:255})
		let rgb =  color.toRgb()
		rgb.a = 255

		return rgb
	})

	game.cache.addSpriteSheet('sprites_'+name+percent, null, dupe.canvas, c.frameWidth, c.frameHeight, -1)

}
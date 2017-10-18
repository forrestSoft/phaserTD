
import tinycolor from 'tinycolor2'
import nearestColor from 'nearest-color'
import chroma from 'chroma-js'

export const SpriteTinter = function(percent = 0, name){
	if(!GLOBALS.rgbToTinycolor){
		GLOBALS.rgbToTinycolor = []
		GLOBALS.rgbToClamped = []
		GLOBALS.rgbToRGB = []
	}

	let clampedColors = nearestColor.from(nearestColor.STANDARD_COLORS)

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

		let clampedColor
		if(!GLOBALS.rgbToClamped[color]){
			clampedColor = clampedColors('#'+color.toHex())
			GLOBALS.rgbToClamped[color] = clampedColor
		}else{
			clampedColor = GLOBALS.rgbToClamped[color]
		}

		if(clampedColor.value !== '#000'){
			if(!GLOBALS.rgbToRGB[color.toHex()]){
				GLOBALS.rgbToRGB[color.toHex()] = chroma.mix(color.toHex(), '#ff0000', .5)
			}

			// let shifted = chroma(color.toHex()).brighten(.4)
			let shifted = GLOBALS.rgbToRGB[color.toHex()]
			let s = shifted.rgba()
			return {r:s[0], g:s[1], b: s[2], a:255}
		}
		return pixel
	})

	game.cache.addSpriteSheet('sprites_'+name+percent, null, dupe.canvas, c.frameWidth, c.frameHeight, -1)

}
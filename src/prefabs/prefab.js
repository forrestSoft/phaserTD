import Phaser from 'phaser'

export default class extends Phaser.Sprite {
	constructor(game_state, name, position, properties) {
		super(game_state.game, position.x, position.y, properties.texture)
		console.log(properties.texture)
		this.game_state = game_state

		this.name = name
		this.game_state.groups[properties.group].add(this)
		this.frame = +properties.frame

		if (properties.scale) {
			this.scale.setTo(properties.scale.x, properties.scale.y)
		}

		this.game_state.prefabs[name] = this
		// debugger
		// this.createBitMap('female02_rouge_spritesheet', 'new')
		// debugger
		// this.x = position.x
		// this.y = position.y
			// .loadBitmapAsTextureAtlas()
			// .loadTexture('heroes-sprites')
	}
	createBitMap(name, prefix) {
		let game = this.game
		let cache = game.cache
		// debugger
		let cacheSpriteSheet = cache.getImage(name, true)
		let dupe = game.add.bitmapData(16,16)
		dupe.load('female02_rouge_spritesheet')
		dupe.shiftHSL(.5)
		this.game.cache.addSpriteSheet('sprite2_'+prefix+name, null, dupe, cacheSpriteSheet.FrameData, cacheSpriteSheet.frameWidth, cacheSpriteSheet.frameheight)
		// debugger
		this.setTexture(this.game.cache.getImage(prefix+name).texture)
		// this.texture.crop.width = 24
		// this.texture.crop.height = 32
		this.texture.frame.width = 24
		this.texture.frame.height = 32
		this.y -= 8
		// this.texture.width = 24
		// this.texture.height = 32
		// debugger
		// this.updateBounds()
		// debugger
		return this
	}
	loadBitmapAsTextureAtlas(prefix?) {
		this.game.cache.addTextureAtlas('heroes-sprites' + prefix, '', this.bitmapBrother.canvas, this.frameData, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH)
		return this
	}

	modifiyBitmap() {
		this.bitmapBrother.shiftHSL(0.1)
		return this
	}

	changeColor() {
		this.modifiyBitmap()
			.loadBitmapAsTextureAtlas('changed')
			.loadTexture('heroes-sprites' + 'changed')
	}
}

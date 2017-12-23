import Phaser from 'phaser'
import stampit from 'stampit'

import { buildBoundInputMask, highLightableGroup } from '../utils'
import { FancyBrush } from './fancyBrush'
import GLOBALS from '../config/globals'

import Packer from '../ext/packer'

export const Palette = stampit()
	.methods({
		build() {
			let group = game.add.group(undefined, 'palette')
			let brushes = this.brushes
			// let brushes = [28,32,33,34, 46,24]
			let tw, th, pW, l
			l = brushes.length
			tw = GLOBALS.tx
			th = GLOBALS.ty
			pW = 10

			const res = [...Array(l)].map((_, i) => {
				let y = Math.floor(i / pW) * tw
				let x = (i % pW) * th
				let s = game.make.sprite(x, y, 'ms', brushes[i])
				s.inputEnabled = true
				s.events.onInputDown.add(this.changeTile, this)
				group.addChild(s)
				return s
			})

			group.x = tw * 11 + this.xOffset
			group.y = th + this.yOffset

			let rect = {
				x: group.x,
				y: group.y,
				height: tw * pW,
				width: th * (l + 1 / 2),
				objectToMask: group,
				name: 'palette'
			}
		},

		buildFancyBrushes() {
			let p = new Packer(8, 20)
			p.fit(GLOBALS.fancySortedSizes)

			game.fancyBrushSprites = []
			let brushGroup = game.add.group(undefined, 'palette')
			brushGroup.scale.setTo(0.5, 0.5)
			const th = GLOBALS.tH
			const tw = GLOBALS.tW

			brushGroup.x = tw * (GLOBALS.width + 1)
			brushGroup.y = th

			let w = { x: 0, y: 0 }
			this.brushes.forEach((data, i) => {
				let fit = GLOBALS.fancySortedSizes[i].fit
				let group = new highLightableGroup({
					game: game,
					parent: brushGroup,
					name: `${i}`,
					size: data.size,
					isDownCallback: this.isDownCallBack,
					context: this
				})

				let pW = data.size[0]
				let pH = data.size[1]

				FancyBrush.brushSpriteLoop({
					vars: { pW, pH },
					sprite: data.sprite,
					command: ({ i, x, y }, sprite) => {
						if (sprite == 'none') {
							return
						}
						group.addChild(game.make.sprite(x, y, 'ms', GLOBALS.brushMap[sprite]))
					}
				})
				group.updateHitArea()

				let tx = fit.x,
					ty = fit.y
				group.x = tx * tw
				group.y = ty * th

				game.fancyBrushSprites.push(group)
				group.gSprite = group.generateTexture()
				group.gSprite.x = 0
				group.gSprite.y = 0

				brushGroup.addChild(group)
			})
		},
		isDownCallBack(brush) {
			this.changeBrushFancy(brush)
		},
		changeBrushFancy(brush) {
			GLOBALS.signals.updateBrush.dispatch('fancy', brush)
		},
		changeTile(sprite, pointer) {
			let index = sprite._frame.index
			//something about tilemap and sprite indexes being off by 1?
			let brush = index + 1

			// blank tile is a noop
			if (brush == 47) {
				return
			}

			GLOBALS.signals.updateBrush.dispatch(brush, 'wall')
		}
	})
	.init(function({ p, brushes, fancyBrush, xOffset, yOffset, gridWiggle }, { args, instance, stamp }) {
		Object.assign(instance, {
			brushes,
			fancyBrush,
			xOffset,
			yOffset,
			gridWiggle: gridWiggle || 5
		})
		game.currentBrush = 26

		if (instance.fancyBrush) {
			this.buildFancyBrushes()
		} else {
			this.build()
		}
	})

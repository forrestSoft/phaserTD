import stampit from 'stampit'
import Phaser from 'phaser'
import GLOBALS from '../config/globals'

export const Display = stampit()
	.methods({
		buildRenderer(){
			this.group = game.add.group(undefined,'display')
			let {x,y} = this.offset

			Object.assign(this.group, {x,y})
			this.render()
		},
		render(){
			this.clear()
			Object.keys(this.lines).forEach((key,i)=>{
				let text = this.addTextObject(this.lines[key])
				this.group.addChild(text)
			})
		},
		addTextObject(str){
			let text = this.makeTextObject(str)
			return text
		},
		makeTextObject(str){
			let text = game.make.text(	0, 
										0+(this.offsetIndex*20), 
										str,
										this.style)

			this.offsetIndex++
			return text
		},
		clear(){
			this.group.removeChildren()
			this.offsetIndex = 0
		}
	})
	.init(function ({parent, group, offset}, {args, instance, stamp}) {
		Object.assign(instance, {
			parent, group, offset,
			offsetIndex: 0,
			style: { 
				font: "12px Arial",
				fontWeight: 'bold',
				align: "center",
				fill:  `#330033`,
			},
			lines: {}
		})
		GLOBALS.signals.display.add((lines)=>{
			console.log(0,lines.brush)
			if(lines.brush == 'null'){
				this.clear()
				this.lines = {}
				
			}else{

				let towerData = GLOBALS.towers.data(lines.brush)
				let level = lines.tower.level
				console.log(GLOBALS.towers.data(lines.brush),lines.tower)
				
				// debugger
				this.lines = {
					damage: `damage: ${towerData.damage[level-1]}`,
					level: `level: ${level}`,
					next: `level up cost: ${towerData.cost[level] || 'max'}`
				}
			}
			GLOBALS.reactUI.setState({tower: this.lines})
			// this.render()
		})
	})
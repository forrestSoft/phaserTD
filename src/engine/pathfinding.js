import {Points} from '../utils'
import stampit from 'stampit'

import Phaser from 'phaser'
import Easystar from '../ext/easystar/easystar'

import {FancyBrush} from '../ui/fancyBrush'

import GLOBALS from '../config/globals'

export const Pathfinders = stampit()
	.methods({
		add (stars) {
			if(!this.stars){
				this.stars = {}
			}
			for (let [key, value] of Object.entries(stars)) {
				this.stars[key] = Pathfinder()
				this.stars[key].name = key
				this.stars[key].build(value)
			}
		},
		get(star){
			return this.stars[star]
		},
		get_path(star){
			return this.stars[star].path
		}
	})

export const Pathfinder = stampit()
	.methods({
		build({grid, acceptableTiles, tileDimenstions}){
			// this.easy_star.enableDiagonals()
			this.gridDimenstions = {row: grid.length, column: grid[0].length};
			this.tileDimenstions = tileDimenstions;

			this.setGrid(grid);
			this.setAcceptableTiles(acceptableTiles);    
		},

		getGrid (grid) {
			let row, grid_column, tilesIndexes;
			tilesIndexes = [];
			for (row = 0; row < grid.length; row += 1) {
				tilesIndexes[row] = [];
				for (grid_column = 0; grid_column < grid[row].length; grid_column += 1) {
					tilesIndexes[row][grid_column] = grid[row][grid_column].index;
				}
			}
			return tilesIndexes
		},

		setGrid(worldGrid){
			this.star.setGrid(this.getGrid(worldGrid))
		},

		setAcceptableTiles(tiles){
			this.star.setAcceptableTiles(tiles)
		},

		find_path (origin, target, callback, context) {
			let origin_coord, target_coord;

			origin_coord = Points.get_coord_from_point(origin);
			// origin_coord = {row: 0, column: 0}

			// target_coord = {row: 3, column: GLOBALS.width - 1}
			target_coord = GLOBALS.exit
			// console.log('find path',origin_coord, target_coord)
			// target_coord = this.get_coord_from_point(target);
			
			if (!Points.outside_grid(origin_coord) && !Points.outside_grid(target_coord)) {
				console.time('astar time')
				this.star.findPath(origin_coord.column, origin_coord.row, target_coord.column, target_coord.row, this.call_callback_function.bind(this, callback, context));
				this.star.calculate();
				console.timeEnd('astar time')
				return true;
			} else {
				return false;
			}
		},
		find_path_goal_spawn(origin, target, callback, context){
			let origin_coord = {x: GLOBALS.entrance.columnPX, y: GLOBALS.entrance.rowPX}
			let target_coord = {x:GLOBALS.exit.columnPX, y:GLOBALS.exit.rowPX}
			this.find_path(origin_coord, target_coord, callback, context)
		},
		find_path_from_brush (origin, target, callback, context,x,y, rotation) {
			let grid = GLOBALS.currentCollisionLayer()
			let c = {x: x - GLOBALS.globalOffset.x, y: y - GLOBALS.globalOffset.y}
			
			if(game.currentFancyBrush != undefined){
				let brush = GLOBALS.fancyBrushes[game.currentFancyBrush]
				let rotatedBrush = GLOBALS.rotateFancyBrush(game.currentFancyBrush, rotation)
				let earlyAbort = false
				const th = 16
				const tw = 16
				let pW = brush.size[0]
				let pH = brush.size[1]
				
				FancyBrush.brushLoopFromSprite({
					vars: {pH,pW},
					sprite: rotatedBrush,
					command: ({x,y,tX, tY}, sprite) => {
						let t =  Points.get_coord_from_point(c)	
						let mappedX = t.column+tX
						let mappedY = t.row+tY

						// tile is outside of grid, invalid position
						let outsideOfGrid = (!grid[mappedY] || !grid[mappedY][mappedX])

						//overlapping existing piece, invalid position
						// let overlapping = (!outsideOfGrid &&  ![-1, -999].includes(grid[mappedY][mappedX].index))
						if(outsideOfGrid){
							console.log('early abort')
							earlyAbort = true
							return false
						}
						grid[mappedY][mappedX].index = GLOBALS.brushMap[sprite]
						return true
					}
				})

				if(earlyAbort){
					this.call_callback_function(callback, context, null)
					return
				}

			}else{
				let t =  Points.get_coord_from_point(c)
				if(Points.outside_grid(t)){
					return
				}

				grid[t.row][t.column].index = game.currentBrush
			}

			this.setGrid(grid)
			this.find_path_goal_spawn({x: 0, y: 0}, null, callback, context)
		},
		
		avoidAdditionalPoint (x ,y){
			this.star.avoidAdditionalPoint(x,y)
		},

		call_callback_function (callback, context, path) {
			// console.timeEnd('astar time')
			let path_positions, pt, p,x,y;
			path_positions = [];
			if (path !== null) {
				this.hasPath = true
				path.forEach(function (path_coord, i) {
					path_positions.push(Points.get_point_from_coord({row: path_coord.y, column: path_coord.x}));
				}, this);

				//account for the very small drift that has happened while this was calculating
				// p = ({x, y} =  context.position)
				// pt = new Phaser.Point(p.x,p.y)
				// path_positions[0] = (pt);
			}else{
				this.hasPath = false
				path_positions = null
			}
			this.path = path_positions
			
			if(!callback){
				return
			}
			callback.call(context, path_positions);
			if(this.name === 'creep'){
				GLOBALS.signals.creepPathReset.dispatch()
			}
		}
	})
	.init(function ({p}, {args, instance, stamp}) {
		this.star = new Easystar.js()
	})
import {Points} from '../utils'
import stampit from 'stampit'

import Phaser from 'phaser'
import Easystar from '../ext/easystar/easystar'

import GLOBALS from '../config/globals'

export const Pathfinders = stampit().
	methods({
		add (stars) {
			if(!this.stars){
				this.stars = {}
			}
			for (let [key, value] of Object.entries(stars)) {
				console.log(arguments, key, value)
				this.stars[key] = Pathfinder()
			// debugger
				this.stars[key].build(value)
			}

			console.log(this.stars)
		},
		get(star){
			return this.stars[star]
		}
	})
export const Pathfinder =  stampit()
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
	                // if(grid[row][grid_column].index != -1){
	                //     console.log(grid[row][grid_column].index)
	                // }
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
	        // console.log('find path',origin_coord,this.outside_grid(origin_coord) ,this.outside_grid(target_coord))
	        // target_coord = this.get_coord_from_point(target);
	        
	        if (!Points.outside_grid(origin_coord) && !Points.outside_grid(target_coord)) {
	            console.time('astar time')
	            this.star.findPath(origin_coord.column, origin_coord.row, target_coord.column, target_coord.row, this.call_callback_function.bind(this, callback, context));
	            this.star.calculate();
	            return true;
	        } else {
	            return false;
	        }
	    },

	    find_path_from_brush (origin, target, callback, context) {
	        let grid = GLOBALS.currentCollisionLayer()
	        let c = Object.assign({}, game.input.activePointer)
	        c.x-= GLOBALS.globalOffset.x
	        c.y-= GLOBALS.globalOffset.y

	        let t =  Points.get_coord_from_point(c)
	        if(Points.outside_grid(t)){
	            return
	        }

	        // temp collisision grid index set from current pointer
	        grid[t.row][t.column].index = game.currentBrush

	        this.setGrid(grid)

	        // pathing for the cursor always starts at the goal
	        this.find_path({x: 0, y: 0}, null, callback, context)
	    },
	    avoidAdditionalPoint (x ,y){
	        this.star.avoidAdditionalPoint(x,y)
	    },

	    call_callback_function (callback, context, path) {
	        let path_positions, pt, p,x,y;
	        path_positions = [];
	        if (path !== null) {
	            path.forEach(function (path_coord, i) {
	                path_positions.push(Points.get_point_from_coord({row: path_coord.y, column: path_coord.x}));
	            }, this);

	            //account for the very small drift that has happened while this was calculating
	            p = ({x, y} =  context.position)
	            pt = new Phaser.Point(p.x,p.y)
	            path_positions[0] = (pt);
	        }else{
	            path_positions = null
	        }
	        console.timeEnd('astar time')

	        callback.call(context, path_positions);
	    }
	})
	.init(function ({p}, {args, instance, stamp}) {
		this.star = new Easystar.js()
	})
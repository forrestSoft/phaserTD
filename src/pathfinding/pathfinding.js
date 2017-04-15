import Phaser from 'phaser'
import Easystar from '../ext/easystar/easystar'

export default class extends Phaser.Plugin {
    constructor (game, parent){
        super(game, parent);
        this.easy_star = new Easystar.js()
        this.easy_star2 = new Easystar.js()
        // this.easy_star.enableDiagonals()
    }

    init (world_grid, acceptable_tiles, tile_dimensions, data){
        //this.world_grid = world_grid
        var data = data || {}
        this.data = {}
        
        this.data.width = data.width || 10
        this.grid_dimensions = {row: world_grid.length, column: world_grid[0].length};

        this.setGrid(world_grid);
        this.easy_star.setAcceptableTiles(acceptable_tiles);    

        this.setGrid2(GLOBALS.currentCollisionLayer())
        this.easy_star2.setAcceptableTiles(acceptable_tiles)

        this.tile_dimensions = tile_dimensions;
    }

    getGrid (world_grid) {
        let grid_row, grid_column, grid_indices;
        grid_indices = [];
        for (grid_row = 0; grid_row < world_grid.length; grid_row += 1) {
            grid_indices[grid_row] = [];
            for (grid_column = 0; grid_column < world_grid[grid_row].length; grid_column += 1) {
                // if(world_grid[grid_row][grid_column].index != -1){
                //     console.log(world_grid[grid_row][grid_column].index)
                // }
                grid_indices[grid_row][grid_column] = world_grid[grid_row][grid_column].index;
            }
        }
        console.log(grid_indices)
        return grid_indices
    }

    setGrid(world_grid){
        this.easy_star.setGrid(this.getGrid(world_grid));
    }

    setGrid2(world_grid){
        console.log('set grid 22',this.getGrid(world_grid))
        this.easy_star2.setGrid(this.getGrid(world_grid));   
    }

    find_path (origin, target, callback, context) {
        let origin_coord, target_coord;

        origin_coord = this.get_coord_from_point(origin);
        // origin_coord = {row: 0, column: 0}

        target_coord = {row: 3, column: this.data.width - 1}
        console.log('find path',origin_coord,this.outside_grid(origin_coord) ,this.outside_grid(target_coord))
        // target_coord = this.get_coord_from_point(target);
        
        if (!this.outside_grid(origin_coord) && !this.outside_grid(target_coord)) {
            console.time()
            this.easy_star.findPath(origin_coord.column, origin_coord.row, target_coord.column, target_coord.row, this.call_callback_function.bind(this, callback, context));
            this.easy_star.calculate();
            return true;
        } else {
            return false;
        }
    }

    find_path2 (origin, target, callback, context) {
        let origin_coord, target_coord;

        // origin_coord = this.get_coord_from_point(origin);
        origin_coord = {row: 0, column: 0}

        target_coord = {row: 3, column: this.data.width - 1}
        console.log('find path2',origin_coord,this.outside_grid(origin_coord) ,this.outside_grid(target_coord))
        // target_coord = this.get_coord_from_point(target);
        
        if (!this.outside_grid(origin_coord) && !this.outside_grid(target_coord)) {
            console.time()
            this.easy_star2.findPath(origin_coord.column, origin_coord.row, target_coord.column, target_coord.row, this.call_callback_function.bind(this, callback, context));
            this.easy_star2.calculate();
            return true;
        } else {
            return false;
        }
    }

    find_path_from_brush (origin, target, callback, context) {
        let grid = GLOBALS.currentCollisionLayer()
        let c = Object.assign({}, game.input.activePointer)
        c.x-= GLOBALS.globalOffset.x
        c.y-= GLOBALS.globalOffset.y

        let t =  this.get_coord_from_point(c)
        if(this.outside_grid(t)){
            return
        }

        grid[t.row][t.column].index = game.currentBrush

        this.setGrid2(grid)
        this.find_path2(c, null, callback, context)
    }
    avoidAdditionalPoint (x ,y){
        this.easy_star.avoidAdditionalPoint(x,y)
    }

    call_callback_function (callback, context, path) {
        let path_positions, pt, p,x,y;
        path_positions = [];
        if (path !== null) {
            path.forEach(function (path_coord, i) {
                path_positions.push(this.get_point_from_coord({row: path_coord.y, column: path_coord.x}));
            }, this);

            //account for the very small drift that has happened while this was calculating
            p = ({x, y} =  context.position)
            pt = new Phaser.Point(p.x,p.y)
            path_positions[0] = (pt);
        }else{
            path_positions = null
        }
        console.timeEnd()

        callback.call(context, path_positions);
    }

    outside_grid (coord) {
        return coord.row < 0 || coord.row > this.grid_dimensions.row - 1 || coord.column < 0 || coord.column > this.grid_dimensions.column - 1;
    }

    get_coord_from_point (point) {
        let row, column;
        row = Math.floor(point.y / this.tile_dimensions.y);
        column = Math.floor(point.x / this.tile_dimensions.x);
        return {row: row, column: column};
    }

    get_point_from_coord (coord) {
        let x, y;
        x = (coord.column * this.tile_dimensions.x) + (this.tile_dimensions.x / 2);
        y = (coord.row * this.tile_dimensions.y) + (this.tile_dimensions.y / 2);
        return new Phaser.Point(x, y);
    }
}
import Phaser from 'phaser'
import Easystar from '../ext/easystar/easystar'

export default class extends Phaser.Plugin {
    constructor (game, parent){
        super(game, parent);
        this.easy_star = new Easystar.js();
        
        // this.easy_star.enableDiagonals()
    }

    init (world_grid, acceptable_tiles, tile_dimensions, data){
        var data = data || {}
        this.data = {}
        // console.log(this.data)
        this.data.width = data.width || 10
        this.grid_dimensions = {row: world_grid.length, column: world_grid[0].length};
        // debugger    
        this.easy_star.setGrid(this.getGrid(world_grid));
        this.easy_star.setAcceptableTiles(acceptable_tiles);    

        this.tile_dimensions = tile_dimensions;
    }

    getGrid (world_grid) {
        let grid_row, grid_column, grid_indices;
        grid_indices = [];
        for (grid_row = 0; grid_row < world_grid.length; grid_row += 1) {
            grid_indices[grid_row] = [];
            for (grid_column = 0; grid_column < world_grid[grid_row].length; grid_column += 1) {
                if(world_grid[grid_row][grid_column].index != -1){
                    // console.log(world_grid[grid_row][grid_column].index)
                }
                grid_indices[grid_row][grid_column] = world_grid[grid_row][grid_column].index;
            }
        }
        return grid_indices
    }

    setGrid(world_grid){
        this.easy_star.setGrid(this.getGrid(world_grid));
    }

    find_path (origin, target, callback, context) {
        let origin_coord, target_coord;
        origin_coord = this.get_coord_from_point(origin);
        target_coord = {row: 3, column: this.data.width - 1}
        // console.log('fp', origin_coord, this.outside_grid(origin_coord)  ,this.outside_grid(target_coord))
        // target_coord = this.get_coord_from_point(target);
        // origin_coord = {row: 0, column: 0}
        if (!this.outside_grid(origin_coord) && !this.outside_grid(target_coord)) {
            this.easy_star.findPath(origin_coord.column, origin_coord.row, target_coord.column, target_coord.row, this.call_callback_function.bind(this, callback, context));
            this.easy_star.calculate();
            return true;
        } else {
            return false;
        }
    }

    avoidAdditionalPoint (x ,y){
        this.easy_star.avoidAdditionalPoint(x,y)
    }

    call_callback_function (callback, context, path) {
        console.log(1)
        let path_positions;
        path_positions = [];
        if (path !== null) {
            path.forEach(function (path_coord) {
                // console.log(this.get_point_from_coord({row: path_coord.y, column: path_coord.x}))
                path_positions.push(this.get_point_from_coord({row: path_coord.y, column: path_coord.x}));
            }, this);
        }
        callback.call(context, path_positions);
    }

    outside_grid (coord) {
        // debugger
        // console.log(coord, this.grid_dimensions, coord.column > this.grid_dimensions.column - 1)
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
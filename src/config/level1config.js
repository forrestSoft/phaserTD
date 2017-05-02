import {Counting} from '../utils'
import GLOBALS from '../config/globals'

var backgroundArray, boardWidth, boardHeight, boardSize

boardWidth = GLOBALS.width
boardHeight = GLOBALS.height
boardSize = boardWidth * boardHeight
backgroundArray = Array.from(new Array(boardSize), (x,i) => 25)

let collisionArray
let arrays = [...Array(boardHeight)].map((a,i)=>{
	return Array(boardWidth).fill(0)
})

let a = [...Array(boardHeight)].forEach((_,i)=>{
	if(i == GLOBALS.exit.row){
		arrays[i][boardWidth-1] = 0
	}else{
		arrays[i][boardWidth-1] = 33
	}

	// arrays[boardHeight-1][i] = 33
	arrays[i][0] = 33

	
})

let b = [0, boardHeight-1].map((y,i)=>{
	console.log(22,y,i)
	// debugger
	arrays[y].forEach((frame,x)=>{
		// arrays[a][b]
		// console.log(33, frame,x)
		if(x == GLOBALS.entrance.column && y == 0){
			arrays[y][x] = 0
		}else{
			arrays[y][x] = 33
		}
	})
})

collisionArray = [].concat.apply([], arrays)
// collisionArray[1] = 33

let goalsArray = Array.from(new Array(boardSize), (x,i) => 0)
goalsArray[0] = 44

let towersArray = Array.from(new Array(boardSize), (x,i) => 0)

let creepSpeed = 12
var data
data = { 
	 "height":boardHeight,
	 "layers":[
	        {
	         "data":backgroundArray,
	         "height":boardHeight,
	         "name":"background",
	         "opacity":1,
	         "type":"tilelayer",
	         "visible":true,
	         "width":boardWidth,
	         "x":0,
	         "y":0
	        }, 
	        {
	         "data":collisionArray,
	         "height":boardHeight,
	         "name":"collision",
	         "opacity":1,
	         "properties":
	            {
	             "collision":"true"
	            },
	         "type":"tilelayer",
	         "visible":true,
	         "width":boardWidth,
	         "x":0,
	         "y":0
	        },
	        {
	         "data":towersArray,
	         "height":boardHeight,
	         "name":"towers",
	         "opacity":1,
	         "properties":
	            {
	             // "collision":"true"
	            },
	         "type":"tilelayer",
	         "visible":true,
	         "width":boardWidth,
	         "x":0,
	         "y":0
	        }, 
	        {
	         "height":boardHeight,
	         "name":"objects",
	         "objects":[
	                {
	                 "gid":118,
	                 "height":0,
	                 "name":"player",
	                 "properties":
	                    {
	                     "group":"players",
	                     "texture":"male_fighter_spritesheet",
	                     "walking_speed":creepSpeed
	                    },
	                 "type":"player",
	                 "visible":true,
	                 "width":0,
	                 "x":GLOBALS.entrance.columnPX + 8,
	                 "y":GLOBALS.entrance.rowPX
	                }],
	         "opacity":1,
	         "type":"objectgroup",
	         "visible":true,
	         "width":boardWidth,
	         "x":0,
	         "y":0
	        }],
	 "orientation":"orthogonal",
	 "properties":
	    {

	    },
	 "tileheight":16,
	 "tilesets":[
	        {
	         "firstgid":1,
	         "image":"..\/images\/open_tileset.png",
	         "imageheight":180,
	         "imagewidth":160,
	         "margin":0,
	         "name":"map_tileset",
	         "properties":
	            {

	            },
	         "spacing":0,
	         "tileheight":16,
	         "tilewidth":16
	        }, 
	        {
	         "firstgid":111,
	         "image":"..\/images\/fighter_m.png",
	         "imageheight":128,
	         "imagewidth":72,
	         "margin":0,
	         "name":"fighter_m",
	         "properties":
	            {

	            },
	         "spacing":0,
	         "tileheight":32,
	         "tilewidth":24
	        }],
	 "tilewidth":16,
	 "version":1,
	 "width":boardWidth
	}

export default data
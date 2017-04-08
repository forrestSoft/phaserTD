var backgroundArray, boardWidth, boardHeight, boardSize

boardWidth =10
boardHeight = 4
// debugger
boardSize = boardWidth * boardHeight
// backgroundArray = Array.from(new Array(boardSize), (x,i) => -1)
backgroundArray = Array.from(new Array(boardSize), (x,i) => i+1)
console.log(backgroundArray)
// let collisionArray
// collisionArray = Array.from(new Array(boardSize), (x,i) => 0)

var data
data = { 
	 "height":boardHeight,
	 "layers":[
	        {
	         "data":backgroundArray,
	         "height":boardHeight,
	         "name":"palette",
	         "opacity":1,
	         "type":"tilelayer",
	         "visible":true,
	         "width":boardWidth,
	         "x":0,
	         "y":0
	        }, 
	       ],
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
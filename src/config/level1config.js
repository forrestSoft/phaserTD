var backgroundArray, boardWidth, boardHeight, boardSize

boardWidth = 10
boardHeight = 10
// debugger
boardSize = boardWidth * boardHeight
backgroundArray = Array.from(new Array(boardSize), (x,i) => 25)

let collisionArray
collisionArray = Array.from(new Array(boardSize), (x,i) => 0)
collisionArray[1] = 33

let goalsArray = Array.from(new Array(boardSize), (x,i) => 0)
goalsArray[0] = 44

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
	        // {
	        //  "data":goalsArray,
	        //  "height":boardHeight,
	        //  "name":"goals",
	        //  "opacity":1,
	        //  "properties":
	        //     {
	        //      // "collision":"true"
	        //     },
	        //  "type":"tilelayer",
	        //  "visible":true,
	        //  "width":boardWidth,
	        //  "x":0,
	        //  "y":0
	        // }, 
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
	                     "walking_speed":"30"
	                    },
	                 "type":"player",
	                 "visible":true,
	                 "width":0,
	                 "x":0,
	                 "y":0
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
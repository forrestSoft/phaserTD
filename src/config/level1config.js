import { Counting } from '../utils'
import GLOBALS from '../config/globals'

var backgroundArray, boardWidth, boardHeight, boardSize

boardWidth = GLOBALS.width
boardHeight = GLOBALS.height
boardSize = boardWidth * boardHeight
backgroundArray = Array.from(new Array(boardSize), (x, i) => 25)

let collisionArray
let arrays = [...Array(boardHeight)].map((a, i) => {
	return Array(boardWidth).fill(0)
})

let a = [...Array(boardHeight)].forEach((_, i) => {
	if (i == GLOBALS.exit.row) {
		arrays[i][boardWidth - 1] = 0
	} else {
		arrays[i][boardWidth - 1] = 33
	}

	// arrays[boardHeight-1][i] = 33
	arrays[i][0] = 33
})

let b = [0, boardHeight - 1].map((y, i) => {
	console.log(22, y, i)
	arrays[y].forEach((frame, x) => {
		if (x == GLOBALS.entrance.column && y == 0) {
			arrays[y][x] = 0
		} else {
			arrays[y][x] = 33
		}
	})
})

//temp tower bases
// col[1]
// arrays[4][1] = 35

//col[2]
// arrays[2][2] = 35
// arrays[6][2] = 35

//col[3]
// arrays[1][3] = 35
// arrays[2][3] = 35
// arrays[3][3] = 35
// arrays[4][3] = 35
// arrays[5][3] = 35
// arrays[6][3] = 35

arrays[boardHeight - 4][boardWidth - 2] = 35
collisionArray = [].concat.apply([], arrays)

// collisionArray[1] = 33

let goalsArray = Array.from(new Array(boardSize), (x, i) => 0)
goalsArray[0] = 44

let towersArray = Array.from(new Array(boardSize), (x, i) => 0)

let creepSpeed = 12

let data = {
	height: boardHeight,
	tilewidth: 16,
	version: 1,
	width: boardWidth,
	orientation: 'orthogonal',
	layers: [
		{
			data: backgroundArray,
			height: boardHeight,
			name: 'background',
			opacity: 1,
			type: 'tilelayer',
			visible: true,
			width: boardWidth,
			x: 0,
			y: 0
		},
		{
			data: collisionArray,
			height: boardHeight,
			name: 'collision',
			opacity: 1,
			properties: {
				collision: 'true'
			},
			type: 'tilelayer',
			visible: true,
			width: boardWidth,
			x: 0,
			y: 0
		},
		{
			data: towersArray,
			height: boardHeight,
			name: 'towers',
			opacity: 1,
			properties: {},
			type: 'tilelayer',
			visible: true,
			width: boardWidth,
			x: 0,
			y: 0
		}
	],
	tileheight: 16,
	tilesets: [
		{
			firstgid: 1,
			image: '../images/open_tileset.png',
			imageheight: 180,
			imagewidth: 160,
			margin: 0,
			name: 'map_tileset',
			properties: {},
			spacing: 0,
			tileheight: 16,
			tilewidth: 16
		}
	]
}

export default data

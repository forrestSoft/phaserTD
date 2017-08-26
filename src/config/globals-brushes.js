var brushes = {
	fancyBrushes: [
		{ 
			sprite: ['brownWall','brownWall','brownWall',
					 'brownWall','straightDownB','straightDownA',
					 'brownWall','straightDownB' ,'brownWall'],
			size: [3,3],
			name: 'NS'
		},
		{
			sprite: ['brownWall','brownWall','brownWall',
					 'straightDownB','straightDownB','straightDownA',
					 'brownWall','brownWall','brownWall'],
			size: [3,3],
			name: 'EW'
		},
		{
			sprite: ['brownWall','brownWall','brownWall',
					 'straightDownA','straightDownB','brownWall',
					 'brownWall','straightDownB' ,'brownWall'],
			size: [3,3],
			name: 'NS'
		},
		{
			sprite: ['brownWall','straightDownA','brownWall',
					 'brownWall','straightDownB','brownWall',
					 'brownWall','straightDownB' ,'brownWall'],
			size: [3,3],
			name: 'NS'
		},
		// {
		// 	sprite: ['brownWall','straightDownB','brownWall',
		// 			 'brownWall','straightDownB','straightDownA',
		// 			 'brownWall','brownWall','brownWall'],
		// 	size: [3,3],
		// 	name: 'downRight90'
		// },
		// {
		// 	sprite: ['brownWall','straightDownA','brownWall',
		// 			 'brownWall','straightDownB','brownWall',
		// 			 'brownWall','straightDownB' ,'brownWall'],
		// 	size: [3,3],
		// 	name: 'NS'
		// },
		{
			sprite: ['brownWall','straightDownB','brownWall',
					 'brownWall','straightDownB','straightDownA',
					 'brownWall','brownWall','brownWall'],
			size: [3,3],
			name: 'downRight90'
		},
		// {
		// 	sprite: ['brownWall','brownWall','brownWall',
		// 			 'straightDownB','straightDownB','straightDownA',
		// 			 'brownWall','brownWall','brownWall'],
		// 	size: [3,3],
		// 	name: 'EW'
		// },
		{
			sprite: ['brownWall','straightDownB','brownWall',
					 'straightDownA','straightDownB','brownWall',
					 'brownWall','brownWall','brownWall'],
			size: [3,3],
			name: 'upRight90'
		},
		
		{
			sprite: ['brownWall','straightDownB','brownWall', 'brownWall',
					 'straightDownA','straightDownB','brownWall', 'brownWall',
					 'brownWall','brownWall','brownWall', 'brownWall'],
			size: [4,3],
			name: 'upRight90'
		},
		{
			sprite: ['straightDownB', 'brownWall', 'straightDownA', 'brownWall',
					 'straightDownA', 'brownWall', 'straightDownB', 'brownWall',
					 'straightDownA', 'straightDownB', 'straightDownA', 'brownWall',
					 'brownWall', 'brownWall', 'brownWall', 'brownWall'],
			size: [4,4]
		},
		{	sprite: ['none','none', 'brownWall',
					 'none', 'brownWall', 'none',
					 'brownWall', 'none', 'none'],
			 size: [3,3]
		},
		{
			sprite: ['brownWall'],
			size: [1,1]
		}

	],
	brushMap: {
		brownWall: 34,
		straightDownA: 30,
		straightDownB: 31,
		none: -999
	},
	rotateFancyBrush: function(brush = 0, CWRotFactor = 0, data){
		// console.log('----rot:', CWRotFactor, data)

		// turn 1d brush array into 2d array, then rotate 0,90,180,270
		if(![0,1,2,3].includes(CWRotFactor)){
			console.error('rotateFancyBrushte: invalid rotation factor:', CWRotFactor)
			return
		}
		let brushData = GLOBALS.fancyBrushes[brush]
		let oSize = brushData.size.slice()
		let size = CWRotFactor%2==0 ? oSize : oSize.reverse()
		let modifiedArray = (data && data.slice()) || GLOBALS.fancyBrushes[brush].sprite.slice()

		let toRows = function(){
			let c = []
			let t = [...Array(size[1])].forEach((_,i)=>{
				let l = i*size[1]
				let k = l + size[0]
				let d = modifiedArray.slice(l,k)
				c.push(d)
			})

			return c.reverse()
		}

		let rotate90 = function(a){
			let rotated = a[0].map(function(col, i) {
				return a.map(function(row) { 
					return row[i]
				})
			})

			return rotated
		}

		if(CWRotFactor == 0){
			return [].concat(...modifiedArray)
		}

		let slice = modifiedArray.slice()
		let rows = toRows(slice)
		let rotated = rotate90(rows)

		let newRotation = CWRotFactor - 1

		return this.rotateFancyBrush(brush,newRotation,[].concat(...rotated))
	}
}
/*
[1,2,3]
[4,5,6]
[7,8,9]

[7,4,1]
[8,5,2]
[9,6,3]

[9,8,7]
[6,5,4]
[3,2,1]

[3,6,9]
[2,5,8]
[1,4,7]

*/
brushes.fancyBrushes.sort((a,b)=> {
	if(a.size[0] > b.size[0]){
		return -1
	}else if(b.size[0] > a.size[0]){
		return 1
	}else if(a.size[1] > b.size[1]){
		return -1
	}else if (b.size[1] > a.size[1]){
		return 1
	}else{
		return -1
	}
})

brushes.fancySortedSizes = brushes.fancyBrushes.map((box,i)=>{
	return {
		w: box.size[0]+.2, h: box.size[1]+.2
	}
})

export default brushes
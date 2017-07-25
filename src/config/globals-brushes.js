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
		}

	],
	brushMap: {
		brownWall: 34,
		straightDownA: 30,
		straightDownB: 31,
		none: -999
	},
	rotateFancyBrush: function(brush = 0, CWRotFactor = 0){
		// turn 1d brush array into 2d array, then rotate 0,90,180,270
		if(![0,1,2,3].includes(CWRotFactor)){
			console.error('rotateFancyBrushte: invalid rotation factor:', CWRotFactor)
			return
		}

		let b = GLOBALS.fancyBrushes[brush]

		let c = []
		let t = [...Array(b.size[1])].forEach((_,i)=>{
			let l = i*b.size[1]
			let k = l + b.size[0]
			let d = b.sprite.slice(l,k)
			c.push(d)
		})

		if(CWRotFactor == 0){
			console.log(c)
			return [].concat(...c)
		}

		c.reverse()

		let finalArray
		let intermediateArray = c
		window.t2 = [...Array(CWRotFactor)].forEach((_, i)=>{
			intermediateArray = intermediateArray[0].map(function(col, i) { 
			  return intermediateArray.map(function(row) { 
			    return row[i] 
			  })
			})

			finalArray = intermediateArray
		})

		console.log([].concat(...finalArray))
		return [].concat(...finalArray)
	}
}

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
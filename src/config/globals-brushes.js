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
		{
			sprite: ['brownWall','straightDownB','brownWall',
					 'brownWall','straightDownB','straightDownA',
					 'brownWall','brownWall','brownWall'],
			size: [3,3],
			name: 'downRight90'
		},
		{
			sprite: ['brownWall','straightDownA','brownWall',
					 'brownWall','straightDownB','brownWall',
					 'brownWall','straightDownB' ,'brownWall'],
			size: [3,3],
			name: 'NS'
		},
		{
			sprite: ['brownWall','straightDownB','brownWall',
					 'brownWall','straightDownB','straightDownA',
					 'brownWall','brownWall','brownWall'],
			size: [3,3],
			name: 'downRight90'
		},
		{
			sprite: ['brownWall','brownWall','brownWall',
					 'straightDownB','straightDownB','straightDownA',
					 'brownWall','brownWall','brownWall'],
			size: [3,3],
			name: 'EW'
		},
		{
			sprite: ['brownWall','straightDownB','brownWall',
					 'straightDownA','straightDownB','brownWall',
					 'brownWall','brownWall','brownWall'],
			size: [3,3],
			name: 'upRight90'
		}
	],
	brushMap: {
		brownWall: 34,
		straightDownA: 30,
		straightDownB: 31
	}
}

export default brushes
var towers = {
	towers: {
		45: {
			name: 'cannon',
			type: 'splash',
			tint: 'ff0000',
			bulletAngleOffset: 90,
			index: 45,
			firingInterval: 1750,
			rangeRadius: 40,
			bulletSpeed: 150,
			damage: [13.5, 28, 45],
			cost: [10, 10, 17]
		},
		36: {
			name: 'sniper',
			type: 'PerpendicularFire',
			tint: '00ff00',
			bulletAngleOffset: 90,
			index: 36,
			firingInterval: 1500,
			rangeRadius:75,
			bulletSpeed: 350,
			damage: [19, 35, 55],
			cost: [25, 20, 50]
		},
		26: {
			name: 'gattling',
			type: 'fast',
			tint: '0000ff',
			bulletAngleOffset: 90,
			index: 26,
			firingInterval: 15,
			rangeRadius: 25,
			bulletSpeed: 275,
			cost: [10, 5, 8],
			scale: [.1,.1],
			damage: [1,1.25,1.8]
		}
	}
}

export default towers
var towers = {
	towers: {
		45: {
			name: 'cannon',
			type: 'splash',
			tint: 'ff0000',
			bulletAngleOffset: 90,
			index: 45,
			firingInterval: 1500,
			rangeRadius: 40,
			bulletSpeed: 150,
			damageValue: 2.5,
			damage: [2.5, 3.5, 5],
			cost: [10, 17, 22]
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
			damageValue: 15,
			damage: [15, 20, 28],
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
			damageValue: 1,
			cost: [10, 5, 8],
			scale: [.1,.1],
			damage: [1,1.25,1.8]
		}
	}
}

export default towers
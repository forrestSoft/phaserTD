

var towers = {
	towers: {
		45: {
			name: 'cannon',
			type: 'splash',
			tint: '0xff0000',
			displayAngle: 0,
			fireAngle: 180,
			bulletAngleOffset: 	90,
			index: 45,
			firingInterval: 1500,
			rangeRadius: 40,
			bulletSpeed: 150,
			damageValue: 5,
			cost: 5

		},
		36: {
			name: 'sniper',
			type: 'PerpendicularFire',
			tint: '0x00ff00',
			displayAngle: 0,
			fireAngle: 180,
			bulletAngleOffset: 	90,
			index: 36,
			firingInterval: 1500,
			rangeRadius:75,
			bulletSpeed: 250,
			damageValue: 5,
			cost: 25
		},
		26: {
			name: 'gattling',
			type: 'fast',
			tint: '0x0000ff',
			displayAngle: 0,
			bulletAngleOffset: 90,
			index: 26,
			firingInterval: 125,
			rangeRadius: 25,
			bulletSpeed: 125,
			damageValue: 1,
			cost: 10
		}
	}
}

export default towers
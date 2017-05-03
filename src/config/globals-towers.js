

var towers = {
	towers: {
		44: {
			name: 'yellow',
			type: 'PerpendicularFire',
			displayAngle: 180,
			fireAngle: 90,
			bulletAngleOffset: 90,
			index: 44,
			range: 100
		},
		45: {
			name: 'red',
			type: 'PerpendicularFire',
			displayAngle: 0,
			fireAngle: 270,
			bulletAngleOffset: 90,
			index: 45,
			range: 100

		},
		36: {
			name: 'yellow',
			type: 'PerpendicularFire',
			displayAngle: 0,
			fireAngle: 180,
			bulletAngleOffset: 	90,
			index: 36,
			// range: 100
			firingInterval: 1500,
			rangeRadius:75,
			bulletSpeed: 120,
			damageValue: 5
		},
		26: {
			name: 'gattling',
			type: 'fast',
			displayAngle: 0,
			bulletAngleOffset: 90,
			index: 26,
			// range: 75,
			firingInterval: 175,
			rangeRadius: 25,
			bulletSpeed: 75,
			damageValue: 1
		}
	}
}

export default towers
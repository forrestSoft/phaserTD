var creeps = [
	{
		type: 0,
		name: 'player',
		properties: {
			group: 'board',
			texture: 'female02_rouge_spritesheet',
			walking_speed: 12,
			gold: [2, 5, 9],
			health: [50, 120, 200],
			bossInterval: 5,
			miniBossInterval: 2,
			hue: 300
		},
		type: 'player',
		visible: true
	},
	{
		type: 1,
		name: 'player',
		properties: {
			group: 'board',
			texture: 'male_fighter_spritesheet',
			walking_speed: 24,
			gold: [1,2,3],
			health: [14, 30, 42],
			bossInterval: 5,
			miniBossInterval: 2,
			hue: 1
		},
		type: 'player',
		visible: true
	},
	{
		type: 2,
		name: 'player',
		properties: {
			group: 'board',
			texture: 'female02_mage_spritesheet',
			walking_speed: 8,
			gold: [3,7,11],
			health: [96, 156, 212],
			bossInterval: 5,
			miniBossInterval: 2,
			hue: 156
		},
		type: 'player',
		visible: true
	}
]
creeps.forEach((item) => {
	item.getData = function(lvl=0){
		let props = Object.assign({},this.properties)
		props.health = this.properties.health[lvl]
		props.gold = this.properties.gold[lvl]
		return props
	}
})
export default creeps
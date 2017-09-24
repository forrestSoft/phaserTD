var creeps = [
	{
		type: 0,
		name: 'player',
		properties: {
			group: 'board',
			texture: 'female02_rouge_spritesheet',
			walking_speed: 12,
			gold: 2,
			health: 50
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
			gold: 1,
			health: 14
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
			gold: 3,
			health: 96
		},
		type: 'player',
		visible: true
	}
]

export default creeps

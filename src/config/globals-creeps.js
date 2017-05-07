var creeps = [
	{
		type: 0,
		speed: 5,
		health: 10,
		gold: 1,
		"gid":118,
		"height":0,
		"name":"player",
		"properties":
		{
		 group: "players",
		 texture: "male_fighter_spritesheet",
		 walking_speed: 10,
		 gold: 1,
		 health: 10
		},
		"type":"player",
		"visible":true,
		"width":0,
	},
	{
		type: 1,
		speed: 5,
		health: 6,
		gold: 1,
		"gid":118,
		"height":0,
		"name":"player",
		"properties":
		{
		 "group":"players",
		 "texture":"male_fighter_spritesheet",
		 "walking_speed": 24,
		 gold: 1,
		 health: 5
		},
		"type":"player",
		"visible":true,
		"width":0,
	}
]

export default creeps
// GLOBALS.prefab_classes[object.type](this.state, object.name, position, object.properties);
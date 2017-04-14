import stampit from 'stampit'

import GLOBALS from '../config/globals'

export var Board = stampit()
	.methods({
		buildMap (){
			let map = this.level_data.map
		    this.map = game.add.tilemap(this.name);
		    this.map.tilesets.forEach(function (tileset, i) {
		        this.map.addTilesetImage(tileset.name, map.tilesets[i]);
		    }, this);
		    return this.map
		},
		buildLayers(groups, layers) {
			this.map.layers.forEach((layer) => {
		      let layerObj = this.map.createLayer(layer.name);
		      layers[layer.name] = layerObj
		      groups.board.addChild(layerObj)
		      layers[layer.name].fixedToCamera = false;
		    }, this);

		    // layers['goals'].bringToTop()
		},

		buildGroups(groups){
		    this.level_data.groups.forEach(function (group_name) {
		        groups[group_name] = game.add.group();
		    }, this);
		},

		buildObjects(groups, prefabs, state){
			let prefab;
			let data = this.map.objects.objects[0];
			// console.log(data)
		    // data.y = GLOBALS.globalOffset.y
		    
		    groups.board.inputEnabled = true
		    prefabs[data.name] = this.create_object(data,state)
		    groups.board.addChild(prefabs[data.name])
		},
		buildSpawn(groups){
			let spawn = game.make.sprite(GLOBALS.entrance.column*GLOBALS.ty,GLOBALS.entrance.row*GLOBALS.tx,'ms',43)
			groups.board.addChild(spawn)
		},
		buildGoal(groups){
			let goal = game.make.sprite(GLOBALS.exit.column*GLOBALS.ty,GLOBALS.exit.row*GLOBALS.tx,'ms',43)
			groups.board.addChild(goal)
		},
		create_object (object, state) {
			let object_y, position, prefab;
			object_y = object_y//(object.gid) ? object.y - (this.map.tileHeight / 2) : object.y + (object.height / 2);
			// console.log(object)
			position = {"x": object.x , "y": object.y};
			if (GLOBALS.prefab_classes.hasOwnProperty(object.type)) {
			  prefab = new GLOBALS.prefab_classes[object.type](state, object.name, position, object.properties);
			}
			return prefab
		}
	})
	.refs({
		name: 'level1'
	})
	.init(function (a, {args, instance, stamp}) {
		// console.log(game.cache.getJSON('level1'))
		instance.level_data = game.cache.getJSON('level1')
	})


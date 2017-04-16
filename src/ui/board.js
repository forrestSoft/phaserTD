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
		buildForCreate(){
			this.buildLayers()
		    this.buildGroups()
		    this.buildCreep()
		    this.buildGoal()
		    this.buildSpawn()
		},
		buildLayers() {
			this.map.layers.forEach((layer) => {
		      let layerObj = this.map.createLayer(layer.name);
		      this.layers[layer.name] = layerObj
		      this.groups.board.addChild(layerObj)
		      this.layers[layer.name].fixedToCamera = false;
		    }, this);

		    // layers['goals'].bringToTop()
		},

		buildGroups(){
		    this.level_data.groups.forEach(function (group_name) {
		        this.groups[group_name] = game.add.group();
		    }, this);
		},
		buildCreep(){
			let data = this.map.objects.objects[0];
			let prefab = this.create_object(data,this.state)
		    this.groups.board.addChild(prefab)
		},
		buildCreepNew(){
			this.buildCreep()
			this.objects['goal'].bringToTop()
			this.objects['spawn'].bringToTop()
		},
		buildObjects(){
			let prefab;
			let data = this.map.objects.objects[0];
			// console.log(data)
		    // data.y = GLOBALS.globalOffset.y
		    
		    // groups.board.inputEnabled = true
		    this.prefabs[data.name] = this.create_object(data,this.state)
		    this.groups.board.addChild(this.prefabs[data.name])
		},
		buildSpawn(){
			this.objects['spawn'] = game.make.sprite(GLOBALS.entrance.columnPX,GLOBALS.entrance.rowPX,'ms',43)
			this.groups.board.addChild(this.objects['spawn'])
		},
		buildGoal(){
			this.objects['goal'] = game.make.sprite(GLOBALS.exit.columnPX,GLOBALS.exit.rowPX,'ms',43)
			this.groups.board.addChild(this.objects['goal'])
		},
		create_object (object) {
			let object_y, position, prefab;
			// object_y = object_y//(object.gid) ? object.y - (this.map.tileHeight / 2) : object.y + (object.height / 2);
			position = {"x": object.x , "y": object.y};
			if (GLOBALS.prefab_classes.hasOwnProperty(object.type)) {
			  prefab = new GLOBALS.prefab_classes[object.type](this.state, object.name, position, object.properties);
			}
			return prefab
		}
	})
	.refs({
		name: 'level1'
	})
	.init(function ({groups, layers, state, objects}, {args, instance, stamp}) {
		Object.assign(instance, {groups, layers, state, objects, level_data: game.cache.getJSON('level1')})
	})


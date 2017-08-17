import stampit from 'stampit'
import Phaser from 'phaser'
import _ from 'underscore'
import {Points} from '../utils'

import GLOBALS from '../config/globals'

export const DebugManager = stampit()
	.methods({
		add(f){
			this.functions.push(f)
		},
		getFunctions(){
			return this.functions
		}
	})
	.init(function (a, {args, instance, stamp}) {
		Object.assign(instance, {
			functions: []
		})
	})
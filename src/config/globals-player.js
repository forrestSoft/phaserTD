var player = {
		life: 20,
		gold: 35,
		score: 0,
		wave: 1,
		ui:{
			tileLock: 0
		},
		debug: function(){
			GLOBALS.pd.add(()=>{
				let text2 = `tile lock: ${GLOBALS.player.ui.tileLock}`
				game.debug.text(text2, 4, 230)
			})
	}
}

export default player
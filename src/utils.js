export const centerGameObjects = (objects) => {
  objects.forEach(function (object) {
    object.anchor.setTo(0.5)
  })
}

export const buildBoundInputMask = ({x,y,height,width, objectToMask, name}) => {
	if(!game.inputMasks){
		game.inputMasks = {}
	}
    let rect, mask
    mask = game.add.graphics(0, 0);
    mask.beginFill(0xffffff);

    mask.inputEnabled = true
    mask.drawRect(x, y, height,width)
    objectToMask.mask = mask

    game.inputMasks[name] = mask	  
}

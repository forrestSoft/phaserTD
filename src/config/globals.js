var globals = {
  globalOffset: {
    x: 0,
    y: 16
  },
  height: 10,
  width: 11,
  tx: 16,
  ty: 16,
  grid_dimensions: {
    row: this.height, 
    column: this.width
  },
  entrance: {
    row: 0,
    column: 2
  },
  exit: {
    row: 5
  },
  fancyBrushes: [
    {
      sprite: [32,37,32,
               32,37,32,
               32,37,32],
      size: [3,3]
    },
    {
      sprite: [7,37,32,
               32,37,32,
               32,37,32],
      size: [3,3]
    }
  ]
}

const tempGlobalsExit = {
  column: globals.width - 1,
  rowPX: globals.exit.row * globals.ty
}
Object.assign(globals.exit, tempGlobalsExit)

const tempGlobalsExit2 = {
  columnPX: globals.exit.column * globals.ty
}
Object.assign(globals.exit, tempGlobalsExit2)

const tempGlobalsEntrance = {
  rowPX: globals.entrance.row * globals.ty,
  columnPX: globals.entrance.column * globals.ty
}
Object.assign(globals.entrance, tempGlobalsEntrance)

export default globals
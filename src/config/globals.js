import Towers from './globals-towers'
import Brushes from './globals-brushes'

var globals = {
  globalOffset: {
    x: 0,
    y: 16
  },
  height: 11,
  width: 11,
  tx: 16,
  ty: 16,
  tH: 16,
  tW: 16,
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
  acceptableTiles: [-1,25,30,31,32],
  unacceptableTiles: [30,31,34,44,45],
  creeps: {
    pool: 10
  },
  towerFoundation: 35
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
Object.assign(globals, Brushes)
globals.towers = Towers

export default globals
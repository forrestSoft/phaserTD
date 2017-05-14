import Phaser from 'phaser'
import { centerGameObjects } from '../utils'
import Level1 from '../config/level1config'

export default class extends Phaser.State {
  init () {}

  preload () {
    this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg')
    this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar')
    centerGameObjects([this.loaderBg, this.loaderBar])

    this.load.setPreloadSprite(this.loaderBar,0)

    let assets, asset_loader, asset_key, asset
    assets = this.cache.getJSON('level1').assets
    
    for (asset_key in assets) {
        if (assets.hasOwnProperty(asset_key)) {
            asset = assets[asset_key];
            switch (asset.type) {
                case "image":
                    this.load.image(asset_key, asset.source)
                    break;
                case "spritesheet":
                    this.load.spritesheet(asset_key, asset.source, asset.frame_width, asset.frame_height, asset.frames, asset.margin, asset.spacing)
                    break;
                case "tilemap":
                    console.log(assets)
                    this.load.tilemap(asset_key, asset.source, null, Phaser.Tilemap.TILED_JSON)
                    break;
                case "atlasXML":
                    this.load.atlasXML(asset_key, asset.image, asset.xml)
                    break
                case "atlas":
                    this.load.atlas(asset_key, asset.image, asset.json)
                    break
            }
        }
    }

    this.load.tilemap('level1', null, Level1, Phaser.Tilemap.TILED_JSON)
  }

  create () { 
    this.state.start('Game')
  }
}

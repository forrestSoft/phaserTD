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
    this.load.image('mushroom', 'assets/images/mushroom2.png')

    let assets, asset_loader, asset_key, asset;
    assets = this.cache.getJSON('level1').assets;
    
    for (asset_key in assets) { // load assets according to asset key
        if (assets.hasOwnProperty(asset_key)) {
            asset = assets[asset_key];
            switch (asset.type) {
            case "image":
                this.load.image(asset_key, asset.source);
                break;
            case "spritesheet":
                this.load.spritesheet(asset_key, asset.source, asset.frame_width, asset.frame_height, asset.frames, asset.margin, asset.spacing);
                break;
            case "tilemap":
            console.log(assets)
                this.load.tilemap(asset_key, asset.source, null, Phaser.Tilemap.TILED_JSON);
                break;
            }
        }
    }

    this.load.tilemap('level1', null, Level1, Phaser.Tilemap.TILED_JSON)
    this.load.spritesheet('ms',"assets/images/open_tileset.png", 16,16)
    this.load.atlasXML('weapons', 'assets/images/weapons.png','assets/images/weapons.xml')
    this.load.spritesheet('kaboom', 'assets/images/explosion.png', 64, 64, 23)
    this.load.atlas('tank', 'assets/games/tanks/tanks.png', 'assets/games/tanks/tanks.json');
    this.load.spritesheet('female02_mage_spritesheet', 'assets/images/characters/mage_f.png', 24, 32)
    this.load.spritesheet('female02_rouge_spritesheet', 'assets/images/characters/ranger_f.png', 24, 32)
  }

  create () { 
    this.state.start('Game')
  }
}

import Utility from './Utility';
import Player from './Player'
import { PhysicalObject2D, TwoVector } from 'lance-gg'
import { BaseTypes } from 'lance-gg';

let game = null;
let p2 = null;


export default class Gun extends PhysicalObject2D{
    
    static get netScheme() {
        return Object.assign({
            firingRate: { type: BaseTypes.TYPES.INT16 },
            reloadTime: {type: BaseTypes.TYPES.INT16},
            shuffle: {type: BaseTypes.TYPES.UINT8},
            projectiles: {type:BaseTypes.TYPES.LIST, itemType: BaseTypes.TYPES.STRING},
            currentQueue: {type:BaseTypes.TYPES.LIST, itemType: BaseTypes.TYPES.STRING},
            modifierStack: {type: BaseTypes.TYPES.LIST, itemType: BaseTypes.TYPES.STRING},
            ogdeck: {type: BaseTypes.TYPES.LIST, itemType: BaseTypes.TYPES.STRING},
            fireCooldown:{type: BaseTypes.TYPES.INT16},
            maxCooldown: {type: BaseTypes.TYPES.INT16},
            mana: {type: BaseTypes.TYPES.FLOAT32},
            maxMana: {type: BaseTypes.TYPES.FLOAT32},
            manaRegen: {type: BaseTypes.TYPES.FLOAT32}
        }, super.netScheme);
    }  

    onAddToWorld(){
        game = this.gameEngine;
        p2 = game.physicsEngine.p2;
        //let playermat = new p2.Material()
        this.physicsObj = new p2.Body({
            mass: 0, damping: 0, angularDamping: 0,
            position: [0, 0],
            velocity: [0, 0],
            fixedRotation: true
        });
        this.physicsObj.addShape(new p2.Circle({
            radius: 0,
            material:game.playermat,
            collisionResponse: false           
        }));
        
        game.physicsEngine.world.addBody(this.physicsObj);
    }
    onRemoveFromWorld(){
        game.physicsEngine.world.removeBody(this.physicsObj);
    }
    syncTo(other) {
        super.syncTo(other);
        //let netScheme = this.constructor.netScheme;
        this.projectiles = [...other.projectiles]
        this.currentQueue = [...other.currentQueue]
        this.modifierStack = [...other.modifierStack]
        this.ogdeck = [...other.ogdeck]
    }


}
import { PhysicalObject2D, BaseTypes, TwoVector} from 'lance-gg';
import Utility from './Utility'
import Player from './Player'
let game = null;
let p2 = null;

export default class Projectile extends PhysicalObject2D{
    static get netScheme(){
        return Object.assign({
            ownedPlayer: {type:BaseTypes.TYPES.INT16},
            size: {type:BaseTypes.TYPES.FLOAT32},
            hitbox: {type:BaseTypes.TYPES.FLOAT32},
            damage: {type:BaseTypes.TYPES.FLOAT32},
            projName: {type:BaseTypes.TYPES.STRING},
            override:{type:BaseTypes.TYPES.LIST, itemType: BaseTypes.TYPES.STRING},
            frame: {type: BaseTypes.TYPES.UINT8},
            frameTime: {type: BaseTypes.TYPES.FLOAT32},
            damping: {type:BaseTypes.TYPES.FLOAT32},
            collisionResponse: {type: BaseTypes.TYPES.UINT8},
            props: {type:BaseTypes.TYPES.LIST, itemType: BaseTypes.TYPES.INT16},
            hitpoint: {type: BaseTypes.TYPES.LIST, itemType: BaseTypes.TYPES.FLOAT32}
        }, super.netScheme)
    }
    get bending() {
        return { position: {percent:1} , velocity:{percent:1}};
    }
    onAddToWorld() {
        game = this.gameEngine;
        p2 = game.physicsEngine.p2;
        
        this.physicsObj = new p2.Body({
            mass: this.mass, damping: this.damping, angularDamping: 0,
            position: [this.position.x, this.position.y],
            velocity: [this.velocity.x,this.velocity.y],
            fixedRotation: true,
        });
        this.physicsObj.addShape(new p2.Circle({
            radius: this.hitbox,
            collisionGroup: game.PROJ,
            collisionMask: (game.ALLPLAYERS - Math.pow(2, game.OFFSET + this.ownedPlayer)) | game.BBOX,
            material:game.playermat,
            collisionResponse: (this.collisionResponse == 1)
            //collisionResponse: false
        }));
        
        game.physicsEngine.world.addBody(this.physicsObj);
        console.log('ADDED')
        // console.log(`SPAWN TIME: ${this.spawnTime}, GAME TIME: ${new Date().getTime()}`)
    } 

    onRemoveFromWorld() {
        game.physicsEngine.world.removeBody(this.physicsObj);
    }

    syncTo(other) {
        let oldframe = null
        let oldframeTime = null
        if (this.frame){
            oldframe = this.frame
        }
        if (this.frameTime){
            oldframeTime = this.frameTime
        }
        super.syncTo(other);
        this.frame = oldframe ?? other.frame
        this.frameTime = oldframeTime ?? other.frameTime
        this.override = [...other.override]
        this.props = [...other.props]
        this.hitpoint = [...other.hitpoint]
        //this.spawnTime = other.spawnTime
    }
    
    

}


import { PhysicalObject2D, BaseTypes } from 'lance-gg';

let game = null;
let p2 = null;

export default class Player extends PhysicalObject2D{
    static get netScheme() {
        return Object.assign({
            health: { type: BaseTypes.TYPES.FLOAT32 },
            shield: {type: BaseTypes.TYPES.FLOAT32},
            shieldCooldown: {type: BaseTypes.TYPES.INT16},
            maxHealth:{type: BaseTypes.TYPES.FLOAT32 },
            maxShield: {type: BaseTypes.TYPES.FLOAT32 },
            speed: {type: BaseTypes.TYPES.FLOAT32},
            gunId: {type: BaseTypes.TYPES.INT16},
            effects: {type: BaseTypes.TYPES.LIST, itemType: BaseTypes.TYPES.STRING},
            effectsDuration: {type: BaseTypes.TYPES.LIST, itemType: BaseTypes.TYPES.INT16},
            guns: {type: BaseTypes.TYPES.LIST, itemType: BaseTypes.TYPES.INT16}
        }, super.netScheme);
    }
    get bending() {
        return { position: {percent:1} , velocity:{percent:1}};
    }
    // create physics body
    onAddToWorld() {
        game = this.gameEngine;
        p2 = game.physicsEngine.p2;
        //let playermat = new p2.Material()
        this.physicsObj = new p2.Body({
            mass: this.mass, damping: 0.9, angularDamping: 0,
            position: [this.position.x, this.position.y],
            velocity: [this.velocity.x, this.velocity.y],
            fixedRotation: true
        });
        this.physicsObj.addShape(new p2.Circle({
            radius: game.playerRadius,
            collisionGroup: Math.pow(2, game.OFFSET + this.playerId),
            collisionMask: game.ALLPLAYERS | game.BBOX | game.PROJ,
            material:game.playermat
        }));
        
        game.physicsEngine.world.addBody(this.physicsObj);
    } 
    onRemoveFromWorld() {
        game.physicsEngine.world.removeBody(this.physicsObj);
    }
    syncTo(other) {
        super.syncTo(other);
        this.effects = [...other.effects]
        this.effectsDuration = [...other.effectsDuration]
        this.guns = [...other.guns]
    }

    toString() {
        return `Player::${super.toString()} Health${this.health}`;
    }
}
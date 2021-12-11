import { ServerEngine, TwoVector } from 'lance-gg';
import Player from '../common/Player';
import Projectile from '../common/Projectile';
import Utility from '../common/Utility'
export default class NServerEngine extends ServerEngine {

    constructor(io, gameEngine, inputOptions) {
        super(io, gameEngine, inputOptions);
        gameEngine.physicsEngine.world.on('beginContact', this.handleCollision.bind(this));
        gameEngine.physicsEngine.world.on('endContact', this.handleEndCollision.bind(this))
        gameEngine.on('shoot', this.shoot.bind(this));
        gameEngine.on('fire', this.fire.bind(this))
        gameEngine.on('preStep', this.applyEffects.bind(this))
        gameEngine.on('preStep', this.projTick.bind(this))
        // this.io.on('canvas', this.setCanvas.bind(this))
    }
    // setCanvas(arr, playerId){
    //     console.log('TEST')
    //     this.gameEngine.playerCanvas[playerId] = [...arr]
    // }

    applyEffects(){
        //console.log('EFFECT')
        this.gameEngine.world.forEachObject((id, obj) => {
            if (obj instanceof Player){
                for (var i = 0; i < obj.effects.length; i++){
                    if (Utility.effects[obj.effects[i]].onTick){
                        Utility.effects[obj.effects[i]].onTick(obj, this.gameEngine)
                    }
                    
                    obj.effectsDuration[i] -= 1
                    if (obj.effectsDuration[i] <= 0){
                        if (Utility.effects[obj.effects[i]].onEnd){
                            Utility.effects[obj.effects[i]].onEnd(obj, this.gameEngine)
                        }
                        obj.effects.splice(i, 1)
                        obj.effectsDuration.splice(i, 1)
                    }
                }
            }
        })
    }
    start() {
        super.start();
        
    }

    fire(playerId, mousePos, overGun, overPosition, noFire, response){
        // console.log(`NOFIRE?: ${noFire}`)
        let player = this.gameEngine.world.queryObject({playerId:playerId, instanceType:Player})
        let gun = overGun ?? this.gameEngine.world.objects[player.gunId]

        if (gun.fireCooldown > 0){
            return
        }

        let position = overPosition ?? player.physicsObj.position
        position = new TwoVector(...position)
        let modCooldown = 0
        let queued = []
        let oldCurrentQueue = [...gun.currentQueue]
        let oldModifierStack = [...gun.modifierStack]
        let mana1 = 0
        do{
            if (gun.currentQueue.length <= 0){
                break
            }
            if (gun.modifierStack.length > 0 && gun.modifierStack[0] == 'cast'){
                gun.modifierStack.shift()
            }
            let top = gun.currentQueue.shift()
            if (Utility.projectileNames.includes(top)){
                let modifierAdd = []
                while (gun.modifierStack.length > 0 && gun.modifierStack[0] != 'cast'){
                    let modifier = gun.modifierStack.shift()
                    modifierAdd.unshift(modifier)
                }
                modCooldown += Utility.projectiles[top].cooldown
                modifierAdd.unshift('default')
                let projProps = Utility.mergeMany(top, modifierAdd)
                mana1 += projProps.mana
                queued.push([top, modifierAdd])
                // this.shoot(playerId, mousePos, top, modifierAdd, position)
            }
            else{
                if (Utility.true_modifiers[top]){
                    gun.modifierStack.unshift(...Utility.true_modifiers[top])
                }
                else{
                    gun.modifierStack.unshift(top)
                }
            }
            
        }
        while (gun.modifierStack.length > 0)

        if ((mana1 > gun.mana) || noFire){
            console.log(`NOFIRE?`)
            gun.currentQueue = [...oldCurrentQueue]
            gun.modifierStack = [...oldModifierStack]
            if (noFire){
                console.log(`QUEUED ${queued}`)
                response.queued = [...queued]
            }
           
            // return queued
            // mana1 = 0
        }
        else{
            console.log(mana1)
            console.log(`QUEUED ${queued}`)
            gun.mana -= mana1
            for (var arr of queued){
                this.shoot(playerId, mousePos, arr[0], arr[1], position)
            }
            gun.modifierStack = []
            if (gun.currentQueue.length <= 0){
                gun.currentQueue = [...gun.projectiles]
                
                if (gun.shuffle == 1){
                    Utility.shuffle(gun.currentQueue)
                }
                gun.ogdeck = []
                gun.fireCooldown = gun.reloadTime + modCooldown
                gun.maxCooldown = gun.reloadTime + modCooldown
            }
            else{
                gun.fireCooldown = gun.firingRate + modCooldown
                gun.maxCooldown = gun.firingRate + modCooldown
            }
        }
        
    }

    shoot(playerId, pMouse, projName, override, overPosition){
        let game = this.gameEngine
        // override.unshift('default')
        let projProps = Utility.mergeMany(projName, override)  
        let ownedPlayer = game.world.queryObject({playerId:playerId, instanceType:Player})
        let position = overPosition ?? ownedPlayer.position
        let dirVec = pMouse.clone().subtract(position)
        dirVec.normalize()
        let randAngle = (Math.random()-0.5)*projProps.spread*2
        dirVec = new TwoVector(dirVec.x*Math.cos(randAngle) - dirVec.y*Math.sin(randAngle), dirVec.x*Math.sin(randAngle) + dirVec.y*Math.cos(randAngle))
        let newPos = position.clone().add(dirVec.clone().multiplyScalar(projProps.size + game.playerRadius + 0.05))
        let newVel = dirVec.clone().multiplyScalar(projProps.velocity)
        this.spawnProjectile(newPos, newVel, projName, override, playerId)
        console.log('AFTER SHOT')
        

       
    }

    spawnProjectile(position, velocity, projName, override, ownedPlayer){
        console.log(`POSITION: ${position}`)
        let projProps = Utility.mergeMany(projName, override)     
        console.log(`PROPS: ${projProps.lifetime}`)
        let p = new Projectile(this.gameEngine, {}, {position: position.clone(), velocity: velocity.clone(), mass: projProps.mass})
        console.log('SPAWNED NEW PROJ')
        p.ownedPlayer = ownedPlayer; p.size = projProps.size; p.damage = projProps.damage; p.projName = projName; p.hitbox = projProps.hitbox; p.override = [...override];p.frame = 0; p.frameTime = 0;p.damping = projProps.damping; p.collisionResponse = projProps.collisionResponse; p.props = []; p.hitpoint = [16,9]
        //console.log(p)
        this.gameEngine.trace.trace(() => `bullet[${p.id}] created`);
        this.gameEngine.addObjectToWorld(p)
        if(projProps.onCreate){
            projProps.onCreate(this.gameEngine, p)
        }
        if (projProps.lifetime){
            if (projProps.onExpire){
                this.gameEngine.timer.add(projProps.lifetime, projProps.onExpire, this.gameEngine, [this.gameEngine, p, p.damage, projProps])
            }
            else{
                this.gameEngine.timer.add(projProps.lifetime, this.gameEngine.destroyProj, this.gameEngine, [p.id])
            }
        }
    }

    projTick(){
        let projs = this.gameEngine.world.queryObjects({instanceType: Projectile})
        for (var proj of projs){
            // console.log(proj.projName + proj.override.join(''))

            let projProps = Utility.mergeMany(proj.projName, proj.override)
            let player1 = this.gameEngine.world.queryObject({playerId: proj.ownedPlayer, instanceType: Player})
            // console.log(`TICK ${projProps.onTick}`)
            if (projProps.onTick){
                projProps.onTick(player1, this.gameEngine, proj, projProps)
            }
        }
    }

    // handle a collision on server only
    handleCollision(evt) {
        let A;
        let B;
        this.gameEngine.world.forEachObject((id, obj) => {
            if (obj.physicsObj === evt.bodyA) A = obj;
            if (obj.physicsObj === evt.bodyB) B = obj;
        });
        if (!A || !B) return;
        if (A instanceof Projectile && B instanceof Player){

            let projProps = Utility.mergeMany(A.projName, A.override)
            if (projProps.onCollision){
                projProps.onCollision(B, this.gameEngine, A, A.damage, projProps)
            }
            else{
                console.log(`PROPS: ${projProps} PROPNAME: ${A.projName}`)
                console.log('NO COLLISION CALL')
            }
            
            
        }
        if (A instanceof Player && B instanceof Projectile){
            
            let projProps = Utility.mergeMany(B.projName, B.override)
            
            if (projProps.onCollision){
                projProps.onCollision(A, this.gameEngine, B, B.damage, projProps)
            }
            else{
                console.log(`PROPS: ${projProps} PROPNAME: ${B.projName}`)
                console.log('NO COLLISION CALL')
            }
            
        }

        
    }
   
    handleEndCollision(evt){
        let A;
        let B;
        this.gameEngine.world.forEachObject((id, obj) => {
            if (obj.physicsObj === evt.bodyA) A = obj;
            if (obj.physicsObj === evt.bodyB) B = obj;
        });
        if (!A || !B) return;
        if (A instanceof Projectile && B instanceof Player){
            let projProps = Utility.mergeMany(A.projName, A.override)
            if (projProps.onEndCollision){
                projProps.onEndCollision(B, this.gameEngine, A, projProps)
            }
            
        }
        if (A instanceof Player && B instanceof Projectile){
            let projProps = Utility.mergeMany(B.projName, B.override)
            if (projProps.onEndCollision){
                projProps.onEndCollision(A, this.gameEngine, B, projProps)
            }
        }
    }

    onPlayerConnected(socket) {
        super.onPlayerConnected(socket);
        //this.count += 1
        this.gameEngine.addPlayer(socket.playerId);
        this.gameEngine.mousePos[socket.playerId] = [0,0]
        console.log('Connected: ', socket.playerId)
        
    }

    onPlayerDisconnected(socketId, playerId) {
        let player = this.gameEngine.world.queryObject({playerId:playerId, instanceType: Player})
        this.gameEngine.destroyPlayer(player)
        super.onPlayerDisconnected(socketId, playerId);
        
    }

}


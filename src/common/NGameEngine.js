import { GameEngine, P2PhysicsEngine, TwoVector } from 'lance-gg';
import Player from './Player';
import Projectile from './Projectile';
import Utility from './Utility'
import Gun from './Gun';
export default class NGameEngine extends GameEngine {
    constructor(options) {
        super(options);

        // create physics with no friction; wrap positions after each step
        this.physicsEngine = new P2PhysicsEngine({ gameEngine: this });
        this.physicsEngine.world.islandSplit = false
        this.physicsEngine.world.defaultContactMaterial.friction = 0;
        this.on('postStep', this.destroyOnWall.bind(this));
        this.on('postStep', this.cooldownReduce.bind(this));
        this.on('preStep', this.regenShield.bind(this))
        // this.on('shoot', this.shoot.bind(this));
        
        //this.on('start', this.editUtil.bind(this))
        //this.on('postStep', this.projTick.bind(this))
        //this.on('preStep', this.applyEffects.bind(this));
        let p2 = this.physicsEngine.p2
        // game variables
        Object.assign(this, {
            playerMaxHealth: 100, playerRadius: 0.2, spaceWidth: 16, spaceHeight: 9, PLAYER: Math.pow(2, 1), playerSpeed: 100, BBOX: Math.pow(2, 2), PROJ: Math.pow(2, 3), fricfree:new p2.Material(), playermat: new p2.Material(), hpbarpadding: 0.1, hpbarheight: 0.1, mousePos: {}, playerCanvas:{}, cooldownBar: 3, cooldownBarHeight:0.5, OFFSET:4, playerShieldCooldown: 100,playerSpeed:100
        });
        this.ALLPLAYERS = Math.pow(2, 32) - Math.pow(2, this.OFFSET+1)
        let bbox = new p2.Body({
            mass: 0, damping: 0, angularDamping: 0,
            position: [0,0],
            velocity: [0,0]
        });
        
        bbox.addShape(new p2.Line({
            length:this.spaceWidth,
            collisionGroup: this.BBOX,
            collisionMask: this.ALLPLAYERS | this.PROJ,
            material:this.fricfree
        }), [0, this.spaceHeight/2]);
        bbox.addShape(new p2.Line({
            length:this.spaceWidth,
            collisionGroup: this.BBOX,
            collisionMask: this.ALLPLAYERS | this.PROJ,
            material: this.fricfree
        }), [0, -this.spaceHeight/2]);
        bbox.addShape(new p2.Line({
            length:this.spaceHeight,
            collisionGroup: this.BBOX,
            collisionMask: this.ALLPLAYERS | this.PROJ,
            material: this.fricfree
        }), [this.spaceWidth/2, 0], Math.PI/2);
        bbox.addShape(new p2.Line({
            length:this.spaceHeight,
            collisionGroup: this.BBOX,
            collisionMask: this.ALLPLAYERS | this.PROJ,
            material: this.fricfree
        }), [-this.spaceWidth/2, 0], Math.PI/2);
        this.physicsEngine.world.addBody(bbox);
        this.bbox = bbox
        
        let frictionContactMaterial = new p2.ContactMaterial(this.fricfree, this.playermat, {
            friction: 0
        })
        this.physicsEngine.world.addContactMaterial(frictionContactMaterial)
        
    }


    destroyOnWall(stepNumber) {
        let PADDING = 0.05
        this.world.forEachObject((id, obj) => {
            if (obj instanceof Projectile){
                let p = obj.position;
                let projProps = Utility.mergeMany(obj.projName, obj.override)
                if(p.x > this.spaceWidth/2-(obj.hitbox+PADDING) || p.y > this.spaceHeight/2-(obj.hitbox + PADDING) || p.x < -this.spaceWidth /2+(obj.hitbox + PADDING) || p.y < -this.spaceHeight/2+(obj.hitbox+PADDING)){
                    if (projProps.onBBOX){
                        projProps.onBBOX(obj, this)
                    }
                    else{
                        this.destroyProj(obj.id);
                    }
                    
                }
            }
        });
    }
    cooldownReduce(stepNumber){
        this.world.forEachObject((id, obj) => {
            if (obj instanceof Player){
                for (var gunId of obj.guns){
                    let gun = this.world.objects[gunId]
                    if (gun){
                        if (gun.fireCooldown > 0){
                            gun.fireCooldown--;
                        }
                        else{
                            gun.ogdeck = [...gun.currentQueue]
                            if (gun.mana < gun.maxMana){
                                gun.mana += gun.manaRegen
                            }
                            
                        }
                    }
                    

                }
               
            }
        })
    }  
    regenShield(){
        this.world.forEachObject((id, obj) => {
            if (obj instanceof Player){
                if (obj.shieldCooldown > 0){
                    obj.shieldCooldown -= 1
                }
                else{
                    if (obj.shield < obj.maxShield){
                        obj.shield += 1
                    }
                    
                }
            }
        })
    }

    damagePlayer(player, damage){
        if (player.shield > 0){
            player.shield -= Math.min(player.shield, damage)
            player.shieldCooldown = this.playerShieldCooldown
        }
        else{
            player.health -= damage
        }
    }

    addPlayer(playerId){
        let p = new Player(this, {}, {playerId:playerId, mass: 10, angularVelocity:0, position: new TwoVector(0,0), velocity: new TwoVector(0, 0)})
        console.log(playerId)
        // p.health = this.playerMaxHealth
        // p.shield = this.playerMaxHealth
        // p.maxHealth = this.playerMaxHealth
        // p.maxShield = this.playerMaxHealth
        // p.speed = this.playerSpeed
        // p.effects = []
        // p.effectsDuration = []
        Object.assign(p, {health: this.playerMaxHealth, shield: this.playerMaxHealth, maxHealth: this.playerMaxHealth, maxShield: this.playerMaxHealth, speed: this.playerSpeed, effects: [], effectsDuration: []})

        let gid = this.addGun(30, 60, playerId, 100, 1)
        p.gunId = gid
        p.guns = [gid]
        this.addObjectToWorld(p)

        //console.log(this.world.objects)
    }

    addGun(firingRate, reloadTime, playerId, maxMana, manaRegen){
        let g = new Gun(this, {}, {playerId:playerId})
        // g.firingRate = firingRate;g.reloadTime = reloadTime;g.shuffle = 0;g.projectiles = [];g.currentQueue = [];g.modifierStack = [];g.fireCooldown = 0;g.maxCooldown = firingRate;g.ogdeck = [];g.mana = maxMana; g.maxMana = maxMana;g.manaRegen = manaRegen
        Object.assign(g, {"firingRate": firingRate, "reloadTime":reloadTime, "shuffle":0, "projectiles": [], "currentQueue": [], "modifierStack": [], "fireCooldown": 0, "maxCooldown": firingRate, "ogdeck": [], "mana": maxMana, "manaRegen": manaRegen})
        this.addObjectToWorld(g)
        return g.id
    }
    
    registerClasses(serializer) {
        serializer.registerClass(Gun)
        serializer.registerClass(Player);
        serializer.registerClass(Projectile);
        // serializer.registerClass(Utility);
        
    }
    destroyProj(projId) {
        if (this.world.objects[projId]) {
            let obj = this.world.objects[projId]
            for (var constraint of this.physicsEngine.world.constraints){
                if (constraint.bodyA == obj.physicsObj || constraint.bodyB == obj.physicsObj){
                    this.physicsEngine.world.removeConstraint(constraint)
                }
            }
            this.trace.trace(() => `bullet[${bulletId}] destroyed`);
            console.log(`${obj.projName} destroyed.`)
            this.removeObjectFromWorld(projId);
        }
    }
    destroyPlayer(player){
        if (player){
            this.world.forEachObject((id, obj) => {
                if (obj instanceof Projectile && obj.ownedPlayer == player.playerId){
                    for (var constraint of this.physicsEngine.world.constraints){
                        if (constraint.bodyA == obj.physicsObj || constraint.bodyB == obj.physicsObj){
                            this.physicsEngine.world.removeConstraint(constraint)
                        }
                    }
                    this.removeObjectFromWorld(id)
                }
                if (obj instanceof Gun && player.gunId == id){
                    this.removeObjectFromWorld(id)
                }
                
            })
            for (var constraint of this.physicsEngine.world.constraints){
                if (constraint.bodyA == player.physicsObj || constraint.bodyB == player.physicsObj){
                    this.physicsEngine.world.removeConstraint(constraint)
                }
            }
            if (this.world.objects[player.id]){
                this.removeObjectFromWorld(player.id);
            }
        }
       
    }
    processInput(inputData, playerId){
        super.processInput(inputData, playerId)
        let player = this.world.queryObject({playerId:playerId, instanceType:Player})
        if (player){
            if (inputData.input == "up"){
                player.physicsObj.applyForceLocal([0, player.speed])
            }
            else if (inputData.input == "down"){
                player.physicsObj.applyForceLocal([0, -player.speed])
            }
            else if (inputData.input == "left"){
                player.physicsObj.applyForceLocal([-player.speed, 0])
            }
            else if (inputData.input == 'right'){
                player.physicsObj.applyForceLocal([player.speed, 0])
            }
            else if (inputData.input == 'space'){
                // let FIRING_TIME = 30
               
                // let gun = this.world.objects[player.gunId]
                
                // if (gun && gun.fireCooldown <= 0){
                // console.log(`PLAYER CANFIRE: ${gun.fireCooldown}`)
                //player.fireCooldown = FIRING_TIME
                // let resetFire = function(player){
                //     player.canFire = 1
                // }
                //this.timer.add(FIRING_TIME, resetFire, this, [player])
                let playerMouse = this.mousePos[playerId]
                //console.log(playerMouse)
                playerMouse = Utility.convertCoords(playerMouse[0], playerMouse[1], playerId, this)
                // console.log(playerMouse)
                let pMouse = new TwoVector(playerMouse[0], playerMouse[1])
                this.emit('fire', playerId, pMouse);
                    //console.log(player)
                    
                // }
                
            }
            else if (inputData.input.includes('mouse')){
                //console.log('AAAAA')
                let pos = inputData.input.split('mouse')[1].split(',')
                for (var i = 0; i < pos.length; i++) pos[i] = parseInt(pos[i]);
                //console.log(pos)
                this.mousePos[playerId] = [...pos]
            }
            else if (inputData.input.includes('canvas')){
                let arr = inputData.input.split('canvas')[1].split(',')
                for (var i = 0; i < arr.length; i++) arr[i] = parseFloat(arr[i]);
                this.playerCanvas[playerId] = [...arr]
            }
            else if (inputData.input.includes('ammo')){
                let arr = JSON.parse(inputData.input.split('ammo')[1])
                let gun = this.world.objects[player.gunId]
                if (gun.projectiles.length == 0){
                    gun.projectiles = [...arr]
                }
                
            }
            else if (!Number.isNaN(inputData.input)){
                let num = parseInt(inputData.input) - 1
                player.gunId = player.guns[num % player.guns.length]
            }

            player.refreshFromPhysics();
        }
    }
}
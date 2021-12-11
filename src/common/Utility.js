import Player from "./Player"
import Projectile from "./Projectile"
import {TwoVector} from "lance-gg"
export default class Utility {
    static sprite(img, idx, spritew, spriteh){
        let w = parseInt(Math.round(img.width/spritew))
        let h = parseInt(Math.round(img.height/spriteh))
        let idxw = (idx % w)*spritew
        let idxh = (Math.floor(idx / w))*spriteh   
        //console.log(`w: ${(idx % w)}, h: ${idxh}`) 
        return [idxw, idxh]
    }

    static spriteCallback(imageFile, rate, frames, spritew, spriteh, highlight){
        return function(position, velocity, ctx, size, t, gameEngine, proj, dt){
            console.log(`FRAMES: ${proj.frame}, ${proj.frameTime}`)
            console.log(`POSITION: ${position}, VELOCITY: ${velocity}`)
            //console.log(t)
            let img = new Image()
            img.src = imageFile
            img.crossOrigin = true
            let [sx, sy] = Utility.sprite(img, proj.frame, spritew, spriteh)
            proj.frameTime += dt
            if (proj.frameTime >= rate){
                proj.frameTime -= rate
                proj.frame = (proj.frame + 1) % frames
            }
            let dir = new TwoVector(velocity[0], velocity[1])
            let angle = Math.acos(velocity[0]/dir.length())
            //console.log(`ANGLE: ${angle}`)
            if (velocity[1] < 0){
                angle = 2*Math.PI - angle
            }
            ctx.save();
            ctx.translate(position[0],position[1]);
            ctx.rotate(angle)
            
            let SCALING = size*2/Math.max(spritew, spriteh)
            let newW = spritew*SCALING
            let newH = spriteh*SCALING
            
            ctx.drawImage(img, sx, sy, spritew, spriteh, -newW/2, -newH/2, newW, newH)
            if (gameEngine.playerId == proj.ownedPlayer && highlight){
                ctx.globalCompositeOperation = 'source-atop'
                ctx.beginPath()
                ctx.fillStyle = highlight
                ctx.fillRect(-newW/2, -newH/2, newW, newH)
                ctx.closePath()
            }
            ctx.restore()
            ctx.globalCompositeOperation = 'source-over'
        }
    }


    static laserCallback(imageFile, rate, frames, spritew, spriteh, highlight){
        return function(position, velocity, ctx, size, t, gameEngine, proj, dt){
            console.log(`FRAMES: ${proj.frame}, ${proj.frameTime}`)
            console.log(`POSITION: ${position}, VELOCITY: ${velocity}`)
            //console.log(t)
            let img = new Image()
            img.src = imageFile
            img.crossOrigin = true
            let [sx, sy] = Utility.sprite(img, proj.frame, spritew, spriteh)
            proj.frameTime += dt
            if (proj.frameTime >= rate){
                proj.frameTime -= rate
                proj.frame = (proj.frame + 1) % frames
            }
            let dir = new TwoVector(velocity[0], velocity[1])
            let angle = Math.acos(velocity[0]/dir.length())
            //console.log(`ANGLE: ${angle}`)
            if (velocity[1] < 0){
                angle = 2*Math.PI - angle
            }
            ctx.save();
            ctx.translate(position[0],position[1]);
            ctx.rotate(angle - Math.PI)
            let dist = new TwoVector(...proj.hitpoint).subtract(new TwoVector(...position)).length()
            console.log(`HIT DISTANCE ${dist}`)
            // let SCALING = size*2/spritew
            let spritewN = Math.min(spritew, Math.round(spritew*dist/size/2))
            console.log(`NEW SPRITEW ${spritewN}`)
            let SCALING = size*2/spritew
            let newW = dist
            let newH = spriteh*SCALING
            
            ctx.drawImage(img, sx, sy, spritewN, spriteh, 0, -newH/2, newW, newH)
            if (gameEngine.playerId == proj.ownedPlayer && highlight){
                ctx.globalCompositeOperation = 'source-atop'
                ctx.beginPath()
                ctx.fillStyle = highlight
                ctx.fillRect(-newW/2, -newH/2, newW, newH)
                ctx.closePath()
            }
            ctx.restore()
            ctx.globalCompositeOperation = 'source-over'
        }
    }

    static poolCallback(color){
        return function(position, velocity, ctx, size, t, gameEngine, proj, dt){
            // let img = new Image()
            // img.src = '/sprites/projectiles/pool.png'
            // let spritew = 32; let spriteh = 32;
            // let [sx, sy] = Utility.sprite(img, 1, spritew, spriteh)
            // let SCALING = size*2/spritew
            // let newW = spritew*SCALING
            // let newH = spriteh*SCALING
            ctx.save();
            ctx.translate(position[0],position[1]);
            ctx.beginPath()
            ctx.fillStyle = color
            ctx.arc(0,0,size, 0, 2*Math.PI)
            ctx.fill()
            ctx.closePath()
            // ctx.drawImage(img, sx, sy, spritew, spriteh, -newW/2, -newH/2, newW, newH)
            // ctx.globalCompositeOperation = 'source-atop'
            // ctx.beginPath()
            // ctx.fillStyle = color
            // ctx.fillRect(-newW/2, -newH/2, newW, newH)
            // ctx.closePath()
            ctx.restore()
            ctx.globalCompositeOperation = 'source-over'
        }
    }

    static spriteCallbackNonProj(imageFile, rate, frames, spritew, spriteh){
        return function(position, ctx, size, t, gameEngine){
            //console.log(t)
            console.log('AAAA')
            let img = new Image()
            img.src = imageFile
            img.crossOrigin = true
            let [sx, sy] = Utility.sprite(img, parseInt(t/rate) % frames, spritew, spriteh)
            // proj.frameTime += dt
            // if (proj.frameTime >= rate){
            //     proj.frameTime -= rate
            //     proj.frame = (proj.frame + 1) % frames
            // }
            // let dir = new TwoVector(velocity[0], velocity[1])
            // let angle = Math.acos(velocity[0]/dir.length())
            //console.log(`ANGLE: ${angle}`)
            // if (velocity[1] < 0){
            //     angle = 2*Math.PI - angle
            // }
            ctx.save();
            ctx.translate(position[0],position[1]);
            let SCALING = size*2/spritew
            let newW = spritew*SCALING
            let newH = spriteh*SCALING
            
            ctx.drawImage(img, sx, sy, spritew, spriteh, -newW/2, -newH/2, newW, newH)
            ctx.restore()
            ctx.globalCompositeOperation = 'source-over'
        }
    }

    static effects = {
        'fire': 
        { 
        onTick:
            function(player, gameEngine){
                if (player.effects.includes('oil')){
                    gameEngine.damagePlayer(player, 1)
                    //player.health -= 0.5
                }
                else{
                    gameEngine.damagePlayer(player, 0.5)
                    //player.health -= 0.25
                }
                if (player.health <= 0){
                    gameEngine.destroyPlayer(player)
                }
            }},
        'freeze': 
        {onApply:
            function(player, gameEngine, duration){
                // player.effects.push('freeze')
                // player.effectsDuration.push(duration)
                player.speed *= 0.5
            },  
        onEnd:
            function(player, gameEngine){
                player.speed /= 0.5
            }},
        'gravity':
        {
        onTick:
            function(player, gameEngine){
                player.physicsObj.applyForceLocal([0, -player.speed])
            }
        },
        'oil':{
            onApply:
                function(player, gameEngine, duration){
                    player.physicsObj.damping -= 0.8
                },
            onEnd:
                function(player, gameEngine){
                    player.physicsObj.damping += 0.8
                }
        },
        'electric':{
            onApply:
                function(player, gameEngine, duration){
                    // player.gunId = -1
                    player.speed = 0
                    player.shield /= 2
                    player.maxShield /= 2
                },
            
            onEnd:
                function(player, gameEngine){
                    // player.gunId = player.guns[0]
                    player.speed = gameEngine.playerSpeed
                    player.shield *= 2
                    player.maxShield *= 2
                },
            draw: Utility.spriteCallbackNonProj('./sprites/effects/electricdraw.png', 50,7,32,32)
        },
        'acid':{
            onTick:
                function(player, gameEngine){
                    gameEngine.damagePlayer(player, 1)
                    if (player.health <= 0){
                        gameEngine.destroyPlayer(player)
                    }
                }
        },
        'confuse':{
            onApply: 
                function(player, gameEngine, duration){
                    player.speed *= -1
                }
            ,
            onEnd: 
                function(player, gameEngine){
                    player.speed *= -1
                }
        }

    }

    static closestPlayer(position, gameEngine, exclude = []){
        let players = gameEngine.world.queryObjects({instanceType:Player})
        players.sort(function cmp (e1, e2){
            let pDist = function(position, e){
                return Math.hypot(e.physicsObj.position[0] - position[0], e.physicsObj.position[1] - position[1])
            }
            return pDist(position, e2) - pDist(position, e1)
        })
        let closest = players.shift()
        while(exclude.includes(closest.playerId) && players.length > 0){
            closest = players.shift()
        }
        if (!closest || exclude.includes(closest.playerId)){
            return null
        }
        return closest
    }

    static movementPrediction(projPosition, projVel, enemy){
        let alpha = 1 - enemy.physicsObj.damping
        let accel = enemy.physicsObj.force.map(function(e){
            return e/enemy.physicsObj.mass
        })
        console.log(`ACCELERATION: ${accel}`)
        let terminal_velocity = accel.map(function(e){
            return -e/Math.log(alpha)
        })
        let value1 = enemy.physicsObj.velocity.map(function(e){
            return e/Math.log(alpha)
        })
        let value2 = terminal_velocity.map(function(e){
            return e/Math.log(alpha)
        })

        let positionAtT = function(t){
            let arr = [0,0]
            for (let i = 0; i < 2; i++){
                let temp = (value1[i] - value2[i])*Math.pow(alpha, t) + terminal_velocity[i]*t + enemy.physicsObj.position[i] + value2[i] - value1[i]
                arr[i] = temp
            }
            return arr
        }
        console.log(`VELOCITY: ${projVel}`)
        let rootFunction = function(t){
            let val = Math.pow(projVel*t, 2)
            for (let i = 0; i < 2; i++){
                let temp = (value1[i] - value2[i])*Math.pow(alpha, t) + terminal_velocity[i]*t + enemy.physicsObj.position[i] - projPosition[i] + value2[i] - value1[i]
                val -= Math.pow(temp, 2)
            }
            return val
        }
        //rootfunction at 0 is always < 0, just need to find positive value
        let dt = 0.1
        let upper = 0
        let upperBound = 2
        for (let i = 0; i < upperBound; i += dt){
            if (rootFunction(i) > 0){
                upper = i
                break
            }
        }

        let lower = 0
        let limit = 0.001
        console.log(`UPPER: ${upper}`)
        while(upper != lower){
            let mid = (upper+lower)/2
            if (Math.abs(rootFunction(mid)) < limit){
                break
            }
            if (rootFunction(mid) > 0){
                upper = mid
            } 
            else{
                lower = mid
            }
        }


        console.log(`BEST ROOT: ${rootFunction((upper+lower)/2)}`)
        // console.log(`PREDICT POSITION TEST: ${positionAtT(0)} ${enemy.physicsObj.position}`)
        return new TwoVector(...positionAtT((upper + lower)/2))
    }

    static projIntersecting(proj1, proj2){
        let dir = proj2.position.clone().subtract(proj1.position.clone())
        let dist = dir.length()
        let radius1 = proj1.physicsObj.shapes[0].radius
        let radius2 = proj2.physicsObj.shapes[0].radius
        return dist < radius1 + radius2 && proj1.id != proj2.id
    }

    static callbacks = {
        'normal':function (destroy){
            return function(player, gameEngine, proj, damage, projProps){
                gameEngine.damagePlayer(player, projProps.damage)
                //player.health -= damage
                if (destroy){
                    gameEngine.destroyProj(proj.id)
                }
                if (player.health <= 0){
                    gameEngine.destroyPlayer(player)
                }
            }
        },
        'explosion':function(radius, effect_applied){
            return function(player, gameEngine, proj, damage, projProps){
                let pos = new TwoVector(proj.physicsObj.position[0], proj.physicsObj.position[1])
                gameEngine.world.forEachObject((id, obj) => {
                    if (obj instanceof Player){
                        if (new TwoVector(obj.physicsObj.position[0],obj.physicsObj.position[1]).subtract(pos).length() < radius && obj.playerId != proj.ownedPlayer){
                            //obj.health -= damage
                            effect_applied(obj, gameEngine, proj, damage, projProps)
                        }
                        if (obj.health <= 0){
                            gameEngine.destroyPlayer(obj)
                        }
                    }
                })
                gameEngine.destroyProj(proj.id)
            }
        },
        'effectApplier':function(effect, noDestroy){
            return function(player, gameEngine, proj, damage, projProps){
                if (!player.effects.includes(effect)){
                    player.effects.push(effect)
                    player.effectsDuration.push(projProps.duration)
                    if (Utility.effects[effect].onApply){
                        Utility.effects[effect].onApply(player, gameEngine)
                    }
                    
                }
                else{
                    let i = player.effects.indexOf(effect)
                    player.effectsDuration[i] = projProps.duration
                }
                gameEngine.damagePlayer(player, projProps.damage)
                //player.health -= damage
                if (player.health <= 0){
                    gameEngine.destroyPlayer(player)
                }
                if (!noDestroy){
                    gameEngine.destroyProj(proj.id)
                }
            }
        },
        'stick':function(){
            return function(player, gameEngine, proj, damage, projProps){
                // var constraint = new gameEngine.physicsEngine.p2.DistanceConstraint(player.physicsObj, proj.physicsObj, {distance:gameEngine.playerRadius})
                var constraint = new gameEngine.physicsEngine.p2.LockConstraint(player.physicsObj, proj.physicsObj)

                gameEngine.physicsEngine.world.addConstraint(constraint)
            }
        },
        'homing':function(){
            return function(player, gameEngine, proj){

                let closest = Utility.closestPlayer(proj.physicsObj.position, gameEngine, [player.playerId])
                if (!closest){
                    return
                }
                let cPos = new TwoVector(...closest.physicsObj.position)
                //console.log(proj.physicsObj.position)
                let pPos = new TwoVector(...proj.physicsObj.position)
                let dir = cPos.clone().subtract(pPos)

                dir.normalize()
                dir.multiplyScalar(Math.hypot(proj.physicsObj.velocity[0], proj.physicsObj.velocity[1]))
                let pVel = new TwoVector(...proj.physicsObj.velocity)
                //let oldSpeed = pVel.length()
                let bend = dir.clone().subtract(pVel)
                bend.normalize()
                bend.multiplyScalar(30)

                proj.physicsObj.applyForceLocal([bend.x, bend.y])

                pVel = new TwoVector(...proj.physicsObj.velocity)
                if (pVel.length() < Utility.projectiles[proj.projName].velocity){
                    let dirV = pVel.clone().normalize().multiplyScalar(60)
                    proj.physicsObj.applyForceLocal([dirV.x, dirV.y])
                }
            }
        },
        'followMouse':function(){
            return function(player, gameEngine, proj){

                if (!gameEngine.mousePos[player.playerId]){
                    return
                }
                let mPos = gameEngine.mousePos[player.playerId]
                mPos = Utility.convertCoords(mPos[0], mPos[1], player.playerId, gameEngine)
                let cPos = new TwoVector(...mPos)
                //console.log(proj.physicsObj.position)
                let pPos = new TwoVector(...proj.physicsObj.position)
                let dir = cPos.clone().subtract(pPos)
                // if (Number.isNaN(dir.x) || Number.isNaN(dir.y)){
                //     return
                // }
                //console.log(dir)
                dir.normalize()
                let pVel = new TwoVector(...proj.physicsObj.velocity)
                dir.multiplyScalar(pVel.length())
                
                //let oldSpeed = pVel.length()
                let bend = dir.clone().subtract(pVel)
                bend.normalize()
                bend.multiplyScalar(50)
                // //console.log(oldSpeed)
                // pVel.add(bend)
                // pVel.normalize()
                // pVel.multiplyScalar(oldSpeed)
                //proj.physicsObj.velocity = [pVel.x, pVel.y]
                
                proj.physicsObj.applyForceLocal([bend.x, bend.y])
                pVel = new TwoVector(...proj.physicsObj.velocity)

                if (pVel.length() < Utility.projectiles[proj.projName].velocity){
                    let dirV = pVel.clone().normalize().multiplyScalar(50)
                    proj.physicsObj.applyForceLocal([dirV.x, dirV.y])
                }

               
            }
        },
        'addMod':function(newMod){
            return function(player, gameEngine, proj, damage){
                proj.override.push(newMod)
                proj.frame = 0
                proj.frameTime = 0
                let projProps = Utility.mergeMany(proj.projName, proj.override)
                console.log(`NEW SIZE ${projProps.size}`)
                if(projProps.onCreate){
                    projProps.onCreate(gameEngine, proj)
                }
                if (projProps.lifetime){
                    if (projProps.onExpire){
                        gameEngine.timer.add(projProps.lifetime, projProps.onExpire, null, [gameEngine, proj, projProps.damage, projProps])
                    }
                    else{
                        gameEngine.timer.add(projProps.lifetime, gameEngine.destroyProj, gameEngine, [proj.id])
                    }
                }
                proj.physicsObj.mass = projProps.mass
                proj.physicsObj.damping = projProps.damping
                
                proj.physicsObj.shapes[0].collisionResponse = (projProps.collisionResponse == 1)
                console.log(proj.physicsObj.shapes[0].collisionResponse)
                proj.physicsObj.shapes[0].radius = projProps.hitbox
                let newVel = new TwoVector(...proj.physicsObj.velocity)
                newVel.multiplyScalar(projProps.velocity/newVel.length())
                proj.physicsObj.velocity = [newVel.x, newVel.y]
            }
        },
        'teleport':function(){
            return function(player, gameEngine, proj, damage){
                if (proj){
                    player.position.x = proj.position.x
                    player.position.y = proj.position.y
                    player.refreshToPhysics()
                }

            }
        },
        'attractProj':
        function(position, gameEngine, strength, banned){
            gameEngine.world.forEachObject((id, obj) => {
                if (obj instanceof Projectile){ 
                    if (!obj.projName.includes(banned)){
                        
                        // console.log('POSITIONS ---- ')
                        // console.log(obj.position)
                        // console.log(position)
                        // console.log('---------')
                        let dir = position.clone().subtract(obj.position.clone())
                        // console.log(dir)
                        // console.log('---------')
                        let dist = dir.length()
                        let upperLimit = 1000
                        if (dist < 0.001){
                            dir.multiplyScalar(0)
                        }
                        else{
                            dir.normalize()
                            dir.multiplyScalar(Math.min(upperLimit, strength/Math.pow(dist, 2)))
                        }
                        
                        dir = [dir.x, dir.y]
                        // console.log(`DIRECTION: ${dir}`)
                        obj.physicsObj.applyForceLocal(dir)
                    }
                }
            })
        },
        'destroyIntersecting':
        function(proj, gameEngine){
            gameEngine.world.forEachObject((id, obj) => {
                if (obj instanceof Projectile){
                    if (Utility.projIntersecting(obj, proj)){
                        console.log('INTERSECTING')
                        gameEngine.destroyProj(id)
                    }
                }
            })
        }
        
    }

    static modifierOverrides = {
        'default':{
            size: {newProp:0.2, replaceMethod:'softReplace'}, 
            hitbox: {newProp:0.21, replaceMethod:'softReplace'}, 
            velocity: {newProp:3, replaceMethod:'softReplace'}, 
            damping: {newProp:0, replaceMethod:'softReplace'},
            damage: {newProp:10, replaceMethod:'softReplace'},
            spread: {newProp:0.1, replaceMethod:'softReplace'}, 
            cooldown: {newProp:0, replaceMethod:'softReplace'},
            lifetime: {newProp:100, replaceMethod:'softReplace'},
            mass: {newProp: 5, replaceMethod:'softReplace'},
            duration: {newProp: 60, replaceMethod: 'softReplace'},
            collisionResponse: {newProp: 1, replaceMethod: 'softReplace'},
            mana: {newProp: 20, replaceMethod: 'softReplace'}
        },
        'homing': {
            onTick:{newProp:this.callbacks['homing'](),replaceMethod:'replace'}
        },
        'followMouse':{ 
            onTick:{newProp:this.callbacks['followMouse'](), replaceMethod:'replace'},
            draw:{newProp:
                function(position, velocity, ctx, size, t, gameEngine, proj, dt){
                    console.log('AAA')
                    if (gameEngine.playerId == proj.ownedPlayer){
                        let mousePos = gameEngine.mousePos[proj.ownedPlayer]
                        mousePos = Utility.convertCoords(mousePos[0], mousePos[1], proj.ownedPlayer, gameEngine)
                        Utility.spriteCallbackNonProj('/sprites/target.png', 200, 2, 24, 24)(mousePos, ctx, 0.3, t, gameEngine)
                    }
                },replaceMethod:'appendFunction'
            }
        },
        "heavyShot":{
            damage: {newProp:[2, 0], replaceMethod:'linear'},
            mass: {newProp: [2, 0], replaceMethod: 'linear'},
            velocity: {newProp: [0.5, 0], replaceMethod: 'linear'}
        },
        "exploding":{
            draw: {newProp:this.spriteCallback('/sprites/projectiles/explosion2.png', 40, 50, 64, 64, '#ffffff00'), replaceMethod:'replace'},
            lifetime: {newProp:20, replaceMethod:'replace'},
            size: {newProp:1, replaceMethod:'replace'},
            onExpire:{newProp:function(gameEngine, proj, damage, projProps){
                Utility.callbacks['explosion'](1, Utility.callbacks['normal'](false))(null, gameEngine, proj, damage, projProps)
            }, replaceMethod: 'softReplace', otherValue: 'onExplode'}
        },
        "pool":{
            draw: {newProp: this.poolCallback('#9dc10080'), replaceMethod: 'softReplace', otherValue: 'poolDraw'},
            lifetime: {newProp: 200, replaceMethod: 'softReplace', otherValue: 'poolLife'},
            size: {newProp: 0.35, replaceMethod: 'softReplace', otherValue: "poolSize"},
            onTick: {newProp: function(player, gameEngine, proj, projProps){
                gameEngine.world.forEachObject((id, obj) => {
                    if (obj instanceof Player){
                        if (gameEngine.physicsEngine.world.overlapKeeper.bodiesAreOverlapping(obj.physicsObj, proj.physicsObj)){
                            Utility.callbacks['effectApplier']('acid', true)(obj, gameEngine, proj, projProps.damage, projProps)
                        }
                    }
                })
                
            }, replaceMethod:'softReplace', otherValue: 'poolTick'},
            mass: {newProp: 0, replaceMethod: 'replace'},
            collisionResponse: {newProp: 0, replaceMethod: 'replace'},
            onExpire:{newProp: function(gameEngine, proj, damage, projProps){
                gameEngine.world.forEachObject((id, obj) => {
                    if (obj instanceof Player){
                        if (gameEngine.physicsEngine.world.overlapKeeper.bodiesAreOverlapping(obj.physicsObj, proj.physicsObj)){
                            console.log('DOUBLE SPEED')
                            obj.speed *= 2
                        }
                    }
                })
                gameEngine.destroyProj(proj.id)
            }, replaceMethod: 'replace'},
            velocity: {newProp: 0, replaceMethod: 'replace'},
            onCollision: {newProp: function(player, gameEngine, proj, damage, projProps){
                console.log('HALF SPEED')
                player.speed /= 2
            }, replaceMethod: 'softReplace', otherValue: 'poolCollision'},
            onEndCollision: {newProp:function(player, gameEngine, proj, damage, projProps){
                console.log('DOUBLE SPEED')
                player.speed *= 2
            }, replaceMethod: 'softReplace', otherValue: 'poolEndCollision'},
            onCreate: {newProp: function(gameEngine, proj){
                gameEngine.world.forEachObject((id, obj) => {
                    if (obj instanceof Player){
                        if (gameEngine.physicsEngine.world.overlapKeeper.bodiesAreOverlapping(obj.physicsObj, proj.physicsObj)){
                            console.log('HALF SPEED')
                            obj.speed /= 2
                        }
                    }
                })
            }, replaceMethod: 'softReplace', otherValue: 'poolOnCreate'}
        }
    }
    
    static replaceMethods = {
        'replace':function(o, n){
            return n
        },
        'softReplace':function(o, n){
            return o ?? n
        },
        'linear':function(o, n){
            return o*(n[0]) + n[1] // REMEMBER THIS WHEN MAKING MULTIPLICATIVE MODIFIERS
        },
        'prependFunction':function(o, n){
            return function(){
                n(...arguments)
                o(...arguments)
            }
        },
        'appendFunction':function(o, n){
            return function(){
                o(...arguments)
                n(...arguments)
            }
        }
    }

    static projectiles = { //callback on collision, size, hitbox, velocity, damping
        'pellet':{
            onCollision:this.callbacks['normal'](true), 
            velocity:10, 
            draw:this.spriteCallback('/sprites/projectiles/pellet.png', 35, 4, 10, 10, '#ffffff00'), 
            cooldown:-10, 
            mass: 2,
            spread: 0},

        'mine':{
            onCollision:this.callbacks['addMod']('exploding'), 
            size:0.25, 
            hitbox:0.5, 
            velocity:1, 
            damping: 0.9, 
            damage:30, 
            draw:this.spriteCallback('/sprites/projectiles/mine.png', 160, 8, 13, 14, '#00ff0080'), 
            spread:0.5, 
            cooldown:30, 
            lifetime:1000},

        'stickybomb':{
            onCollision:this.callbacks['stick'](), 
            size:0.1, 
            hitbox:0.11,  
            damping:0.5,
            draw:this.spriteCallback('/sprites/projectiles/stickybomb.png', 60, 4, 8, 8, '#ffffff00'), 
            cooldown:30,
            lifetime:500,
            damage:30,
            onExpire: function(gameEngine, proj, damage, projProps){
                console.log(`EXPIRE: ${projProps}`)
                Utility.callbacks['explosion'](1, Utility.callbacks['normal'](false))(null, gameEngine, proj, damage, projProps)
            }},   

        'fireball':{
            onCollision:this.callbacks['addMod']('exploding'), 
            draw:this.spriteCallback('/sprites/projectiles/fireball.png', 35, 4, 25, 25, '#ffffff00'), 
            cooldown:10,
            onExplode: function(gameEngine, proj, damage, projProps){
                Utility.callbacks['explosion'](1, Utility.callbacks['effectApplier']('fire'))(null, gameEngine, proj, damage, projProps)
            }},

        'iceball':{
            onCollision:this.callbacks['effectApplier']('freeze'), 
            draw:this.spriteCallback('/sprites/projectiles/iceball.png', 35, 4, 33, 25, '#ffffff00'), 
            cooldown:10,
            duration:300},

        'gravityball':{
            onCollision:this.callbacks['effectApplier']('gravity'), 
            size:0.1, 
            hitbox:0.11, 
            draw:this.spriteCallback('/sprites/projectiles/gravityball.png', 60, 4, 16, 16, '#ffffff00'),  
            cooldown:10, 
            duration:300},
    
        'rocket':{onCollision:this.callbacks['addMod']('exploding'), 
            size:0.3, 
            hitbox:0.31, 
            damage:20, 
            draw:this.spriteCallback('/sprites/projectiles/rocket.png', 100, 3, 13, 9, '#ffffff00'),  
            cooldown:40, 
            lifetime:0,
            onExplode:
            function(gameEngine, proj, damage, projProps){
                Utility.callbacks['explosion'](1.2, 
                    function(obj, gameEngine, proj, damage, projProps){
                        Utility.callbacks['normal'](false)(obj, gameEngine, proj, damage)
                        Utility.callbacks['effectApplier']('oil')(obj, gameEngine, proj, damage, projProps.duration)
                    })(null, gameEngine, proj, damage, projProps)
            }
           

        },
        'teleport': {
            onCollision:this.callbacks['teleport'](), 
            damage:0, 
            draw: this.spriteCallback('/sprites/projectiles/teleport.png', 90, 4, 10, 10 ,'#ffffff00'), 
            cooldown: 30, 
            lifetime: 30,
            onExpire: function(gameEngine, proj){
                let player = gameEngine.world.queryObject({playerId:proj.ownedPlayer, instanceType: Player})
                Utility.callbacks['teleport']()(player, gameEngine, proj, 0)
                gameEngine.destroyProj(proj.id)
            },
            onBBOX: function(proj, gameEngine){
                let player = gameEngine.world.queryObject({playerId:proj.ownedPlayer, instanceType: Player})
                Utility.callbacks['teleport']()(player, gameEngine, proj, 0)
                gameEngine.destroyProj(proj.id)
            }
            
        
        },
        'electricball':{
            onCollision:this.callbacks['effectApplier']('electric'),
            draw: this.spriteCallback('/sprites/projectiles/electricball.png', 60, 5, 23, 23 ,'#ffffff00'),
            cooldown: 30,
            duration:30
        },
        'acidpool':{
            draw: this.spriteCallback('/sprites/projectiles/acidpool.png', 100, 4, 24, 24, '#ffffff00'),
            cooldown: 30,
            damage: 0,
            lifetime: 30,
            onExpire: function(gameEngine, proj, damage, projProps){
                Utility.callbacks['addMod']('pool')(null, gameEngine, proj, damage)
            },
            collisionResponse: 0,
            duration: 10
        },
        'turret':{
            draw: this.spriteCallback('/sprites/projectiles/turret.png', 30, 2, 10, 10, '#ffffff80'),
            cooldown: 30,
            damage: 0,
            lifetime: 1000,
            onCreate: function(gameEngine, proj){
                let gunId = gameEngine.addGun(30, 60, proj.ownedPlayer, 50, 1)
                proj.props.push(gunId)
                let player = gameEngine.world.queryObject({playerId: proj.ownedPlayer, instanceType: Player})
                let playerGun = gameEngine.world.objects[player.gunId]
                let gun = gameEngine.world.objects[gunId]
                gun.projectiles = [...playerGun.currentQueue]
            },
            onTick: function(player, gameEngine, proj, projProps){
                let gun = gameEngine.world.objects[proj.props[0]]
                let enemPos = Utility.closestPlayer(proj.physicsObj.position, gameEngine, [player.playerId])
                let response = {queued: []}
                gameEngine.emit('fire', player.playerId, enemPos, gun, proj.physicsObj.position, true, response)
                let firing = response.queued
                console.log(`FIRING: ${firing}`)
                let velocity = 0
                for (var arr of firing){
                    let pP = Utility.mergeMany(arr[0], arr[1])
                    console.log(`PPV: ${pP.velocity} ${arr[0]} ${arr[1]}`)
                    velocity = Math.max(velocity, pP.velocity)
                }
                // console.log(velocity)
                if (enemPos){
                    enemPos = Utility.movementPrediction(proj.physicsObj.position, velocity, enemPos)
                    //enemPos = new TwoVector(...enemPos)
                    gameEngine.emit('fire', player.playerId, enemPos, gun, proj.physicsObj.position)
                }
                if (gun.fireCooldown > 0){
                    gun.fireCooldown--
                }
                else{
                    if (gun.mana < gun.maxMana){
                        gun.mana += gun.manaRegen
                    }
                    
                }
            },
            damping: 0.95,
            size: 0.1,
            onExpire: function(gameEngine, proj){
                gameEngine.removeObjectFromWorld(proj.props[0])
                gameEngine.destroyProj(proj.id)
            },
            mana: 50
        },
        'blackhole':{
            collisionResponse: 0,
            lifetime: 300,
            draw: this.spriteCallback('/sprites/projectiles/blackhole.png', 90, 10, 24, 24, '#ffffff00'),
            damage: 0,
            cooldown: 30,
            onTick: function(player, gameEngine, proj, projProps){
                Utility.callbacks['attractProj'](proj.position, gameEngine, 20, 'blackhole')
                Utility.callbacks['destroyIntersecting'](proj, gameEngine)
            },
            damping: 0.90
        },
        'laser':{
            collisionResponse: 0,
            lifetime: 200,
            draw: this.laserCallback('/sprites/projectiles/laser2.png', 100000000, 1, 270, 8, '#ffffff00'),
            damage: 1,
            onTick: function(player, gameEngine, proj, projProps){
                let pMouse = gameEngine.mousePos[player.playerId]
                pMouse = Utility.convertCoords(pMouse[0], pMouse[1], player.playerId, gameEngine)
                proj.position.x = player.position.x
                proj.position.y = player.position.y
                proj.velocity.x = -pMouse[0] + proj.position.x
                proj.velocity.y = -pMouse[1] + proj.position.y
                // proj.physicsObj.velocity = [-proj.physicsObjy.velocity[0], -proj.physicsObj.velocity[1]]
                proj.hitpoint = [16, 9]
                proj.refreshToPhysics()

                let rayLoc = proj.velocity.clone()
                rayLoc.normalize()
                rayLoc.multiplyScalar(-Math.hypot(16, 9))
                rayLoc.add(player.position)
                let p2 = gameEngine.physicsEngine.p2
                var ray = new p2.Ray({
                    mode: p2.Ray.ALL,
                    from: player.physicsObj.position,
                    to: [rayLoc.x, rayLoc.y],
                    callback: function(result){
                        
                        let hitObj = null
                        let b = result.body
                        gameEngine.world.forEachObject((id, obj) => {
                            if (obj.physicsObj == b && obj instanceof Player && id != player.id){
                                hitObj = obj
                            }
                        })
                        
                        if (hitObj){
                            console.log('HIT')
                            Utility.callbacks['normal'](false)(hitObj, gameEngine, proj, projProps.damage, projProps)
                            let hitpoint = p2.vec2.create()
                            result.getHitPoint(hitpoint, ray)
                            proj.hitpoint = [hitpoint[0], hitpoint[1]]
                            result.stop()
                            
                        }
                        

                    }
                })
                var result = new p2.RaycastResult();
                gameEngine.physicsEngine.world.raycast(result, ray);
                

            },
            size: Math.hypot(16, 9)/2,
            cooldown: 300,
            velocity: 0,
            onBBOX: function(obj, gameEngine){
                console.log(`OBJ: ${obj}`)
            },
            mana: 50
            
        }
    }

    static merge = function(projOld, projNew){
        if (Utility.projectiles[projOld + (projNew ?? '')]){
            return Utility.projectiles[projOld + (projNew ?? '')]
        }
        else{
            let projPropOld = Utility.projectiles[projOld]
            let projPropNew = Utility.modifierOverrides[projNew]
            // let projClone = {...projPropOld}
            // //console.log(projClone)
            // if (projPropNew){
            //     for (var prop of Object.keys(projPropNew)){
            //         console.log(`PROP ${prop}`)
            //         projClone[prop] = Utility.replaceMethods[projPropNew[prop].replaceMethod](projClone[projPropNew[prop].otherValue ?? prop], projPropNew[prop].newProp)
            //     }
            // }
            // console.log(projOld + (projNew ?? ''))
            let projClone = Utility.mergeRaw(projPropOld, projPropNew)
            Utility.projectiles[projOld + (projNew ?? '')] = projClone
            return projClone
        }
        
    }

    static mergeMany = function(projOld, override){
        if (Utility.projectiles[projOld + override.join('')]){
            return Utility.projectiles[projOld + override.join('')]
        }
        else{
            let projProps = Utility.projectiles[projOld]
            let curName = projOld
            for (var i = 0; i < override.length; i++){
                projProps = Utility.merge(curName, override[i])
                curName += override[i]
                // console.log(projProps)
            }
            Utility.projectiles[projOld + override.join('')] = {...projProps}
            return projProps
        }
    }

    static mergeRaw = function(objOld, objNew){
        let objClone = {...objOld}
            //console.log(projClone)
        if (objNew){
            for (var prop of Object.keys(objNew)){
                console.log(`PROP ${prop}`)
                objClone[prop] = Utility.replaceMethods[objNew[prop].replaceMethod](objClone[objNew[prop].otherValue ?? prop], objNew[prop].newProp)
            }
        }
        return objClone
    }

    static projectileNames = Object.keys(this.projectiles)
    
    static true_modifiers = {
        'triple_shot':['-30', '30', 'cast'],
        'double_cast':Array(2).fill('cast'),
        'triple_cast':Array(3).fill('cast')
    }


    static modifiers = ['triple_shot', 'double_cast', 'triple_cast', 'homing', 'followMouse', 'heavyShot']
    
    static convertCoords(x, y, playerId, gameEngine){
        //let canvas = document.getElementsByTagName('canvas')[0]
        if(gameEngine.playerCanvas[playerId]){
            let [w, h, zoom, scaling] = gameEngine.playerCanvas[playerId]
            // console.log(`ZOOM: ${zoom}`)
            // console.log(`SCALING: ${scaling}`)
            let newx = x*scaling - w/2
            let newy = y*scaling - h/2
            
            newx /= zoom
            newy /= -zoom
            //console.log(newx)
            return [newx, newy]
        }
        else{
            return [0,0]
        }
        
    }
    static shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    static shapes = {}

}
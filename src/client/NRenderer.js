import { GameWorld, Renderer, TwoVector } from 'lance-gg';
import Gun from '../common/Gun';
import Utility from '../common/Utility';
import Player from './../common/Player';
import Projectile from './../common/Projectile'
let ctx = null;
let game = null;
let canvas = null;

export default class NRenderer extends Renderer {

    constructor(gameEngine, clientEngine) {
        super(gameEngine, clientEngine);
        game = gameEngine;
        
        // Init canvas
        canvas = document.createElement('canvas');
        canvas.width = window.innerWidth * window.devicePixelRatio;
        
        canvas.height = window.innerHeight * window.devicePixelRatio;
        document.body.appendChild(canvas);
        //console.log(game)
        game.w = canvas.width;
        game.h = canvas.height;
        game.zoom = game.h / game.spaceHeight;
        if (game.w / game.spaceWidth < game.zoom) game.zoom = game.w / game.spaceWidth;
        ctx = canvas.getContext('2d');
        ctx.lineWidth = 2 / game.zoom;
        ctx.strokeStyle = ctx.fillStyle = 'white';

        // remove instructions on first input
        //setTimeout(this.removeInstructions.bind(this), 5000);
    }

    draw(t, dt) {
        super.draw(t, dt);
        //console.log(`DEVICE PX RATIO: ${window.devicePixelRatio}`)
        // Clear the canvas
        ctx.clearRect(0, 0, game.w, game.h);                

        // Transform the canvas
        // Note that we need to flip the y axis since Canvas pixel coordinates
        // goes from top to bottom, while physics does the opposite.
        ctx.save();
        ctx.translate(game.w/2, game.h/2); // Translate to the center
        //console.log(game.w)
        ctx.scale(game.zoom, -game.zoom);  // Zoom in and flip y axis
        
        // Draw all things
        
       
        // game.world.forEachObject((id, obj) => {
        //     if (obj instanceof Projectile){
        //         //console.log(obj)
        //         Utility.projectiles[obj.projName].draw(obj.physicsObj.position, obj.physicsObj.velocity, ctx, Utility.projectiles[obj.projName].size, t, this.gameEngine, obj)
                
        //         //this.drawProj(obj.physicsObj, obj.size);
        //     }
        // if (obj instanceof Player){
        //     this.drawPlayer(obj.physicsObj, obj.health, obj.fireCooldown, obj)
        //     if (obj.playerId == this.gameEngine.playerId){
        //         this.drawDeck(obj)
        //     }
        // };
        // })
        // for (var obj of game.world.queryObjects({instanceType:Projectile})){
        //     let projProps = Utility.merge(obj.projName, obj.override)
        //     projProps.draw(obj.physicsObj.position, obj.physicsObj.velocity, ctx, projProps.size, t, this.gameEngine, obj)
        // }
        
        let thisPlayer = game.world.queryObject({playerId:game.playerId, instanceType:Player})
        if (thisPlayer){
            this.drawArrow(thisPlayer.physicsObj, thisPlayer)
        }
        console.log('DREW ARROW')
        let playerDraw = []
        let projectileDraw = []
        game.world.forEachObject((id, obj) => {
            //console.log(obj.health)
            if (obj instanceof Player){
                playerDraw.push(obj)
            }
            if (obj instanceof Projectile){
                projectileDraw.push(obj)
            }
        });


        for (var obj of projectileDraw){
            // let projProps = Utility.cachedMergers[obj.projName]
            let projProps = Utility.mergeMany(obj.projName, obj.override)
            // console.log(`NAME; ${obj.projName}`)
            // let curName = obj.projName
            // for (var i = 0; i < obj.override.length; i++){
            //     console.log(obj.override[i])
            //     projProps = Utility.merge(curName, obj.override[i])
            //     curName += obj.override[i]
            //     console.log(projProps)
            // }
            console.log(obj.projName)
            projProps.draw(obj.physicsObj.position, obj.physicsObj.velocity, ctx, projProps.size, t, this.gameEngine, obj, dt)
        }
        //console.log('DREW PROJECTILES')
        for (var obj of playerDraw){
            let gun = this.gameEngine.world.objects[obj.gunId]
            if (gun){
                this.drawPlayer(obj.physicsObj, obj.health, gun.fireCooldown, obj, t)
                if (obj.playerId == this.gameEngine.playerId){
                    this.drawDeck(obj)
                }
            }
            else{
                console.log('????')
            }
            
        }

        this.drawBounds();
        // update status and restore
        //console.log(this.gameEngine)
        this.updateStatus();
        ctx.restore();
    }

    drawArrow(body, player){
        let ARROW_OFFSET = this.gameEngine.hpbarheight + this.gameEngine.hpbarpadding + 0.3
        console.log(this.gameEngine.mousePos)
        if (this.gameEngine.mousePos[player.playerId]){
            let playerMouse = this.gameEngine.mousePos[player.playerId]
            playerMouse = Utility.convertCoords(playerMouse[0], playerMouse[1], player.playerId, this.gameEngine)
            playerMouse = new TwoVector(...playerMouse)
            playerMouse.subtract(new TwoVector(...body.position))
            let angle = Math.acos(playerMouse.y/playerMouse.length())
            if (playerMouse.x > 0){
                angle = 2*Math.PI - angle
            }
            ctx.save()
            ctx.translate(body.position[0],body.position[1]);
            ctx.rotate(angle)
            ctx.beginPath();
            let ARROW_WIDTH = (game.playerRadius - 0.07)
            let ARROW_HEIGHT = game.playerRadius
            //let ARROW_ARC = 0.05
            let maxR = ARROW_WIDTH/Math.sqrt(1-Math.pow(ARROW_WIDTH/ARROW_HEIGHT, 2))
            let offsetY = Math.sqrt(Math.pow(maxR, 2)-Math.pow(ARROW_WIDTH, 2))
            ctx.moveTo(-ARROW_WIDTH, ARROW_OFFSET);
            ctx.lineTo(0, ARROW_HEIGHT + ARROW_OFFSET)
            ctx.lineTo(ARROW_WIDTH, ARROW_OFFSET)
            
            ctx.arcTo(0, ARROW_OFFSET + (maxR - offsetY), -ARROW_WIDTH, ARROW_OFFSET, maxR)
            //ctx.arc(0, 0 + ARROW_OFFSET-offsetY, maxR, angle1, Math.PI - angle1)
            ctx.fillStyle = 'green'
            ctx.fill()
            ctx.closePath()
            console.log('ARRROW21')
            
            // let angle1 = Math.acos(ARROW_WIDTH/maxR)

            // ctx.globalCompositeOperation = 'destination-out'

            // ctx.beginPath();
            // ctx.arc(0, 0 + ARROW_OFFSET-offsetY, maxR, angle1, Math.PI - angle1)
            // ctx.fillStyle = 'black'
            // ctx.fill()
            // ctx.closePath()

            // ctx.globalCompositeOperation = 'source-over'
            ctx.restore()

            
        }
    }

    updateStatus() {
        let player = this.gameEngine.world.queryObject({ playerId: this.gameEngine.playerId, instanceType:Player});
        if (!player){
            document.getElementById('gameover').classList.remove('hidden')
        }
        if(player && player.playerId === this.gameEngine.playerId){
            document.getElementById('gameover').classList.add('hidden')
        }
        //
    }

    

    drawPlayer(body, health, cooldown, player, t) {
        let CARD_SIZE = 0.3
        // ctx.beginPath();
        // ctx.arc(body.position[0], body.position[1], game.playerRadius, 0, 2*Math.PI);
        // ctx.fillStyle = 'white'
        // ctx.fill();
        // ctx.closePath();

        ctx.save()
        ctx.scale(1, -1)
        let imgPlayer = new Image()
        imgPlayer.src = '/sprites/player.png'
        
        ctx.drawImage(imgPlayer, body.position[0] - game.playerRadius, -body.position[1] - game.playerRadius, game.playerRadius*2, game.playerRadius*2)
        
        ctx.restore()


        //hp bar
        ctx.beginPath();
        ctx.fillStyle = 'red'
        ctx.fillRect(body.position[0] - game.playerRadius, body.position[1] + game.playerRadius + game.hpbarpadding, 2*game.playerRadius*health/player.maxHealth, game.hpbarheight)
        ctx.closePath();


        //shield bar
        ctx.beginPath();
        ctx.fillStyle = 'blue'
        ctx.fillRect(body.position[0] - game.playerRadius, body.position[1] + game.playerRadius + game.hpbarpadding + game.hpbarheight, 2*game.playerRadius*player.shield/player.maxShield, game.hpbarheight)
        ctx.closePath();

        //shield
        if (player.shield > 0){
            let MIN_OPACITY = 0.4
            if (player.shieldCooldown > 0)  {
                ctx.globalAlpha = (1-(player.shieldCooldown/game.playerShieldCooldown))*(1-MIN_OPACITY) + MIN_OPACITY
            }
            Utility.spriteCallbackNonProj('/sprites/shield.png', 30, 6, 33, 33)(body.position, ctx, game.playerRadius+0.15,t,game)
            ctx.globalAlpha = 1
            
        }

        let gun = game.world.objects[player.gunId]

        //mana
        ctx.beginPath();
        ctx.fillStyle = 'DodgerBlue'
        ctx.fillRect(body.position[0] - game.playerRadius, body.position[1] - game.playerRadius - game.hpbarheight - game.hpbarpadding, 2*game.playerRadius*gun.mana/gun.maxMana, game.hpbarheight)
        ctx.closePath();

        // recharge timer
        // ctx.beginPath();
        // ctx.fillStyle = 'blue'
        // let LENGTH = 2*game.playerRadius*(cooldown/player.maxCooldown)
        // ctx.fillRect(body.position[0] - LENGTH/2, body.position[1] - game.playerRadius - game.hpbarpadding - game.hpbarheight, LENGTH, game.hpbarheight)
        // ctx.closePath()

        //effects
        ctx.save()
        ctx.scale(1, -1)
        //console.log(player.effects)
        let EDGE = CARD_SIZE*player.effects.length/2
        for (var i = 0; i < player.effects.length; i++){
            let img = new Image()
            img.src = '/sprites/effects/' + player.effects[i] + '.png'
            ctx.drawImage(img, body.position[0] - EDGE + i*CARD_SIZE, -body.position[1] - game.playerRadius - game.hpbarpadding - game.hpbarheight-CARD_SIZE, CARD_SIZE, CARD_SIZE)
            if (Utility.effects[player.effects[i]].draw){
                Utility.effects[player.effects[i]].draw([body.position[0], -body.position[1]], ctx, game.playerRadius+0.12, t, game)
            }
        }
        ctx.restore()
        
        
    }
    drawProj(body, size){
        //console.log('PROJ')
        ctx.beginPath();
        ctx.arc(body.position[0], body.position[1], size, 0, 2*Math.PI);
        //console.log(size)
        //  console.log(`${body.position[0]} ${body.position[1]}`)
        ctx.fillStyle = 'white'
        ctx.fill();
        ctx.closePath();
    }
    drawBounds() {
        ctx.beginPath();
        ctx.moveTo(-game.spaceWidth/2, -game.spaceHeight/2);
        ctx.lineTo(-game.spaceWidth/2, game.spaceHeight/2);
        ctx.lineTo( game.spaceWidth/2, game.spaceHeight/2);
        ctx.lineTo( game.spaceWidth/2, -game.spaceHeight/2);
        ctx.lineTo(-game.spaceWidth/2, -game.spaceHeight/2);
        ctx.closePath();
        ctx.stroke();
    }

    drawDeck(player){
        let DECK_SIZE = 0.6
        let ARROW_SIZE = 0.2
        let ARROW_LEN = 0.3
        let PADDING = 0.07
        let BAR_PADDING = 0.05
        let DIFF = (DECK_SIZE-ARROW_LEN)/2
        //console.log(this.gameEngine.world.objects)
        let gun = this.gameEngine.world.objects[player.gunId]
        let currentIndex = gun.currentQueue.length
        
        if (gun){
            let deck = gun.ogdeck
            let BAR_WIDTH = gun.projectiles.length*DECK_SIZE + BAR_PADDING
            ctx.beginPath()
            ctx.fillStyle = '#455A64'
            ctx.fillRect(game.spaceWidth/2 - BAR_WIDTH, game.spaceHeight/2 - DECK_SIZE, BAR_WIDTH*gun.fireCooldown/gun.maxCooldown, DECK_SIZE)
            ctx.closePath()
            if (deck.length != 0){
                ctx.save()
                ctx.scale(1, -1)
                for (var i = 0; i < deck.length; i++){
                    let img = new Image()
                    img.src = '/sprites/cards/' + deck[i] + '.png'
                    let bgimg = new Image()
                    bgimg.src = '/sprites/bgcard.png'
                    ctx.drawImage(bgimg, game.spaceWidth/2-DECK_SIZE*((deck.length-i-1)+1), -game.spaceHeight/2, DECK_SIZE, DECK_SIZE)
                    ctx.drawImage(img, game.spaceWidth/2-DECK_SIZE*((deck.length-i-1)+1)+DECK_SIZE/10, -game.spaceHeight/2+DECK_SIZE/10, DECK_SIZE*4/5, DECK_SIZE*4/5)
                }
                
                ctx.restore()
                //console.log(`INDEX ${currentIndex}`)
                let position = [game.spaceWidth/2-DECK_SIZE*(currentIndex), game.spaceHeight/2-DECK_SIZE-ARROW_SIZE-PADDING]
                ctx.beginPath()
                ctx.moveTo(position[0] + DIFF, position[1])
                ctx.lineTo(position[0] + DECK_SIZE-DIFF, position[1])
                ctx.lineTo(position[0] + DECK_SIZE/2, position[1] + ARROW_SIZE)
                ctx.fillStyle = 'white'
                ctx.fill();
                ctx.closePath()
            }
        }
        else{
            console.log('what the fuck')
        }
        
    }

}

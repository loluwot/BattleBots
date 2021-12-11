import { ClientEngine, KeyboardControls } from 'lance-gg';
import NRenderer from './NRenderer';

export default class NClientEngine extends ClientEngine{
    constructor(gameEngine, options) {
        super(gameEngine, options, NRenderer);
        //document.querySelector('#instructions').classList.remove('hidden');
        this.controls = new KeyboardControls(this);
        this.controls.bindKey(['up', 'w'], 'up', { repeat: true } );
        this.controls.bindKey(['down', 's'], 'down', { repeat: true } );
        this.controls.bindKey(['left', 'a'], 'left', { repeat: true } );
        this.controls.bindKey(['right', 'd'], 'right', { repeat: true } );
        this.controls.bindKey('space', 'space', {repeat: true});
        // this.canvasSent = false
        this.controls.bindKey('1', '1');
        this.controls.bindKey('2', '2');
        this.controls.bindKey('3', '3');
        this.controls.bindKey('4', '4');
        function getCookie(cname) {
            let name = cname + "=";
            let ca = document.cookie.split(';');
            for(let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) == ' ') {
                c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    //console.log(c.substring(name.length, c.length))
                    return JSON.parse(c.substring(name.length, c.length));
                }
            }
            return "";
        }
        
        // let inputOptions = Object.assign({
        //     movement: true
        // }, parameters || {});
        // document.getElementsByTagName('canvas')[0].addEventListener('load', (joinTime, playerDesc) => {
        //     // console.log('PLAYER JOINED')
        
        //     console.log('onload')
        //     this.sendInput(`ammo${JSON.stringify(getCookie('ammo'))}`)
        //     //let rect = event.target.getBoundingClientRect()
        //     //console.log(rect.left)
        //     //console.log(rect.top)
           
        //     // this.sendInput(`canvas${gameEngine.w},${gameEngine.h},${gameEngine.zoom},${window.devicePixelRatio}`)
        //     // //this.sendInput(`mouse${x},${y}`)
        //     // //this.sendInput(`mouseY${y}`)
        //     // this.gameEngine.mousePos[playerDesc.playerId] = [0,0]
        //     // //console.log(this.gameEngine.mousePos)
        //     // this.gameEngine.playerCanvas[playerDesc.playerId] = [gameEngine.w, gameEngine.h, gameEngine.zoom, window.devicePixelRatio]
        // })
        
        

        document.getElementsByTagName('canvas')[0].addEventListener('mousemove', (event) => {
            //console.log(event.clientX)
            let rect = event.target.getBoundingClientRect()
            //console.log(rect.left)
            //console.log(rect.top)
            let x = event.clientX - rect.left
            let y = event.clientY - rect.top
            this.sendInput(`canvas${gameEngine.w},${gameEngine.h},${gameEngine.zoom},${window.devicePixelRatio}`)
            this.sendInput(`mouse${x},${y}`)
            this.sendInput(`ammo${JSON.stringify(getCookie('ammo'))}`)
            //this.sendInput(`mouseY${y}`)
            this.gameEngine.mousePos[this.gameEngine.playerId] = [x, y]
            this.gameEngine.playerCanvas[this.gameEngine.playerId] = [gameEngine.w, gameEngine.h, gameEngine.zoom, window.devicePixelRatio]
        });

    }
    

    preStep() {
        // if (this.socket && !this.canvasSent){
        //     this.socket.emit('canvas', [gameEngine.w, gameEngine.h, gameEngine.zoom, window.devicePixelRatio], this.gameEngine.playerId)
        //     this.canvasSent = true
        // }
        this.actions.forEach((action) => this.sendInput(action, { movement: true }));
        this.actions = new Set();
    }
}
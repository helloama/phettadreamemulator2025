import Component from '../../Component'

export default class UIManager extends Component{
    constructor(){
        super();
        this.name = 'UIManager';
    }

    SetAmmo(mag, rest){
        const currentAmmo = document.getElementById("current_ammo");
        const maxAmmo = document.getElementById("max_ammo");
        if(currentAmmo) currentAmmo.innerText = mag;
        if(maxAmmo) maxAmmo.innerText = rest;
    }

    SetHealth(health){
        const healthProgress = document.getElementById("health_progress");
        if(healthProgress) healthProgress.style.width = `${health}%`;
    }

    SetTimer(minutes, seconds){
        const timerElement = document.getElementById("dream_timer");
        if (timerElement) {
            timerElement.innerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    Initialize(){
        document.getElementById("game_hud").style.visibility = 'visible';
    }
}
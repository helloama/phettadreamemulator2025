import Component from "../../Component";

export default class PlayerHealth extends Component{
    constructor(){
        super();

        this.health = 100;
        this.maxHealth = 100;
        this.isDead = false;
        this.deathTimer = 0;
        this.deathDuration = 3.0; // 3 seconds death sequence
    }

    TakeHit = e =>{
        if(this.isDead) return; // Can't take damage when dead
        
        this.health = Math.max(0, this.health - 10);
        this.uimanager.SetHealth(this.health);
        
        // Check for death
        if(this.health <= 0 && !this.isDead){
            this.OnDeath();
        }
    }

    OnDeath(){
        if(this.isDead) return;
        
        this.isDead = true;
        console.log('[PlayerHealth] Player died!');
        
        // Broadcast death event to dream session
        this.Broadcast({topic: 'player.died', cause: 'health'});
        
        // Start death sequence
        this.deathTimer = 0;
        this.Broadcast({topic: 'fade.out', speed: 0.5}); // Quick fade to black
        
        // Show death message
        this.ShowDeathMessage();
    }

    ShowDeathMessage(){
        // Create death message overlay
        const deathOverlay = document.createElement('div');
        deathOverlay.id = 'death_overlay';
        deathOverlay.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #ff0000;
            font-size: 3em;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            z-index: 10000;
            opacity: 0;
            transition: opacity 1s ease-in-out;
            text-align: center;
        `;
        deathOverlay.innerHTML = `
            <div>DREAM OVER</div>
            <div style="font-size: 0.5em; margin-top: 20px; color: #ff93a6;">You have died in the dream</div>
        `;
        
        document.body.appendChild(deathOverlay);
        
        // Fade in death message
        setTimeout(() => {
            deathOverlay.style.opacity = '1';
        }, 500);
        
        // Fade out and remove after delay
        setTimeout(() => {
            deathOverlay.style.opacity = '0';
            setTimeout(() => {
                if(deathOverlay.parentNode) {
                    deathOverlay.parentNode.removeChild(deathOverlay);
                }
            }, 1000);
        }, 3000);
    }

    Update(deltaTime){
        if(this.isDead){
            this.deathTimer += deltaTime;
            
            // After death sequence, trigger dream session end
            if(this.deathTimer >= this.deathDuration){
                this.Broadcast({topic: 'fade.complete', type: 'death'});
                this.isDead = false; // Reset for next session
                this.deathTimer = 0;
            }
        }
    }

    Initialize(){
        this.uimanager = this.FindEntity("UIManager").GetComponent("UIManager");
        this.parent.RegisterEventHandler(this.TakeHit, "hit");
        this.uimanager.SetHealth(this.health);
        
        // Listen for new session start to reset health
        this.parent.RegisterEventHandler(this.OnNewSession, 'session.new');
    }
    
    OnNewSession = () => {
        // Reset health for new session
        this.health = this.maxHealth;
        this.isDead = false;
        this.deathTimer = 0;
        this.uimanager.SetHealth(this.health);
        
        // Reset player position to spawn point
        const playerPhysics = this.GetComponent('PlayerPhysics');
        if (playerPhysics) {
            playerPhysics.ResetPosition(0, 2, 0); // Spawn at origin with some height
        }
        
        console.log('[PlayerHealth] Health and position reset for new session');
    }
}
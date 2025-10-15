import Component from '../../Component'

export default class MenuUI extends Component{
    constructor(){
        super();
        this.name = 'MenuUI';
        this.day = 1;
        this.lastMood = null;
        this.menuEl = null;
        this.dayEl = null;
        this.graphBtn = null;
        this.dreamChartBtn = null;
        this.chart = null; // DreamChartUI component reference
        // Removed mode tracking - we want seamless dream FPS experience
    }

    Initialize(){
        this.menuEl = document.getElementById('menu');
        this.dayEl = document.getElementById('day_counter');
        this.graphBtn = document.getElementById('graph_button');
        this.dreamChartBtn = document.getElementById('dream_chart_button');
        this.modeToggleBtn = document.getElementById('mode_toggle_button');
        this.chart = this.GetComponent('DreamChartUI');

        this.LoadDay();
        this.UpdateDayLabel();

        if(this.graphBtn){
            this.graphBtn.addEventListener('click', this.OnGraphClick);
        }
        
        if(this.dreamChartBtn){
            this.dreamChartBtn.addEventListener('click', this.OnDreamChartClick);
        }
        
        if(this.modeToggleBtn){
            this.modeToggleBtn.addEventListener('click', this.OnModeToggleClick);
        }
        
        // Show menu by default at boot (entry.js may also show it)
        this.ShowMenu(true);

        // Listen for dream end to show chart
        this.parent.RegisterEventHandler(this.OnDreamEnd, 'dream.end');

        // E key to open dream chart during gameplay
        document.addEventListener('keydown', this.OnKeyDown);
    }

    OnKeyDown = (event) => {
        if(event.code === 'KeyE' || event.key === 'e' || event.key === 'E'){
            this.ToggleDreamChart();
        }
        // Removed T key mode switching - we want seamless dream FPS experience
    }

    OnDreamChartClick = () => {
        this.ToggleDreamChart();
    }

    OnModeToggleClick = () => {
        this.ToggleGameMode();
    }

    ToggleDreamChart() {
        // Toggle between chart and gameplay
        if(this.chart && this.chart.isVisible){
            this.chart.Show(false);
        } else {
            this.OnGraphClick();
        }
    }

    // Removed ToggleGameMode - we want seamless dream FPS experience

    StartNewSession() {
        // Hide menu and start new session
        this.ShowMenu(false);
        
        // Reset dream session
        const dreamManager = this.FindEntity('DreamManager');
        if(dreamManager) {
            const dreamSession = dreamManager.GetComponent('DreamSession');
            if(dreamSession) {
                dreamSession.timeRemaining = dreamSession.maxDuration;
                dreamSession.isActive = true;
                dreamSession.hasEnded = false;
                dreamSession.sessionEndTimer = 0;
            }
        }
    }

    ShowMenu(visible){
        if(this.menuEl){
            this.menuEl.style.visibility = visible?'visible':'hidden';
        }
    }

    LoadDay(){
        try{
            const v = localStorage.getItem('phetta_dream_session_count');
            this.day = v ? parseInt(v,10) : 1;
        }catch(_){
            this.day = 1;
        }
        try{
            const mood = localStorage.getItem('phetta_dream_last_mood');
            this.lastMood = mood ? JSON.parse(mood) : null;
        }catch(_){ this.lastMood = null; }
    }

    UpdateDayLabel(){
        if(this.dayEl){
            const padded = this.day.toString().padStart(3,'0');
            this.dayEl.innerText = `Day ${padded}`;
        }
    }

    OnGraphClick = () => {
        this.ShowMenu(false);
        if(this.chart){
            this.chart.Show(this.lastMood, this.day);
        }
    }

    OnDreamEnd = (_msg) => {
        // Wait briefly for fade to complete, then show chart
        setTimeout(()=>{
            this.LoadDay();
            this.UpdateDayLabel();
            if(this.chart){
                this.chart.Show(this.lastMood, this.day);
            }
        }, 2000); // Longer delay to ensure fade completes
    }
}

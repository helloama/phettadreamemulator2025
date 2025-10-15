import Component from '../../Component'

export default class DreamChartUI extends Component{
    constructor(){
        super();
        this.name = 'DreamChartUI';
        this.container = null;
        this.returnBtn = null;
        this.canvas = null;
        this.ctx = null;
        this.isVisible = false;
    }

    Initialize(){
        this.container = document.getElementById('chart_container');
        this.returnBtn = document.getElementById('chart_return');
        this.canvas = document.getElementById('chart_canvas');
        if(this.canvas){
            this.ctx = this.canvas.getContext('2d');
        }
        if(this.returnBtn){
            this.returnBtn.addEventListener('click', this.OnReturn);
        }
        this.Show(false);
    }

    Show(visibleOrMood, day){
        if(typeof visibleOrMood === 'boolean'){
            this.isVisible = visibleOrMood;
            if(this.container){
                this.container.style.visibility = this.isVisible?'visible':'hidden';
            }
            return;
        }
        // visibleOrMood is mood object
        if(this.container){
            this.container.style.visibility = 'visible';
        }
        this.isVisible = true;
        this.DrawChart(visibleOrMood, day);
    }

    DrawChart(mood, day){
        if(!this.ctx){ return; }
        const ctx = this.ctx;
        const w = this.canvas.width = 640;
        const h = this.canvas.height = 360;
        ctx.clearRect(0,0,w,h);

        // Background
        ctx.fillStyle = '#1a0d3a';
        ctx.fillRect(0,0,w,h);

        // Axes labels
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('UPPER', w/2, 24);
        ctx.fillText('DOWNER', w/2, h-8);
        ctx.save();
        ctx.translate(16, h/2);
        ctx.rotate(-Math.PI/2);
        ctx.fillText('STATIC', 0, 0);
        ctx.restore();
        ctx.save();
        ctx.translate(w-16, h/2);
        ctx.rotate(Math.PI/2);
        ctx.fillText('DYNAMIC', 0, 0);
        ctx.restore();

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        for(let i=1;i<8;i++){
            const y = (h/8)*i; ctx.beginPath(); ctx.moveTo(40,y); ctx.lineTo(w-40,y); ctx.stroke();
            const x = (w/8)*i; ctx.beginPath(); ctx.moveTo(x,40); ctx.lineTo(x,h-40); ctx.stroke();
        }

        // Title (Day)
        ctx.fillStyle = '#ff93a6';
        ctx.font = '28px Roboto, sans-serif';
        ctx.textAlign = 'left';
        const padded = (day||1).toString().padStart(3,'0');
        ctx.fillText(`Day ${padded}`, 48, 56);

        // Plot last mood point (normalized to 0..1)
        // Expect mood = { upper:number, downer:number, static:number, dynamic:number }
        let u=0, d=0, s=0, y=0;
        if(mood){
            u = mood.upper||0; d = mood.downer||0; s = mood.static||0; y = mood.dynamic||0;
        }
        // Map: vertical = upper - downer, horizontal = dynamic - static
        const v = Math.max(-1, Math.min(1, (u - d)));
        const hval = Math.max(-1, Math.min(1, (y - s)));
        const px = w/2 + hval*(w/2-60);
        const py = h/2 - v*(h/2-60);

        // Point
        ctx.fillStyle = '#ffd400';
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    OnReturn = () => {
        this.Show(false);
        // Show menu again
        const menuEnt = this.FindEntity('Menu');
        if(menuEnt){
            menuEnt.GetComponent('MenuUI').ShowMenu(true);
        }
    }
}

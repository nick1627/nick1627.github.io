class Event{
    /**
     * Create an event in spacetime
     * @param {Number} x spatial position x
     * @param {Number} ct position on ct axis
     * @param {Number} beta the beta corresponding to the frame x and ct are given in
     * @returns {Event}
     */
    constructor(x, ct, beta=null){
        this.position = math.matrix([x, ct]);
        if (beta != null){
            // Transformation required by -beta
            this.position = this.boostWithBeta(-beta);
        }
    }

    /**
     * Perform lorentz transformation by beta
     * @param {Number} beta beta of frame to transform to
     * @returns {math.matrix}
     */
    boostWithBeta(beta){
        gamma = 1/(Math.sqrt(1-beta**2));
        minusGammaBeta = -gamma*beta;
        L = math.matrix([[gamma, minusGammaBeta], [minusGammaBeta, gamma]]);
        return this.boostWithMatrix(L);
    }

    /**
     * perform lorentz transformation when matrix already known
     * @param {math.matrix} L the matrix corresponding to the Lorentz transformation
     * @returns {math.matrix}
     */
    boostWithMatrix(L){
        return math.multiply(L, this.position);
    }

    getPosition(beta=null){
        if (beta != null){
            pos = boostWithBeta(beta)
        }else{
            pos = this.position
        }
        return [pos.get([0]), pos.get([1])]
    }

    getPlotData(beta){
        let pos = this.getPosition(beta)
        plotData = ({
            type: "scatter",
            mode: "lines",
            line: {
                dash: 'dash',
                width: 2,
                color: "blue",
            },
            x: [pos[0]],
            y: [pos[1]],
        });
        return plotData;
    }
}

class EventList {
    /** A list of spacetime events
     * @param {Array<Event>} newEventList array of spacetime events 
     */
    constructor(newEventList=null){
        if (newEventList != null){
            this.events = newEventList;
        }else{
            this.events = [];
        }
    }
    /**
     * Add event to list
     * @param {Event} newEvent the event to add
     */
    addEvent(newEvent){
        this.events.push(newEvent);
    }
    /**
     * clear the events list
     */
    clear(){
        this.events = [];
    }
    
    /**Get plot data for all events
     * @returns {Object} 
     */
    getPlotData(beta){
        let plotData = [];
        for (let i = 0; i<this.events.length; i++){
            plotData.push(this.events[i].getPlotData(beta))
        }
        return plotData
    }
}

class SpaceTimeDiagram {
    /** Create a spacetime diagram, which can display
     * multiple events
     * @param {String} graphID the ID of the graph element on the page
     * @param {Number} beta the beta of the diagram
     */
    constructor(elementID, beta){
        this.elementID = elementID;
        this.beta = beta;
    }

    /**
     * Update beta
     * @param {Number} newBeta
     */
    updateBeta(newBeta){
        this.beta = newBeta;
    }

    updatePlot(eventList, layoutData){
        let plotData = eventList.getPlotData(this.beta);
        Plotly.react(this.elementID, plotData, layoutData);  
    }
    newPlot(eventList, layoutData){
        let plotData = eventList.getPlotData(this.beta);
        Plotly.purge(this.elementID);
        Plotly.newPlot(this.elementID, plotData, layoutData);
    }
}

class PageManager {
    /** Create a page manager to manage the page
     * Page consists of two spacetime diagrams and a slider
     */
    constructor(restFrame, movingFrame, betaSlider, eventList){
        this.restFrame = restFrame;
        this.movingFrame = movingFrame;
        this.betaSlider = betaSlider;
        this.eventList = eventList;
    }

    update(){
        let layout = this.getLayout("x", "ct");
        this.restFrame.updatePlot(this.eventList, layout);
        this.movingFrame.updatePlot(this.eventList, layout);
    }
    newAll(){
        let layout = this.getLayout("x", "ct");
        this.restFrame.newPlot(this.eventList, layout);
        this.movingFrame.newPlot(this.eventList, layout);
    }

    getLayout(sometitlex, sometitley) {
        const new_layout = {
            // autosize: true,
            margin: {l: 50, r: 50, t: 30, b: 30},
            hovermode: "closest",
            showlegend: false,
            xaxis: {range: [-100, 100], zeroline: true, title: sometitlex},
            yaxis: {range: [-100, 100], zeroline: true, title: sometitley},
            aspectratio: {x: 1, y: 1},
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
        };
        return new_layout;
    }
}

class Slider{
    constructor(sliderID){
        this.ID = sliderID;
    }
    getValue(){
        return document.getElementById(this.ID).value;
    }
}


function initialise() {
    // this function runs first
    let restFrame = new SpaceTimeDiagram("plot1", 0);
    let movingFrame = new SpaceTimeDiagram("plot2", 0.5);
    let betaSlider = new Slider("sliderIDGOesHere");
    let eventList = new EventList();
    let manager = new PageManager(restFrame, movingFrame, betaSlider, eventList);

    $('#betaSlider').on("input", function(){
        //update plots when value changed
        //update slider text
        $("#" + $(this).attr("id") + "Display").text($(this).val() + $("#" + $(this).attr("id") + "Display").attr("data-unit"));
        //update graph
        manager.update();
    });


    // $('#InclinationSlider').on("input", function(){
    //     //update plots when value changed
    //     //update slider text
    //     $("#" + $(this).attr("id") + "Display").text($(this).val() + $("#" + $(this).attr("id") + "Display").attr("data-unit"));
    //     //update graph
    //     manager.update();
    // });



    manager.newAll(); //update plots upon setup.  This is the first time graphs are run upon opening the page
}



$(document).ready(initialise()); //run initialise when document is ready.
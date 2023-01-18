class Scene{
    /**
     * @param {Number} axisLimit    max number on axis
     * @param {String}   graphType   The graph to plot
     * @param {Number}  numCylinders    The number of cylinders to draw
     * @param {Number}  a               The lower limit of the integration
     * @param {Number}  b               The upper limit of the integration
     */
    constructor(axisLimit, graphType, numCylinders, a, b){
        this.axisLimit = axisLimit
        this.n = numCylinders
        this.a = a
        this.b = b
        this.graph = this.getGraph(graphType)
        this.axes = new Axes(axisLimit)
        this.cylinderList = this.getCylinders()
    }

    /**
     * Fetches graph object of given type
     * @param {String} graphType The name of the graph
     */
    getGraph(graphType){
        let graph
        switch(graphType){
            case "line":
                graph = new Line(-this.axisLimit, this.axisLimit, 0.1);
                break;
            case "quadratic":
                graph = new Quadratic(-this.axisLimit, this.axisLimit, 0.1);
                break;
            case "sinusoid":
                graph = new Sine(-this.axisLimit, this.axisLimit, 0.1);
                break;
        }
        return graph
    }

    getCylinders(){
        return 0
    }
    
    setLayout(sometitlex, sometitley, sometitlez){
        //set layout of graphs. 
        
        let newLayout = {//layout of 3D graph
            //showlegend: false,
            //showscale: false,
            uirevision: 'dataset',
            margin: {
                l: 1, r: 1, b: 10, t: 1, pad: 0
            },
            dragmode: 'turntable',
            scene: {
                
                aspectmode: "cube",
                // xaxis: {range: [-0.05, 0.05], title: sometitlex},//, showticklabels: false},
                // yaxis: {range: [-0.01, 0.01], title: sometitley},//, showticklabels: false},
                // zaxis: {range: [-0.01, 0.01], title: sometitlez},//, showticklabels: false},
                xaxis: {range: [-this.axisLimit, this.axisLimit], title: sometitlex, showbackground: false, showgrid: false},//, showticklabels: false},
                yaxis: {range: [-this.axisLimit, this.axisLimit], title: sometitley, showbackground: false, showgrid: false},//, showticklabels: false},
                zaxis: {range: [-this.axisLimit, this.axisLimit], title: sometitlez, showbackground: false, showgrid: false},//, showticklabels: false},
                
                //aspectmode: "manual",
                // aspectratio: {
                //     x: 5, y: 1, z: 1,
                // },
                aspectratio: {
                    x: 1, y: 1, z: 1,
                },
    
                camera: {
                    up: {x: 0, y: 0, z: 1},//sets which way is up
                    eye: {x: 1, y: 1, z: 1}//adjust camera starting view
                }
            },
        };
    
        return newLayout;
    }

    newPlot(graphName){
        // acquire axes
        let plotData = this.axes.getDrawData()
        // acquire graph
        plotData.push(this.graph.getDrawData("x", "z"))
        // acquire cylinders


        Plotly.purge(graphName);
        Plotly.newPlot(graphName, plotData, this.setLayout('x', 'y', 'z'));
    }

    updatePlot(graphName){
        Plotly.react(graphName, plotData, this.setLayout('x', 'y', 'z'));
    }
}




function main(plotNew = false){

    let scene = new Scene(10, "sinusoid", 0, -5, 5)

    if (plotNew){
        scene.newPlot("3DGraph");
    }else{
        scene.updatePlot("3DGraph")
    }

}



function Initialise() {


    main(PlotNew = true); //update plots upon setup.  This is the first time graphs are run upon opening the page
}

$(document).ready(Initialise()); //Load initialise when document is ready.
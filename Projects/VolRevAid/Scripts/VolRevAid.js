class Scene{
    /**
     * @param {Number} axisLimit    max number on axis
     * @param {String}   graphType   The graph to plot
     * @param {Number}  numCylinders    The number of cylinders to draw
     * @param {Number}  a               The lower limit of the integration
     * @param {Number}  b               The upper limit of the integration
     * @param {String}  axis            The axis about which the rotation happens
     */
    constructor(axisLimit, graphType, numCylinders, a, b, axis){
        this.axisLimit = axisLimit
        this.n = numCylinders
        this.a = a
        this.b = b
        this.graph = this.getGraph(graphType)
        this.axes = new Axes(axisLimit)
        this.symmetryAxis = axis
        // this.cylinderList = this.updateCylinders()
        this.firstCylinder = this.updateCylinders()
    
    }


    /**
     * Fetches graph object of given type
     * @param {String} graphType The name of the graph
     * @returns {Graph}
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

    /**
     * Get cylinder objects for scene
     * @returns {Array<Cylinder>}
     */

    updateCylinders(){
        
        if (this.n == 0){
            return null;
        }else{
            var origin = this.getAxialVector(this.a, this.symmetryAxis)
            var h = (Math.abs(this.b - this.a))/this.n;
            var axialVector = this.getAxialVector(h, this.symmetryAxis)
            return new ChainableCylinder(origin, axialVector, 5, this.graph, this.n)
        }
    }


    getAxialVector(n, axis){
        var position
        switch(axis){
            case "x":
                position = [n, 0, 0]
                break;
            case "y":
                position = [0, n, 0]
                break;
            case "z":
                position = [0, 0, n]
                break;
            
        }
        return math.matrix(position)
    }

    set_a(a){
        this.a = a;
        this.updateCylinders();
    }
    set_b(b){
        this.b = b;
        this.updateCylinders();
    }
    set_n(n){
        this.n = n;
        this.updateCylinders();
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
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
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
                    eye: {x: 0.5, y: -1, z: 0.5}//adjust camera starting view
                }
            },
        };
    
        return newLayout;
    }

    newPlot(graphName){
        // acquire axes
        let plotData = this.axes.getDrawData();
        // acquire graph
        plotData.push(this.graph.getDrawData("x", "z"));
        // acquire cylinders
        // for (let cylinder of this.cylinderList){
        //     plotData = plotData.concat(cylinder.getDrawData());
        // }
        plotData = plotData.concat(this.firstCylinder.getChainDrawData())

        Plotly.purge(graphName);
        Plotly.newPlot(graphName, plotData, this.setLayout('x', 'y', 'z'));
    }

    updatePlot(graphName){
        Plotly.react(graphName, plotData, this.setLayout('x', 'y', 'z'));
    }
}




function main(plotNew = false){

    let scene = new Scene(10, "quadratic", 50, -5, 5, "x")

    if (plotNew){
        scene.newPlot("graph3D");
    }else{
        scene.updatePlot("graph3D")
    }

}



function initialise() {


    main(PlotNew = true); //update plots upon setup.  This is the first time graphs are run upon opening the page
}

$(document).ready(initialise()); //Load initialise when document is ready.
class PageManager{
    constructor(){
        this.a = -5;
        this.b = 5;
        this.n = 0;
        this.graphType = "quadratic";
        this.revolutionAxis = "x";
        this.errorList = [];
        
        // 3d graph object
        this.scene = new Plot3D(this);
        // 2d graph object
        this.volumeGraph = new Plot2D(this.scene.graph.getIntegralVolume(this.a, this.b, this.revolutionAxis));

        this.displayErrorList()
    }

    getTotalCylinderVolume(){
        if (this.n != 0){
            return this.scene.firstCylinder.getChainVolume();
        }else{
            return 0;
        }
    }
   
    newAll(){
        // plots/loads everything from scratch
        // the most extreme reset possible (without recreating main objects)
        // only happens at start of page loading
        this.scene.updatePlot()
        this.volumeGraph.newGraph()

        this.updateTrueVolumeText(this.scene.graph.getIntegralVolume(this.a, this.b, this.revolutionAxis))
    }

    hardUpdate(){
        // updates data and plots when the true volume has changed
        this.updateInputs()

        if (this.errorList.length == 0){
            this.scene.updateGraph()
            this.scene.updateCylinders()
            this.scene.updatePlot(false)
            
            var totalVol = this.getTotalCylinderVolume()
            var trueVol = this.scene.graph.getIntegralVolume(this.a, this.b, this.revolutionAxis)
            this.volumeGraph.reset(trueVol)
            this.volumeGraph.addPoint(this.n, totalVol)
            this.updateCylinderVolumeText(totalVol)
            this.updateTrueVolumeText(trueVol)
        }
    }

    softUpdate(){
        // updates data and plots when only cylinder volume has changed
        this.updateInputs()

        if (this.errorList.length == 0){
            this.scene.updateCylinders()
            this.scene.updatePlot(false)
            var totalVol = this.getTotalCylinderVolume()
            this.volumeGraph.addPoint(this.n, totalVol)
            this.updateCylinderVolumeText(totalVol)
        }
    }

    resetVolumeGraph(){
        this.volumeGraph.reset(this.scene.graph.getIntegralVolume(this.a, this.b, this.revolutionAxis))
    }


    /**
     * Update all the input values from the html page
     */
    updateInputs(){
        this.a = parseFloat(document.getElementById("a_input").value);
        this.b = parseFloat(document.getElementById("b_input").value);
        this.n = parseInt(document.getElementById("n_input").value);
        this.graphType = document.getElementById("graphSelector").value;
        this.revolutionAxis = document.getElementById("axisSelector").value;

        this.checkInputs()
    }

    /**
     * Here we check the inputs for validity
     */
    checkInputs(){
        this.errorList = []
        var domain = this.scene.graph.getDomain(this.revolutionAxis)

        if (this.a < domain[0]) {
            this.errorList.push("a must be within the domain of the function")
        }

        if (this.b > domain[1]) {
            this.errorList.push("a must be within the domain of the function")
        }

        if (!(this.scene.graph.revolvable.includes(this.revolutionAxis))){
            this.errorList.push("Graph type and axis of revolution are incompatible")
        }

        if (this.a >= this.b){
            this.errorList.push("a must be less than b")
        }


        this.displayErrorList()
    }

    displayErrorList(){
        if (this.errorList.length != 0){
            document.getElementById("errorText").innerHTML = this.errorList[this.errorList.length - 1]
        }else{
            document.getElementById("errorText").innerHTML = "None"
        }
       
    }

    updateCylinderVolumeText(newValue){
        document.getElementById("cylinderVolumeText").innerHTML = String(newValue);
    }

    updateTrueVolumeText(newValue){
        document.getElementById("trueVolumeText").innerHTML = String(newValue);
    }
}



class Plot3D{
    /**
     * @param {Number} axisLimit    max number on axis
     * @param {String}   graphType   The graph to plot
     * @param {Number}  numCylinders    The number of cylinders to draw
     * @param {Number}  a               The lower limit of the integration
     * @param {Number}  b               The upper limit of the integration
     * @param {String}  axis            The axis about which the rotation happens
     */
    constructor(manager){
        this.manager = manager;
        this.axisLimit = 10;
     
        this.graph = this.getGraph();

        this.axes = new Axes(this.axisLimit);
        
        this.firstCylinder = this.getCylinders();
    }



    updateCylinders(){
        this.firstCylinder = this.getCylinders()
    }

    /**
     * Get cylinder objects for scene
     * @returns {Array<Cylinder>}
     */
    getCylinders(){
        if (this.manager.n == 0){
            return null;
        }else{
            var origin = this.getAxialVector(this.manager.a, this.manager.revolutionAxis)
            var h = (Math.abs(this.manager.b - this.manager.a))/this.manager.n;
            var axialVector = this.getAxialVector(h, this.manager.revolutionAxis)

            return new ChainableCylinder(origin, axialVector, 10, this.graph, this.manager.revolutionAxis, this.manager.n);
        }
    }

  
    updateGraph(){
        this.graph = this.getGraph()
    }

    /**
     * Fetches graph object of given type
     * @param {String} graphType The name of the graph
     * @returns {Graph}
     */
    getGraph(){
        let graph
        switch(this.manager.graphType){
            case "linear":
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


    
    setLayout(sometitlex, sometitley, sometitlez){
        //set layout of graphs. 
        
        let newLayout = {//layout of 3D graph
            //showlegend: false,
            //showscale: false,
            uirevision: true,
            margin: {
                l: 1, r: 1, b: 10, t: 1, pad: 0,
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            dragmode: 'turntable',
            
            legend: {
                x: 0.99,
                y: 0.01,
                xanchor: "right",
                yanchor: "bottom",
            },
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
                    eye: {x: 0.5, y: -1, z: 0.5},//adjust camera starting view
                }
            },

        };
    
        return newLayout;
    }

    updatePlot(plotNew){
        // acquire axes
        let plotData = this.axes.getDrawData();
        // acquire graph
        plotData.push(this.graph.getDrawData("x", "z"));
        // acquire cylinders
        if (this.firstCylinder != null){
            plotData = plotData.concat(this.firstCylinder.getChainDrawData())
        }

        if (plotNew){
            Plotly.purge("graph3D");
            Plotly.newPlot("graph3D", plotData, this.setLayout('x', 'y', 'z'), {responsive: true, displayModeBar: true,showspikes: false});
        }else{
            Plotly.react("graph3D", plotData, this.setLayout('x', 'y', 'z'));
        }
    }
}




class Plot2D{
    /**
     * The graph that displays volumes against n is managed via this class
     * @param {Number} actualVolume the true volume of the revolved graph
     */
    constructor(actualVolume){
        this.n = [0]
        this.vol = [0]
        this.actualVolume = actualVolume
    }

    addPoint(n, cylinderVolume){
        if (n!= 0){
            this.updateData(n, cylinderVolume)
            this.updateGraph()
        }
    }

    /**
     * @param {Number} n    number of cylinders
     * @param {Number} cylinderVolume  volume of all cylinders
     */
    updateData(new_n, new_cylinderVolume){
        // check for repeat
        if (this.n.includes(new_n) == false){
            this.n.push(new_n);
            this.vol.push(new_cylinderVolume);
            this.sortData()
        }
    }

    sortData(){
        // sort both n and vol according to n (ascending)
        // implement insertion sort

        var length = this.n.length;
        var j
        var temp
        for (let i = 0; i < length; i++){
            j = i
            while((j > 0) && (this.n[j-1] > this.n[j])){
                //swap
                temp = this.n[j]
                this.n[j] = this.n[j-1]
                this.n[j-1] = temp

                temp = this.vol[j]
                this.vol[j] = this.vol[j-1]
                this.vol[j-1] = temp

                j = j-1
            } 
        }
    }


    updateActualVolume(actualVolume){
        this.actualVolume = actualVolume
    }

    /**
     * Clear everything about graph, for purpose of having new graph
     * @param {Number} actualVolume true volume of new revolved graph
     */
    reset(newActualVolume){
        this.clearData()
        this.updateActualVolume(newActualVolume)
        this.updateGraph()
    }

    clearData(){
        this.n = [0]
        this.vol = [0]
    }

    getPlotData(){
        var lineLimit = 6
        if (this.n.length != 0){
            lineLimit = Math.max(...this.n)
        }
        var flatLine = ({
            x: [0, lineLimit],
            y: [this.actualVolume, this.actualVolume],
            type: 'scatter',
            mode:"lines",
            name:"True",
            line: {
                width: 1,
                color: "red",
                //reversescale: false
            }
        })
        var cylinderData = ({
            x: this.n,
            y: this.vol,
            type: 'scatter',
            mode:"lines+markers",
            name:"Cylinders",
            line: {
                width: 1,
                color: "blue",
                //reversescale: false
            }
        });
        return [flatLine, cylinderData]
    }

    newGraph(){
        // var xmax = 6
        // if (this.n.length != 0){
        //     lineLimit = Math.max(...this.n)
        // }
        Plotly.purge("graph2D");
        Plotly.newPlot("graph2D", this.getPlotData(), this.setLayout());
    }

    updateGraph(){
        Plotly.react("graph2D", this.getPlotData(), this.setLayout());
    }

    setLayout() {
        const new_layout = {
            autosize: true,
            margin: {l: 45, r: 30, t: 30, b: 30},
            // hovermode: "closest",
            showlegend: true,
            legend:{
                xanchor:"right",
            },
            // xaxis: {range: [-100, 100], zeroline: true, title: sometitlex},
            // yaxis: {range: [-100, 100], zeroline: true, title: sometitley},
            xaxis: {title: "Number of cylinders", rangemode:"nonnegative"},
            yaxis: {title: "Volume", rangemode:"nonnegative"},
            aspectratio: {x: 1, y: 1},
            // rangemode:"nonnegative",

           
            // rangemode:"nonnegative",
        };
        return new_layout;
    }
}



function initialise() {
    let manager = new PageManager()
    // set up UI
    $("#graphSelector").on("input", function(){
        //this changes the true volume as well as cylinders 
        manager.hardUpdate();
    });

    $("#axisSelector").on("input", function(){
        //this changes the true volume as well as cylinders 
        manager.hardUpdate();
    });

    $("#a_input").on("input", function(){
        //this changes the true volume as well as cylinders 
        manager.hardUpdate();
    });

    $("#b_input").on("input", function(){
        //this changes the true volume as well as cylinders 
        manager.hardUpdate();
    });

    $("#n_input").on("input", function(){
        // only changes cylinder related stuff
        manager.softUpdate();
    });

    $("#clearButton").on("click", function(){
        // only changes cylinder related stuff
        document.getElementById("n_input").value = 0
        manager.softUpdate();
        manager.resetVolumeGraph()
    });

    // update plot for first time
    manager.newAll()
}

$(document).ready(initialise()); //Load initialise when document is ready.
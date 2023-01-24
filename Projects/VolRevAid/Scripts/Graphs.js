class Graph{
    /**
     * Create graph object
     * @param {Number} lowerLimit   lowest x value to plot from
     * @param {Number} upperLimit   highest x value to plot up to
     * @param {Number}  spacing     spacing between x values
     */
    constructor(lowerLimit, upperLimit, spacing){
        [this.xValues, this.yValues, this.zValues] = this.getPoints(lowerLimit, upperLimit, spacing)
    }
    
    /**
     * Compute the points of the graph
     * @param {Number} lowerLimit   lowest x value to plot from
     * @param {Number} upperLimit   highest x value to plot up to
     * @param {Number}  spacing     spacing between x values
     */
    getPoints(lowerLimit, upperLimit, spacing){
        var n = (Math.abs(upperLimit - lowerLimit)/spacing) + 1;
        var xValues = new Array(n)
        var yValues = new Array(n)
        var zValues = new Array(n)

        for (let i = 0; i < n; i++){
            xValues[i] = lowerLimit + i*spacing
            yValues[i] = this.equation(xValues[i])
            zValues[i] = 0
        }
        return [xValues, yValues, zValues]
    }

    getDrawData(inputAxis, outputAxis){
        let lineData = ({
            type: "scatter3d",
            mode: "lines",
            name: "graph",
            x: [],
            y: [],
            z: [],

            line: {
                width: 6,
                color: "black",
                //reversescale: false
            }
        });

        switch(inputAxis){
            case "x":
                if (outputAxis == "y"){
                    lineData.x = this.xValues;
                    lineData.y = this.yValues;
                    lineData.z = this.zValues;
                }else{
                    lineData.x = this.xValues;
                    lineData.y = this.zValues;
                    lineData.z = this.yValues;
                }
                break;
            case "y":
                if (outputAxis == "x"){
                    lineData.x = this.yValues;
                    lineData.y = this.xValues;
                    lineData.z = this.zValues;
                }else{
                    lineData.x = this.zValues;
                    lineData.y = this.xValues;
                    lineData.z = this.yValues;
                }
                break;
            case "z":
                if (outputAxis == "x"){
                    lineData.x = this.yValues;
                    lineData.y = this.zValues;
                    lineData.z = this.xValues;
                }else{
                    lineData.x = this.zValues;
                    lineData.y = this.yValues;
                    lineData.z = this.xValues;
                }
                break;
        }

        return lineData
    }

    /**
     * Use vector to evaluate equation instead of position on axis
     * @param {math.matrix} position    vector position on axis
     * @returns {Number}    
     */
    equation3D(position){
        return this.equation(math.sum(position))
    }
}

class Line extends Graph{
    equation(x){
        return x
    }
}

class Quadratic extends Graph{
    equation(x){
        return 0.1*x*x
    }
}

class Sine extends Graph{
    equation(x){
        return Math.sin(x)
    }
}

class Axes{
    constructor(axisLimit){
        this.axisLimit = axisLimit
    }

    getDrawData(){
        let xAxis = ({
            type:"scatter3d",
            mode: "lines",
            name: "xAxis",
            x: [-this.axisLimit, this.axisLimit],
            y: [0, 0],
            z: [0, 0],
    
            line:{
                width: 3,
                color:"red"
            }
        });
    
        let yAxis = ({
            type:"scatter3d",
            mode: "lines",
            name: "yAxis",
            x: [0, 0],
            y: [-this.axisLimit, this.axisLimit],
            z: [0, 0],
    
            line:{
                width: 3,
                color:"green"
            }
        });
    
        let zAxis = ({
            type:"scatter3d",
            mode: "lines",
            name: "zAxis",
            x: [0, 0],
            y: [0, 0],
            z: [-this.axisLimit, this.axisLimit],
    
            line:{
                width: 3,
                color:"blue"
            }
        });
    
        return [xAxis, yAxis, zAxis];
    }
}



class VolumeGraph{
    /**
     * The graph that displays volumes against n is managed via this class
     * @param {Number} actualVolume the true volume of the revolved graph
     */
    constructor(actualVolume){
        this.n = []
        this.vol = []
        this.actualVolume = actualVolume
    }
    /**
     * @param {Number} n    number of cylinders
     * @param {Number} cylinderVolume  volume of all cylinders
     */
    updateData(n, cylinderVolume){
        this.n.push(n);
        this.n.push(cylinderVolume);
        this.sortData()
    }

    addPoint(n, cylinderVolume){
        this.updateData(n, cylinderVolume)
        this.updateGraph()
    }

    sortData(){
        this.n.sort(function(a, b){return a - b});
        this.vol.sort(function(a, b){return a - b});
    }

    updateActualVolume(actualVolume){
        this.actualVolume = actualVolume
    }

    /**
     * Clear everything about graph, for purpose of having new graph
     * @param {Number} actualVolume true volume of new revolved graph
     */
    clearAll(actualVolume){
        this.clearData()
        this.updateActualVolume(actualVolume)
        this.updateGraph()
    }

    clearData(){
        this.n = []
        this.vol = []
        this.updateGraph()
    }

    getPlotData(){
        var trace1 = {
            x: this.n,
            y: this.vol,
            type: 'scatter'
        };
        var data = [trace1];
        return data
    }

    newGraph(){
        Plotly.purge("graph2D");
        Plotly.newPlot("graph2D", this.getPlotData(), this.setLayout());
    }

    updateGraph(){
        Plotly.react("graph2D", this.getPlotData(), this.setLayout());
    }

    setLayout() {
        const new_layout = {
            autosize: true,
            // margin: {l: 45, r: 30, t: 30, b: 30},
            // hovermode: "closest",
            showlegend: false,
            // xaxis: {range: [-100, 100], zeroline: true, title: sometitlex},
            // yaxis: {range: [-100, 100], zeroline: true, title: sometitley},
            xaxis: {title: "Number of cylinders"},
            yaxis: {title: "Total cylinder volume"},
            aspectratio: {x: 1, y: 1}
        };
        return new_layout;
    }
}
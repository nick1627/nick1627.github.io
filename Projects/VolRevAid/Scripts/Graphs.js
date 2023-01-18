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
        console.log(xValues[0])
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
}

class Line extends Graph{
    equation(x){
        return x
    }
}

class Quadratic extends Graph{
    equation(x){
        return x*x
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
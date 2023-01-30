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
    /** Get volume that results from integration between the limits a and b
     * @param {Number} a the lower limit
     * @param {Number} b the upper limit
     * @returns {Number}
     */
    getIntegralVolume(a, b, symmetryAxis){
        if (symmetryAxis == "x"){
            return Math.PI*(this.integralOfSquare(b) - this.integralOfSquare(a))
        }else{
            return Math.PI*(this.inverse_integralOfSquare(b) - this.inverse_integralOfSquare(a))
        }
        
    }

    getDrawData(inputAxis, outputAxis){
        let lineData = ({
            type: "scatter3d",
            mode: "lines",
            name: "Graph",
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
    equation3D(position, revolutionAxis){
        if (revolutionAxis == "x"){
            return this.equation(math.sum(position))
        }else{
            // revolutionAxis == "z"
            return this.inverse_equation(math.sum(position))
        }
        
    }

    getDomain(revolutionAxis){
        return [-Infinity, Infinity]
    }
}

class Line extends Graph{
    constructor(lowerLimit, upperLimit, spacing){
        super(lowerLimit, upperLimit, spacing);
        this.revolvable = ["x", "z"];
    }
    equation(x){
        return x
    }
    inverse_equation(x){
        return this.equation(x)
    }
    integralOfSquare(x){
        return x**3/3
    }
    inverse_integralOfSquare(x){
        return this.integralOfSquare(x)
    }
}

class Quadratic extends Graph{
    constructor(lowerLimit, upperLimit, spacing){
        super(lowerLimit, upperLimit, spacing)
        this.revolvable=["x", "z"];
    }
    equation(x){
        return 0.1*x*x;
    }
    integralOfSquare(x){
        return (x**5)/500;
    }
    inverse_equation(x){
        return math.sqrt(10*x);
    }
    inverse_integralOfSquare(x){
        return 5*(x**2);
    }
    getDomain(revolutionAxis){
        if (revolutionAxis == "x"){
            return [-Infinity, Infinity]
        }else{
            return [0, Infinity]
        }
    }
}

class Sine extends Graph{
    constructor(lowerLimit, upperLimit, spacing){
        super(lowerLimit, upperLimit, spacing)
        this.revolvable = ["x"]
    }
    equation(x){
        return Math.sin(x)
    }
    integralOfSquare(x){
        return 0.5*(x - 0.5*Math.sin(2*x))
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
            name: "x-axis",
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
            name: "y-axis",
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
            name: "z-axis",
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


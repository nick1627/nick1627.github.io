class Graph{
    plotPoints(){

    }
    getDrawData(){

    }
}

class Line extends Graph{
    constructor(){
        super()
    }
    equation(x){
        return x
    }
}

class Quadratic extends Graph{
    constructor(){
        super()
    }

    equation(x){
        return x*x
    }
}

class Sine extends Graph{
    constructor(){
        super()
    }

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
            x: [-AxisLimit, AxisLimit],
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
            y: [-AxisLimit, AxisLimit],
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
            z: [-AxisLimit, AxisLimit],
    
            line:{
                width: 3,
                color:"blue"
            }
        });
    
        return [xAxis, yAxis, zAxis];
    }
}
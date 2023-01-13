class Shape {
    NewPlot(GraphName, GraphData, AxisLimit){
        Plotly.purge(GraphName);
        Plotly.newPlot(GraphName, GraphData, setLayout('x', 'y', 'z', AxisLimit));
    }

    UpdatePlot(GraphName, GraphData, AxisLimit){
        Plotly.react(GraphName, GraphData, setLayout('x', 'y', 'z', AxisLimit));
    }
}

class Triangle extends Shape {
    /**
    * Create triangle
    * @param {Array<Number>}    A      One point of the triangle
    * @param {Array<Number>}    B      One point of the triangle
    * @param {Array<Number>}    C      One point of the triangle
    */
    constructor(A, B, C){
        this.PointA = A;
        this.PointB = B;
        this.PointC = C;
    }
    getDrawData(){
        let TriangleData = ({
            type: "mesh3d",
            //mode: "lines",
            x:  [this.PointA[0], this.PointB[0], this.PointC[0]],
            y:  [this.PointA[1], this.PointB[1], this.PointC[1]],
            z:  [this.PointA[2], this.PointB[2], this.PointC[2]],
        });

        return TriangleData;
    }
}

class Circle extends Shape{
    /**
    * Create circle
    * @param {Array<Number>}    centre      Centre of the circle
    * @param {Array<Number>}    normalVec   Normal vector of circle in 3d space
    * @param {Number}   radius      The radius of the circle
    * @param {Number}   angle       Angle between successive 'spokes' of circle in degrees
    */
    constructor(centre, normalVec, radius, angle){
        this.centre = centre
        this.normalVec = normalVec
        this.radius = radius
        this.angle = angle*Math.PI/180
        this.circumferencePoints = this.getCirclePoints()
    }

    getCirclePoints(){
        // Draw a circle with (1, 0, 0) as normal vector
        // then transform
        let circumferencePoints = []
        for (let theta = 0; theta < 2*Math.PI; theta += this.angle){
            circumferencePoints.push(this.radius * [0, Math.cos(theta), Math.sin(theta)])
        }
        return circumferencePoints
    }

    getDrawData(){
        // Decompose circle data into multiple triangles
        let circleDrawData = []
        for (let i = 0; i < this.circumferencePoints.length; i+=1 ){
     
            var newTriangle = new Triangle([0,0,0], this.circumferencePoints[i], this.circumferencePoints[i+1])

            circleDrawData.push(newTriangle.getDrawData())
            
        }
        return circleDrawData
        
    }
}


function setLayout(sometitlex, sometitley, sometitlez, AxisLimit){
    //set layout of graphs. 
    
    let new_layout = {//layout of 3D graph
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
            xaxis: {range: [-AxisLimit, AxisLimit], title: sometitlex, showbackground: true, showgrid: false, backgroundcolor: "black"},//, showticklabels: false},
            yaxis: {range: [-AxisLimit, AxisLimit], title: sometitley, showbackground: true, showgrid: false, backgroundcolor: "black"},//, showticklabels: false},
            zaxis: {range: [-AxisLimit, AxisLimit], title: sometitlez, showbackground: true, showgrid: false, backgroundcolor: "black"},//, showticklabels: false},
            
            //aspectmode: "manual",
            aspectratio: {
                x: 5, y: 1, z: 1,
            },

            camera: {
                up: {x: 0, y: 0, z: 1},//sets which way is up
                eye: {x: 1, y: 1, z: 1}//adjust camera starting view
            }
        },
    };

    return new_layout;
}

function Main(PlotNew = false){
    let AxisLimit = 2*10**5;

    // let TriangleOne = new Triangle([0, 0, 0], [20000, 20000, 20000], [-10000, 20000, -40000]);
    // let TriangleData = TriangleOne.getTriangleData();
    let myCircle = new Circle([0, 0, 0], [1, 0, 0], 5000, 90)
    

    PlotData = myCircle.getDrawData()
    // let AxisData = GetCartesianAxes(AxisLimit);
    // PlotData.push(AxisData[0]);
    // PlotData.push(AxisData[1]);
    // PlotData.push(AxisData[2]);

    // if (PlotNew){
    //     TriangleOne.NewPlot("3DGraph", PlotData, AxisLimit);
    // }else{
    //     TriangleOne.UpdatePlot("3DGraph", PlotData, AxisLimit);
    // }
    myCircle.NewPlot("3DGraph", [PlotData], AxisLimit);
}



function Initialise() {


    Main(PlotNew = true); //update plots upon setup.  This is the first time graphs are run upon opening the page
}

$(document).ready(Initialise()); //Load initialise when document is ready.
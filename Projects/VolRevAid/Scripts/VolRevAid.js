class Shape {
    /**
    * Rotate a shape with normal vector (1,0,0) so that it aligns with
    * the given normal vector.
    * @param {String}                   newAxis             "x", "y" or "z", the axis the normal vector will align with
    * @param {Array<math.matrix>}     arrayOfPoints       Array of vectors for points that make up the shape.
    * @returns {Array<math.matrix>}                       Array of vectors for points that make up the shape once rotated
    */
    rotateToNewAxis(newAxis, arrayOfPoints){
        // Assume points are aligned with x axis initially
        let rotationMatrix = math.matrix([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
        if (newAxis != "x"){
            switch(newAxis){
                case "y":
                    // rotate about z axis by 90 degrees
                    rotationMatrix = math.matrix([[0, -1, 0], [1, 0, 0], [0, 0, 1]]);
                    break;
                case "z":
                    // rotate about y axis by -90 degrees
                    rotationMatrix = math.matrix([[0, 0, -1], [0, 1, 0], [1, 0, 0]]);
                    break;
            }
            for (let i = 0; i < arrayOfPoints.length; i++){
                arrayOfPoints[i] = math.multiply(rotationMatrix, arrayOfPoints[i]);
            }
        }
        return arrayOfPoints;
    }

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
        super();
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
            i:  [0],
            j:  [1],
            k:  [2],
        });

        return TriangleData;
    }
}

class Circle extends Shape{
    /**
    * Create circle
    * @param {math.matrix}    centre      Centre of the circle
    * @param {String}    normalAxis   Normal vector of circle in 3d space
    * @param {Number}   radius      The radius of the circle
    * @param {Number}   angle       Angle between successive 'spokes' of circle in degrees
    */
    constructor(centre, normalAxis, radius, angle){
        super();
        this.centre = centre;
        this.normalAxis = normalAxis
        this.radius = radius;
        this.angle = angle*Math.PI/180;
        this.circumferencePoints = this.getCirclePoints();
    }

    getCirclePoints(){
        // Gets points in circle based on variables in constructor

        // Draw a circle with (1, 0, 0) as normal vector
        // then transform
        let circumferencePoints = []
        for (let theta = 0; theta < 2*Math.PI; theta += this.angle){
            circumferencePoints.push(math.matrix([0, this.radius*Math.cos(theta), this.radius*Math.sin(theta)]))
        }

        // Have the circumference points at/around the origin
        // Now transform to where the circle really is
        // First rotate
        circumferencePoints = this.rotateToNewAxis(this.normalAxis, circumferencePoints)
        // Now translate
        for (let i = 0; i < circumferencePoints.length; i++){
            circumferencePoints[i] = math.add(circumferencePoints[i], this.centre)
        }

        return circumferencePoints
    }

    /**
     * Converts shape information into format suitable for plotting with plotly
     */
    getDrawData(){
        let circleDrawData = ({
            type: "mesh3d",
            x: [this.centre.get([0]), this.circumferencePoints[0].get([0])],
            y: [this.centre.get([1]), this.circumferencePoints[0].get([1])],
            z: [this.centre.get([2]), this.circumferencePoints[0].get([2])],
            i: [],
            j: [],
            k: [],
        });

        let length = this.circumferencePoints.length;

        for (let i = 1; i < length; i+=1 ){
            circleDrawData.x.push(this.circumferencePoints[i].get([0]));
            circleDrawData.y.push(this.circumferencePoints[i].get([1]));
            circleDrawData.z.push(this.circumferencePoints[i].get([2]));
            circleDrawData.i.push(0);
            circleDrawData.j.push(i);
            circleDrawData.k.push(i+1);
        }

        return circleDrawData;
    }
}


class Cylinder extends Shape{
    /**
    * Create cylinder (two circles with connecting tube)
    * @param {math.matrix}    centre      Coordinates of centre of first circle
    * @param {String}    normalAxis     Vector from centre of first circle to centre of second
    * @param {Number}   radius      The radius of the circles
    * @param {Number}   angle       Angle between successive 'spokes' of circles in degrees
    * @param {Number}   thickness   Thickness of the cylinder
    */

    constructor(centre, normalAxis, radius, angle, thickness){
        super();
        this.centre = centre;
        this.normalAxis = normalAxis;
        this.radius = radius;
        this.angle = angle*Math.PI/180;
        this.thickness = thickness;

        let axisVec = [0, 0, 0];
        switch (normalAxis){
            case "x":
                axisVec[0] = thickness;
                break;
            case "y":
                axisVec[1] = thickness;
                break;
            case "z":
                axisVec[2] = thickness;
                break;
        }

        

        this.firstCircle = new Circle(this.centre, this.normalAxis, this.radius, this.angle);
        this.secondCircle = new Circle(math.add(this.centre, axisVec), this.normalAxis, this.radius, this.angle);

        
    }

    getDrawData(){
        let drawData = []
        // get the draw data for both circles
        drawData.push(this.firstCircle.getDrawData())
        drawData.push(this.secondCircle.getDrawData())
        /**
         * Now get the data for the connecting tube
         * As you'd imagine, this would be a set of
         * rectangles, but each rectangle must be
         * cut into a triangle for mesh3d to work with
         */

        let tubeDrawData = ({
            type: "mesh3d",
            x: [this.firstCircle.circumferencePoints[0].get([0]), this.secondCircle.circumferencePoints[0].get([0])],
            y: [this.firstCircle.circumferencePoints[0].get([1]), this.secondCircle.circumferencePoints[0].get([1])],
            z: [this.firstCircle.circumferencePoints[0].get([2]), this.secondCircle.circumferencePoints[0].get([2])],
            i: [],
            j: [],
            k: [],
        });

        let length = this.firstCircle.circumferencePoints.length;

        for (let i = 1; i < length; i+=1){
            /**
             * each iteration must push two points,
             * building on the previous two points
             * to make a new rectangle (two triangles)
             */       
            //  push first point
            tubeDrawData.x.push(this.firstCircle.circumferencePoints[i].get([0]));
            tubeDrawData.y.push(this.firstCircle.circumferencePoints[i].get([1]));
            tubeDrawData.z.push(this.firstCircle.circumferencePoints[i].get([2]));
            // build triangle
            tubeDrawData.i.push(2*i-2); // which index of all arrays is the first point of this triangle?
            tubeDrawData.j.push(2*i-1); // which index of all arrays is the second point of this triangle?
            tubeDrawData.k.push(2*i); // which index of all arrays is the third point of this triangle?
            // push corresponding second point
            tubeDrawData.x.push(this.secondCircle.circumferencePoints[i].get([0]));
            tubeDrawData.y.push(this.secondCircle.circumferencePoints[i].get([1]));
            tubeDrawData.z.push(this.secondCircle.circumferencePoints[i].get([2]));
            // build corresponding second triangle
            tubeDrawData.i.push(2*i-1);
            tubeDrawData.j.push(2*i);
            tubeDrawData.k.push(2*i+1);
        }

        drawData.push(tubeDrawData)
        return drawData

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
            xaxis: {range: [-AxisLimit, AxisLimit], title: sometitlex, showbackground: false, showgrid: false},//, showticklabels: false},
            yaxis: {range: [-AxisLimit, AxisLimit], title: sometitley, showbackground: false, showgrid: false},//, showticklabels: false},
            zaxis: {range: [-AxisLimit, AxisLimit], title: sometitlez, showbackground: false, showgrid: false},//, showticklabels: false},
            
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

    return new_layout;
}

function Main(PlotNew = false){
    let AxisLimit = 10;

    // let TriangleOne = new Triangle([0, 0, 0], [20000, 20000, 20000], [-10000, 20000, -40000]);
    // let TriangleData = TriangleOne.getTriangleData();
    // let myCircle = new Circle([0, 0, 0], "x", 4, 5)
    

    // PlotData = myCircle.getDrawData()
    let myCylinder = new Cylinder(math.matrix([1, 0, 0]), "x", 5, 5, 5)
    PlotData = myCylinder.getDrawData()
    // let AxisData = GetCartesianAxes(AxisLimit);
    // PlotData.push(AxisData[0]);
    // PlotData.push(AxisData[1]);
    // PlotData.push(AxisData[2]);

    // if (PlotNew){
    //     TriangleOne.NewPlot("3DGraph", PlotData, AxisLimit);
    // }else{
    //     TriangleOne.UpdatePlot("3DGraph", PlotData, AxisLimit);
    // }
    myCylinder.NewPlot("3DGraph", PlotData, AxisLimit);
}



function Initialise() {


    Main(PlotNew = true); //update plots upon setup.  This is the first time graphs are run upon opening the page
}

$(document).ready(Initialise()); //Load initialise when document is ready.
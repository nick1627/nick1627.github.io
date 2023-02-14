/*jshint esversion: 7 */

class Orbit{
    constructor(LongOfAscNode, Inclination, ArgOfPe, SemimajorAxis, Eccentricity){
        this.LongOfAscNode = LongOfAscNode;
        this.Inclination = Inclination;
        this.ArgOfPe = ArgOfPe;
        this.a = SemimajorAxis;
        this.e = Eccentricity;

        
    }


    updateParameters(){
        
        let Omega = document.getElementById("LongOfAscNodeSlider").value;
        let i = document.getElementById("InclinationSlider").value;
        let omega = document.getElementById("ArgOfPeSlider").value;
    
        Omega = Omega*Math.PI/180; //convert angles to "radians".
        i = i*Math.PI/180;
        omega = omega*Math.PI/180;
    
        let a = document.getElementById("aSlider").value;
        a = a*10**4;
        let e = document.getElementById("eSlider").value;
        
        // let Play = document.getElementById("PlayButton").value;
        // let PlaySpeed = document.getElementById("SpeedSlider").value;
    
        this.LongOfAscNode = Omega;
        this.Inclination = i;
        this.ArgOfPe = omega;
        this.a = a;
        this.e = e;

        return;
    }

    getPlotData(){
        let AxisLimit = 2*10**5;
        let OrbitPath = this.getPath()

        let plotData = []

        let OrbitData = ({
            type: "scatter3d",
            mode: "lines",
            name: "Orbit",
            x: OrbitPath[0],
            y: OrbitPath[1],
            z: OrbitPath[2],

            line: {
                width: 6,
                color: "paleblue",
                //reversescale: false
            }
        });

        plotData.push(OrbitData)

        let referenceLine = new ReferenceLine("Reference", "x", 2*10**5, "red");
        plotData.push(referenceLine.getPlotData());
        

        let Omega = this.LongOfAscNode;
        let i = this.Inclination;
        let omega = this.ArgOfPe;

        let OmegaMatrix = math.matrix([[Math.cos(Omega), Math.sin(Omega), 0], [-Math.sin(Omega), Math.cos(Omega), 0], [0, 0, 1]]);
        let iMatrix = math.matrix([[1, 0, 0], [0, Math.cos(i), Math.sin(i)], [0, -Math.sin(i), Math.cos(i)]]);
        let omegaMatrix = math.matrix([[Math.cos(omega), Math.sin(omega), 0], [-Math.sin(omega), Math.cos(omega), 0], [0, 0, 1]]);

        OmegaMatrix = math.transpose(OmegaMatrix);
        iMatrix = math.transpose(iMatrix);
        omegaMatrix = math.transpose(omegaMatrix);

        let ascendingNodeLine = new ReferenceLine("ANode", "x", 2*10**5, "yellow");
        let secondLine = new ReferenceLine("mid", "y", 2*10**5, "orange");
        let thirdLine = new ReferenceLine("Pe", "x", 2*10**5, "green")

        let totalMatrix = OmegaMatrix;
        plotData.push(ascendingNodeLine.getPlotData(totalMatrix))
        totalMatrix = math.multiply(totalMatrix, iMatrix);
        plotData.push(secondLine.getPlotData(totalMatrix))
        totalMatrix = math.multiply(totalMatrix, omegaMatrix)
        plotData.push(thirdLine.getPlotData(totalMatrix))
        

        // let Node1 = [[-AxisLimit], [0], [0]];
        // let Node2 = [[AxisLimit], [0], [0]];
        
        // Node1 = math.multiply(OmegaMatrix, Node1);
        // Node2 = math.multiply(OmegaMatrix, Node2);

        // //console.log(ANode1);

        // let AscendingNodeData = ({
        //     type: "scatter3d",
        //     mode: "lines",
        //     name: "ANode",
        //     x: [Node1.subset(math.index(0,0)), Node2.subset(math.index(0,0))],
        //     y: [Node1.subset(math.index(1,0)), Node2.subset(math.index(1,0))],
        //     z: [Node1.subset(math.index(2,0)), Node2.subset(math.index(2,0))],


        //     line: {
        //         width: 6,
        //         color: "yellow",
        //         //reversescale: false
        //     }
        // });

        // Node1 = [[-AxisLimit], [0], [0]];
        // Node2 = [[AxisLimit], [0], [0]];

        // Node1 = math.multiply(omegaMatrix, Node1);
        // Node2 = math.multiply(omegaMatrix, Node2);

        // Node1 = math.multiply(iMatrix, Node1);
        // Node2 = math.multiply(iMatrix, Node2);

        // Node1 = math.multiply(OmegaMatrix, Node1);
        // Node2 = math.multiply(OmegaMatrix, Node2);
        

        // let PeriapsisData = ({
        //     type: "scatter3d",
        //     mode: "lines",
        //     name: "Pe",
        //     x: [Node1.subset(math.index(0,0)), Node2.subset(math.index(0,0))],
        //     y: [Node1.subset(math.index(1,0)), Node2.subset(math.index(1,0))],
        //     z: [Node1.subset(math.index(2,0)), Node2.subset(math.index(2,0))],


        //     line: {
        //         width: 6,
        //         color: "blue",
        //     }
        // });
     
        // return [OrbitData, AscendingNodeData, PeriapsisData];
        return plotData;
    }

    getPath(){
        //gets orbit path
        let a = this.a;
        let e = this.e;
        //first create x values.
        let n = 1000;
        let x = [];
        let y = [];
        let z = [];
        for (let i = 0; i <= n; i++){
            x.push(-a + i*(2*a/n));
            y.push(Math.sqrt((a**2 - x[i]**2)*(1 - e**2)));
            z.push(0);
        }
        for (let i = 0; i <= n; i++){
            x.push(a - i*(2*a/n));
            y.push(-Math.sqrt((a**2 - x[i]**2)*(1 - e**2)));
            z.push(0);
        }
        for (let i = 0; i < x.length; i++){
            x[i] = x[i] - a*e; //translate so origin is a focus.
        }

        let Path = this.transform(x, y, z);

        return Path;
    }

    transform(x, y, z){
        //transforms orbit points into actual 3d position
        let Omega = this.LongOfAscNode;
        let i = this.Inclination;
        let omega = this.ArgOfPe;
        
        

        let OmegaMatrix = math.matrix([[Math.cos(Omega), Math.sin(Omega), 0], [-Math.sin(Omega), Math.cos(Omega), 0], [0, 0, 1]]);
        let iMatrix = math.matrix([[1, 0, 0], [0, Math.cos(i), Math.sin(i)], [0, -Math.sin(i), Math.cos(i)]]);
        let omegaMatrix = math.matrix([[Math.cos(omega), Math.sin(omega), 0], [-Math.sin(omega), Math.cos(omega), 0], [0, 0, 1]]);

        let RotationMatrix = math.multiply(omegaMatrix, math.multiply(iMatrix, OmegaMatrix));
        
        RotationMatrix = math.transpose(RotationMatrix);
        
        let CurrentVector;
        let ResultVector;
        let NewX = [];
        let NewY = []; 
        let NewZ = [];


        for (let i = 0; i < x.length; i++){
            CurrentVector = math.matrix([[x[i]], [y[i]], [z[i]]]);
            ResultVector = math.multiply(RotationMatrix, CurrentVector);

            NewX.push(ResultVector.subset(math.index(0, 0)));
            NewY.push(ResultVector.subset(math.index(1, 0)));
            NewZ.push(ResultVector.subset(math.index(2, 0)));
        }
        return [NewX, NewY, NewZ];
    }

    
}

/**
 * Reference line class.  Allows plotting of a reference line
 * against which to draw angles.
 */
class ReferenceLine{
    /**
     * Create reference line
     * @param {String} name The name of the line (for the key)
     * @param {String} startAxis "x", "y" or "z"
     * @param {Number} axisLimit Line goes from -axisLimit to +axisLimit in 3D
     * @param {String} colour The colour of the line
     */
    constructor(name, startAxis, axisLimit, colour){
        this.l = axisLimit;
        this.axis = startAxis;
        this.name = name;
        this.colour = colour;
    }
    /**
     * Get the data for plotting the line
     * @param {math.matrix} rotationMatrix the matrix to move the line from the x-axis to its desired position
     */
    getPlotData(rotationMatrix=null){
        let r1;
        if (this.axis=="x"){
            r1 = math.matrix([-this.l, 0, 0]);

        }else{
            r1 = math.matrix([0, -this.l, 0])
        }

        if (rotationMatrix != null){
            r1 = math.multiply(rotationMatrix, r1);
        }
       

        let lineData = ({
            type: "scatter3d",
            mode: "lines",
            name: this.name,
            x: [0, -r1.get([0])],
            y: [0, -r1.get([1])],
            z: [0, -r1.get([2])],


            line: {
                width: 6,
                color: this.colour,
            }
        });

        return lineData;
    }
}

class Body{
    constructor(name, position, colour, size){
        this.name = name;
        this.colour = colour;
        this.position = position;
        this.size = size;
    }
    getPlotData(){
        let pointData = ({
            type: "scatter3d",
            mode: "points",
            name: this.name,
            x: [this.position[0]],
            y: [this.position[1]],
            z: [this.position[2]],

            //ResultVector.subset(math.index(0, 0))

            line: {
                width: this.size,
                color: this.colour,
                //reversescale: false
            }
        });
        return pointData;
    }
}

class Angle{
    /**
     * Represents an 'angle' to plot on the 3d graph.
     */
    constructor(centre, axisVector, zeroAngleVector, angle, linearSize, numPoints){
        this.centre = centre;
        this.axisVector = math.norm(axisVector);
        this.zeroAngleVector = math.mulitply(math.norm(zeroAngleVector), linearSize);
        this.angle = angle;
        this.numPoints = numPoints; //the higher the detail, the more triangles make up the resultant sector thingy
        this.anglePoints = this.getPoints();
    }
    updateAngle(newAngle){
        this.angle = newAngle;
        this.updatePoints();
    }
    updatePoints(){
        this.anglePoints = this.getPoints();
    }
    
    getPoints(){
        let littleAngle = this.angle/(this.numPoints-1);
        let R = this.getRotationMatrix(this.axisVector, littleAngle);

        this.anglePoints.push(math.add(this.centre, this.zeroAngleVector));
    
        var currentVector = this.zeroAngleVector;

        for (let i = 1; i < this.numPoints; i++){
            currentVector = math.multiply(R, currentVector)
            this.anglePoints.push(math.add(this.centre, currentVector))
        }
    }

    /**
     * Compute the rotation matrix for a rotation by an angle about an axis
     * @param {math.matrix} rotationAxis The axis about which to rotate
     * @param {Number} rotationAngle The amount by which to rotate in radians
     * @returns {math.matrix} The rotation matrix is returned
     */
    getRotationMatrix(rotationAxis, rotationAngle){
        let cosTheta = math.cos(rotationAngle);
        let sinTheta = math.sin(rotationAngle);

        var rotationMatrix = cosTheta*math.identity(3);
        var x = rotationAxis.get[0];
        var y = rotationAxis.get[1];
        var z = rotationAxis.get[2];
        var cpMatrix = math.matrix([[0, -z, y],[z, 0, -x],[-y, x, 0]]);
        rotationMatrix = math.add(rotationMatrix, (math.mulitply(cpMatrix, sinTheta)));
        rotationMatrix = math.add(rotationMatrix, (math.mulitply(math.multiply(rotationAxis, math.transpose(rotationAxis)), (1-cosTheta))));

        return rotationMatrix;
    }

    // /**
    //  * Compute outer product between two vectors
    //  * @param {math.matrix} v1 the first vector
    //  * @param {math.matrix} v2 the second vector
    //  */
    // getOuterProduct(v1, v2){
    //     let ans = math.matrix()
    // }

    /**
     * Get data for drawing the angles on the graph
     */
    getPlotData(){
        if (this.angle != 0){
            let drawData = ({
                type: "mesh3d",
                x: [this.centre.get([0]), this.anglePoints[0].get([0])],
                y: [this.centre.get([1]), this.anglePoints[0].get([1])],
                z: [this.centre.get([2]), this.anglePoints[0].get([2])],
                i: [],
                j: [],
                k: [],
                facecolor: Array(this.anglePoints.length-1).fill("#aeedd3"),
            });
    
            let length = this.anglePoints.length;
    
    
            for (let i = 1; i < length; i+=1 ){
                drawData.x.push(this.anglePoints[i].get([0]));
                drawData.y.push(this.anglePoints[i].get([1]));
                drawData.z.push(this.anglePoints[i].get([2]));
                drawData.i.push(0);
                drawData.j.push(i);
                drawData.k.push(i+1);
            }
    
            return drawData;
        }else{
            return null;
        }
    }
}

class Graph3D{
    constructor(name){
        this.name = name;
    }


    setLayout(sometitlex, sometitley, sometitlez, AxisLimit){
        //set layout of graphs. 
        
        let new_layout = {//layout of 3D graph
            //showlegend: false,
            //showscale: false,
            uirevision: 'dataset',
            margin: {
                l: 1, r: 1, b: 10, t: 1, pad: 0
            },
            dragmode: 'turntable',
            legend: {
                x: 0.99,
                y: 0.01,
                xanchor: "right",
                yanchor: "bottom",
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
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


    newPlot(objectList){
        let graphData = objectList[0].getPlotData()
        if (graphData.length > 1){
            for (let i = 1; i<objectList.length; i++){
                graphData.push(objectList[i].getPlotData())
            }
        }
        Plotly.purge("plot3D");
        Plotly.newPlot("plot3D", graphData, this.setLayout('x', 'y', 'z', 2*10**5));
    }

    updatePlot(objectList){
        let graphData = objectList[0].getPlotData()
        if (graphData.length > 1){
            for (let i = 1; i<objectList.length; i++){
                graphData.push(objectList[i].getPlotData())
            }
        }

        Plotly.react("plot3D", graphData, this.setLayout('x', 'y', 'z', 2*10**5));
    }
}


function GetRotationMatrix(u, Theta){
    //u must be a unit vector - could deal with that here - yeah lets deal with that here.
    //theta is the angle anticlockwise in a right hand sense by which to rotate by
    let Magu = ((u[0]**2 + u[1]**2 + u[2]**2)**0.5);
    if (Magu != 1){
        //Need to turn u into a unit vector 
        for (i = 0; i < u.length; i++){
            u[i] = u[i]/Magu;
        }
    }

    //may need to transpose u initially... ok I think I dealt with that.
    
    
    let CPMatrix = math.matrix([[0, -u[2], u[1]], [u[2], 0, -u[0]], [-u[1], u[0], 0]]);//indexing here may be broken
    u = math.matrix([[u[0]], [u[1]], [u[2]]]);
    let uOuterProduct = math.multiply(u, math.transpose(u));

    let R = math.cos(Theta)*math.identity(3) + math.sin(Theta)*CPMatrix + (1 - math.cos(Theta))*(uOuterProduct);
    return R;
}




function GetReferenceAxis(AxisLimit){
    let AxisData = ({
        type: "scatter3d",
        mode: "lines",
        name: "Reference Direction",
        x: [0, AxisLimit],
        y: [0, 0],
        z: [0, 0],

        line: {
            width: 3,
            color: "red"
            //reversescale: false
        }
    });
    return AxisData;
}

function GetCartesianAxes(AxisLimit){
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

function Main(PlotNew = false){
    let AxisLimit = 2*10**5;
    let NewVariables = GetNewInputs();
    let Omega = NewVariables[0];
    let i = NewVariables[1];
    let omega = NewVariables[2];
    let a = NewVariables[3];
    let e = NewVariables[4];
    let Play = NewVariables[5];
    let PlaySpeed = NewVariables[6];

    let OrbitA = new Orbit(Omega, i, omega, a, e);
    let OrbitPath = OrbitA.GetPath();
    let PlotData = OrbitA.GetPlotData(OrbitPath, AxisLimit);

    PlotData.push(GetReferenceAxis(AxisLimit));

    // let TriangleOne = new Triangle([0, 0, 0], [20000, 20000, 20000], [-10000, 20000, -40000]);
    // let TriangleData = TriangleOne.GetTriangleData();
    // PlotData.push(TriangleData);
    // let AxisData = GetCartesianAxes(AxisLimit);
    // PlotData.push(AxisData[0]);
    // PlotData.push(AxisData[1]);
    // PlotData.push(AxisData[2]);

    if (PlotNew){
        OrbitA.newPlot("plot3D", PlotData, AxisLimit);
    }else{
        OrbitA.updatePlot("plot3D", PlotData, AxisLimit);
    }
}

class PageManager{
    constructor(){
        // create graph
        this.graph3D = new Graph3D("plot3D")

        this.orbit = new Orbit()
        this.sun = new Body("Star", [0, 0, 0], "yellow", 40)
    }

    new(){
        this.orbit.updateParameters();
        this.graph3D.newPlot([this.orbit, this.sun])
    }

    update(){
        this.orbit.updateParameters();
        this.graph3D.updatePlot([this.orbit, this.sun])
    }
}




function initialise() {
    let manager = new PageManager();

    $('#LongOfAscNodeSlider').on("input", function(){
        //update plots when value changed
        //update slider text
        $("#" + $(this).attr("id") + "Display").text($(this).val() + $("#" + $(this).attr("id") + "Display").attr("data-unit"));
        //update graph
        manager.update();
    });

    $('#InclinationSlider').on("input", function(){
        //update plots when value changed
        //update slider text
        $("#" + $(this).attr("id") + "Display").text($(this).val() + $("#" + $(this).attr("id") + "Display").attr("data-unit"));
        //update graph
        manager.update();
    });

    $('#ArgOfPeSlider').on("input", function(){
        //update plots when value changed
        //update slider text
        $("#" + $(this).attr("id") + "Display").text($(this).val() + $("#" + $(this).attr("id") + "Display").attr("data-unit"));
        //update graph
        manager.update();
    });

    $('#aSlider').on("input", function(){
        //update plots when value changed
        //update slider text
        $("#" + $(this).attr("id") + "Display").text($(this).val() + $("#" + $(this).attr("id") + "Display").attr("data-unit"));
        //update graph
        manager.update();
    });

    $('#eSlider').on("input", function(){
        //update plots when value changed
        //update slider text
        $("#" + $(this).attr("id") + "Display").text($(this).val() + $("#" + $(this).attr("id") + "Display").attr("data-unit"));
        //update graph
        manager.update();
    });

    $('#InclinationSlider').on("input", function(){
        //update plots when value changed
        //update slider text
        $("#" + $(this).attr("id") + "Display").text($(this).val() + $("#" + $(this).attr("id") + "Display").attr("data-unit"));
        //update graph
        manager.update();
    });

    // $('#PlayButton').on("click", function(){

    //     if (document.getElementById("PlayButton").value == "false"){
    //         $('#PlayButton').html("Pause");
    //         document.getElementById("PlayButton").value = "true";
    //         Main();
    //     }else{
    //         $('#PlayButton').html("Play");
    //         window.cancelAnimationFrame(ID);
    //         document.getElementById("PlayButton").value = "false";
    //     }
    // });

    // $('#SpeedSlider').on("input", function(){
    //     //update plots when value changed
    //     //update slider text
    //     $("#" + $(this).attr("id") + "Display").text($(this).val() + $("#" + $(this).attr("id") + "Display").attr("data-unit"));
    //     //update graph
    //     Main();
    // });

    manager.new(); //update plots upon setup.  This is the first time graphs are run upon opening the page
}

$(document).ready(initialise); //Load initialise when document is ready.
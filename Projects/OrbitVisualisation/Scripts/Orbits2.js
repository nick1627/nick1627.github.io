/*jshint esversion: 7 */

class Orbit{
    constructor(manager){
        this.manager = manager; 
    }

    getPlotData(){
        let OrbitPath = this.getPath()

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
            }
        });
        
        return OrbitData;
    }

    getPath(){
        //gets orbit path
        let a = this.manager.a;
        let e = this.manager.e;
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
        // let Omega = this.manager.LongOfAscNode;
        // let i = this.manager.Inclination;
        // let omega = this.manager.ArgOfPe;
        
        let OmegaMatrix = this.manager.OmegaMatrix;
        let iMatrix = this.manager.iMatrix;
        let omegaMatrix = this.manager.omegaMatrix;

       
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
class ReferenceLines{
    /**
     * Create reference lines
     * @param {String} name The name of the line (for the key)
     * @param {Number} axisLimit Line goes from -axisLimit to +axisLimit in 3D
     * @param {String} colour The colour of the line
     */
    constructor(name, axisLimit, colour){
        this.l = axisLimit;
        this.name = name;
        this.colour = colour;
        this.rotationMatrix = math.matrix([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
    }
    getPoints(){
        let r1, r2;
       
        r1 = math.matrix([this.l, 0, 0]);

        r2 = math.matrix([0, this.l, 0]);


       
        r1 = math.multiply(this.rotationMatrix, r1);
        r2 = math.multiply(this.rotationMatrix, r2);
        

        return [r1, r2];
    }
    /**
     * Get the data for plotting the line
     * @param {math.matrix} rotationMatrix the matrix to move the line from the x-axis to its desired position
     */
    getPlotData(rotationMatrix=null){
        if (rotationMatrix!=null){
            this.rotationMatrix = rotationMatrix;
        }
        let points = this.getPoints();
        let r1 = points[0];
        let r2 = points[1];
       

        let firstLineData = ({
            type: "scatter3d",
            mode: "lines",
            name: this.name,
            x: [0, r1.get([0])],
            y: [0, r1.get([1])],
            z: [0, r1.get([2])],


            line: {
                width: 6,
                color: this.colour,
            }
        });

        let secondLineData = ({
            type: "scatter3d",
            mode: "lines",
            name: this.name,
            x: [0, r2.get([0])],
            y: [0, r2.get([1])],
            z: [0, r2.get([2])],


            line: {
                width: 6,
                color: this.colour,
            }
        });

        return [firstLineData, secondLineData];
    }
}


class Body{
    /**
     * Create an astronomical body to plot (a point with a position)
     * @param {String} name the name of the body
     * @param {Array{Number}} position Vector position of body
     * @param {String} colour the colour of the body
     * @param {Number} size the size of the point to draw
     */
    constructor(name, position, colour, size){
        this.name = name;
        this.colour = colour;
        this.position = position;
        this.size = size;
    }
    /**
     * Get the data for plotting the body with Plotly
     */
    getPlotData(){
        let pointData = ({
            type: "scatter3d",
            mode: "points",
            name: this.name,
            x: [this.position[0]],
            y: [this.position[1]],
            z: [this.position[2]],

            line: {
                width: this.size,
                color: this.colour,
            }
        });
        return pointData;
    }
}


class Angle{
    /**
     * Represents an 'angle' to plot on the 3d graph.
     * @param {math.matrix} centre the centre of the angle
     * @param {math.matrix} axisVector the rotation axis
     * @param {math.matrix} zeroAngleVector the vector indicating zero angle
     * @param {Number} angle the angle in radians
     * @param {Number} linearSize radius of angle
     * @param {Number} numPoints the number of points that make up the angle 
     * @param {String} colour the colour of the angle drawn
     */
    constructor(centre, axisVector, zeroAngleVector, angle, linearSize, numPoints, colour){
        this.centre = centre;
        this.axisVector = this.normalise(axisVector);
        this.zeroAngleVector = math.multiply(this.normalise(zeroAngleVector), linearSize);
        this.angle = angle;
        this.numPoints = numPoints; //the higher the detail, the more triangles make up the resultant sector 
        this.length = linearSize;
        this.colour = colour;
        this.updatePoints();
    }
    updateAngle(newAngle, axisVector, zeroAngleVector=null){

        this.angle = newAngle;
        this.axisVector = this.normalise(axisVector);
        if (zeroAngleVector!=null){
            this.zeroAngleVector = math.multiply(this.normalise(zeroAngleVector), this.length);;
        }
        this.updatePoints();
    }
    updatePoints(){
        this.anglePoints = this.getPoints();
    }
    normalise(vector){
        return math.multiply(vector, 1/math.norm(vector))
    }
    
    getPoints(){
        let littleAngle = this.angle/(this.numPoints-1);
        // let R = this.getRotationMatrix(this.axisVector, littleAngle);
        // console.log(math.det(R))

        // let anglePoints = [];
        // anglePoints.push(math.add(this.centre, this.zeroAngleVector));
    
        // let currentVector = this.zeroAngleVector;

        // for (let i = 1; i < this.numPoints; i++){
        //     currentVector = math.multiply(R, currentVector)
        //     anglePoints.push(math.add(this.centre, currentVector))
        // }

        let anglePoints = []
        anglePoints.push(math.add(this.centre, this.zeroAngleVector));

        let currentVector = this.zeroAngleVector;

        let cosTheta = math.cos(littleAngle);
        let sinTheta = math.sin(littleAngle);
        for (let i = 1; i < this.numPoints; i++){
            currentVector = math.add(math.add(math.multiply(cosTheta, currentVector), math.multiply(math.cross(this.axisVector, currentVector), sinTheta)), math.multiply(math.multiply(this.axisVector, math.dot(this.axisVector, currentVector)), (1-cosTheta)))
            anglePoints.push(math.add(this.centre, currentVector))
        }

        return anglePoints;
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

        let rotationMatrix = math.multiply(math.identity(3), cosTheta);
        let x = rotationAxis.get([0]);
        let y = rotationAxis.get([1]);
        let z = rotationAxis.get([2]);
        let cpMatrix = math.matrix([[0, -z, y],[z, 0, -x],[-y, x, 0]]);
        rotationMatrix = math.add(rotationMatrix, (math.multiply(cpMatrix, sinTheta)));
        rotationMatrix = math.add(rotationMatrix, (math.multiply(math.multiply(rotationAxis, math.transpose(rotationAxis)), (1-cosTheta))));

        return rotationMatrix;
    }


    /**
     * Get data for drawing the angles on the graph
     */
    getPlotData(){

        let drawData = ({
            type: "mesh3d",
            x: [this.centre.get([0]), this.anglePoints[0].get([0])],
            y: [this.centre.get([1]), this.anglePoints[0].get([1])],
            z: [this.centre.get([2]), this.anglePoints[0].get([2])],
            i: [],
            j: [],
            k: [],
            facecolor: Array(this.anglePoints.length-1).fill(this.colour),
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


    newPlot(plotDataList){
       
        Plotly.purge("plot3D");
        Plotly.newPlot("plot3D", plotDataList, this.setLayout('x', 'y', 'z', 2*10**5));
    }

    updatePlot(plotDataList){

        Plotly.react("plot3D", plotDataList, this.setLayout('x', 'y', 'z', 2*10**5));
    }
}


class PageManager{
    constructor(){
        //update input parameters
        this.updateParameters();
        // create graph
        this.graph3D = new Graph3D("plot3D");

        this.orbit = new Orbit(this);
        this.sun = new Body("Star", [0, 0, 0], "yellow", 40);

        this.firstAxes = new ReferenceLines("Reference", 2*10**5, "red");

        this.secondAxes = new ReferenceLines("ANode", 2*10**5, "yellow");
        this.thirdAxes = new ReferenceLines("mid", 2*10**5, "orange");
        this.fourthAxes = new ReferenceLines("Pe", 2*10**5, "green");

        this.OmegaAngle = new Angle(math.matrix([0, 0, 0]), math.matrix([0, 0, 1]), math.matrix([1, 0, 0]), this.LongOfAscNode, 50000, 60, "#FFEA80")
        this.iAngle = new Angle(math.matrix([0, 0, 0]), math.matrix([1, 0, 0]), math.matrix([0, 1, 0]), this.Inclination, 50000, 60, "#FF4D6A")
        this.omegaAngle = new Angle(math.matrix([0, 0, 0]), math.matrix([0, 0, 1]), math.matrix([1, 0, 0]), this.ArgOfPe, 50000, 60, "#80EAFF")

    }

    /**
     * get plotting data for all relevant objects
     */
    getPlotData(){
        let plotData = [];

        plotData.push(this.orbit.getPlotData());
        plotData.push(this.sun.getPlotData())

        plotData = plotData.concat(this.firstAxes.getPlotData());


        let OmegaMatrix = math.transpose(this.OmegaMatrix);
        let iMatrix = math.transpose(this.iMatrix);
        let omegaMatrix = math.transpose(this.omegaMatrix);
        

        let totalMatrix = OmegaMatrix;
        plotData = plotData.concat(this.secondAxes.getPlotData(totalMatrix))

        if (this.LongOfAscNode != 0){
            let cross = math.cross(this.firstAxes.getPoints()[0], this.secondAxes.getPoints()[0])
            if (this.LongOfAscNode > Math.PI){
                cross = math.multiply(cross, -1);
            }

            this.OmegaAngle.updateAngle(this.LongOfAscNode, cross)
            plotData.push(this.OmegaAngle.getPlotData())
        }

        totalMatrix = math.multiply(totalMatrix, iMatrix);
        plotData = plotData.concat(this.thirdAxes.getPlotData(totalMatrix))



        totalMatrix = math.multiply(totalMatrix, omegaMatrix)
        plotData = plotData.concat(this.fourthAxes.getPlotData(totalMatrix))


        if (this.Inclination != 0){
            let cross = math.cross(this.secondAxes.getPoints()[1], this.thirdAxes.getPoints()[1])
            if (this.Inclination < 0){
                cross = math.multiply(cross, -1);
            }

            this.iAngle.updateAngle(this.Inclination, cross, this.secondAxes.getPoints()[1])
            plotData.push(this.iAngle.getPlotData())
        }
        

        if (this.ArgOfPe != 0){
            let cross = math.cross(this.thirdAxes.getPoints()[0], this.fourthAxes.getPoints()[0])
            if (this.ArgOfPe > Math.PI){
                cross = math.multiply(cross, -1);
            }

            this.omegaAngle.updateAngle(this.ArgOfPe, cross, this.thirdAxes.getPoints()[0])
            plotData.push(this.omegaAngle.getPlotData())
        }


        
        return plotData;
    }

    new(){
        this.updateParameters();
        this.graph3D.newPlot(this.getPlotData());
    }

    update(){
        this.updateParameters();
        this.graph3D.updatePlot(this.getPlotData());
    }

    updateParameters(){
        let Omega = document.getElementById("LongOfAscNodeSlider").value;
        let i = document.getElementById("InclinationSlider").value;
        let omega = document.getElementById("ArgOfPeSlider").value;

        if (Omega == 360){
            Omega = 0;
        }
        if (omega == 360){
            omega = 0;
        }
    
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

        this.updateMatrices()
    }

    updateMatrices(){
        //transforms orbit points into actual 3d position
        let Omega = this.LongOfAscNode;
        let i = this.Inclination;
        let omega = this.ArgOfPe;
        
        

        this.OmegaMatrix = math.matrix([[Math.cos(Omega), Math.sin(Omega), 0], [-Math.sin(Omega), Math.cos(Omega), 0], [0, 0, 1]]);
        this.iMatrix = math.matrix([[1, 0, 0], [0, Math.cos(i), Math.sin(i)], [0, -Math.sin(i), Math.cos(i)]]);
        this.omegaMatrix = math.matrix([[Math.cos(omega), Math.sin(omega), 0], [-Math.sin(omega), Math.cos(omega), 0], [0, 0, 1]]);

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



    manager.new(); //update plots upon setup.  This is the first time graphs are run upon opening the page
}

$(document).ready(initialise); //run initialise when document is ready.
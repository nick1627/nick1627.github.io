


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
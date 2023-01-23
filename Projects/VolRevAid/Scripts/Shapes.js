class Shape {
    /**
    * Rotate a shape with normal vector (1,0,0) so that it aligns with
    * the given normal vector.
    * @param {String}                   newAxis             "x", "y" or "z", the axis the normal vector will align with
    * @param {Array<math.matrix>}     arrayOfPoints       Array of vectors for points that make up the shape.
    * @returns {Array<math.matrix>}                       Array of vectors for points that make up the shape once rotated
    */
    rotateToNewAxis(normalVector, arrayOfPoints){
        // Assume points are aligned with x axis initially

        let rotationMatrix

        if (!(math.norm(math.compare(normalVector, math.matrix([1, 0, 0]))) == 0)){
            if (math.norm(math.compare(normalVector, math.matrix([0, 1, 0]))) == 0){
                rotationMatrix = math.matrix([[0, -1, 0], [1, 0, 0], [0, 0, 1]]);
            }else{
                rotationMatrix = math.matrix([[0, 0, -1], [0, 1, 0], [1, 0, 0]]);
            }
            for (let i = 0; i < arrayOfPoints.length; i++){
                arrayOfPoints[i] = math.multiply(rotationMatrix, arrayOfPoints[i]);
            }
        }
        return arrayOfPoints
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
    * @param {math.matrix}    normalVector   Normal vector of circle in 3d space
    * @param {Number}   radius      The radius of the circle
    * @param {Number}   angle       Angle between successive 'spokes' of circle in degrees
    */
    constructor(centre, normalVector, radius, angle){
        super();
        this.centre = centre;
        this.normalVector = normalVector
        this.radius = radius;
        this.angle = angle;//*Math.PI/180;
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
        circumferencePoints = this.rotateToNewAxis(this.normalVector, circumferencePoints)
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
            facecolor: Array(this.circumferencePoints.length-1).fill("#aeedd3"),
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
    * @param {math.matrix}    axialVector     Vector from centre of first circle to centre of second
    * @param {Number}   radius      The radius of the circles
    * @param {Number}   angle       Angle between successive 'spokes' of circles in degrees
    */

    constructor(origin, axialVector, radius, angle){
        super();
        this.origin = origin;
        this.axialVector = axialVector;
        this.radius = radius;
        this.angle = angle*Math.PI/180;
        this.thickness = math.norm(axialVector);
        this.normalVector = math.round(math.divide(axialVector, this.thickness))
        

        this.firstCircle = new Circle(this.origin, this.normalVector, this.radius, this.angle);
        this.secondCircle = new Circle(math.add(this.origin, this.axialVector), this.normalVector, this.radius, this.angle);

    }

    getVolume(){
        return Math.PI*this.radius*this.radius*this.thickness
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
            facecolor: Array(2*(this.firstCircle.circumferencePoints.length-1)).fill("#b9d4f9"),
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


class ChainableCylinder extends Cylinder{
    /**
    * Create cylinder (two circles with connecting tube)
    * @param {math.matrix}    origin      Coordinates of centre of first circle
    * @param {math.matrix}    axialVector     Vector from centre of first circle to centre of second
    * @param {Number}   angle       Angle between successive 'spokes' of circles in degrees
    * @param {Graph}    graph       The graph to fit the cylinders to
    * @param {Number}   numCylinders the number of cylinders in the chain
    * @param {Number}   cylinderIndex the index of the current cylinder
    * @param {ChainableCylinder} previousCylinder a reference to the previous cylinder (optional)

    */
    constructor(origin, axialVector, angle, graph, numCylinders, cylinderIndex = 0, previousCylinder = null){
        let radius = graph.equation3D(origin)
        super(origin, axialVector, radius, angle)

        this.previousCylinder = previousCylinder
        this.cylinderIndex = cylinderIndex
        if (cylinderIndex < (numCylinders - 1)){
            this.nextCylinder = new ChainableCylinder(math.add(origin, axialVector), axialVector, angle, graph, numCylinders, cylinderIndex + 1, this)
        }else{
            this.nextCylinder = null
        }
    }

    getChainVolume(){
        if (this.nextCylinder == null){
            return this.getVolume()
        }else{
            return this.getVolume + this.nextCylinder.getChainVolume()
        }
    }

    getChainDrawData(){
        if (this.nextCylinder == null){
            return this.getDrawData()
        }else{
            return this.getDrawData().concat(this.nextCylinder.getChainDrawData())
        }
    }

}
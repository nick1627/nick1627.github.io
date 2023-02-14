class StringNode{
    /**
     * Create a section of a length of string
     */
    constructor(prevNode, nextNode, nodeMass, nodeLength, startPosition){
        this.previous = prevNode;
        this.nextNode = next;
        this.mass = nodeMass;
        this.length = nodeLength;
        this.r = startPosition;
    }

}

class Air{
    constructor(density){
        this.density = density;
    }
    getDensity(position){
        return this.density;
    }
}

class Balloon{
    constructor(startPosition, positionLimits){
        this.r = startPosition;
        this.v = 0;
        this.m = 0.01;
        this.limits = positionLimits;
    }
    move(air){
        // dimension problems with this vvv
        let a = 9.81*(Math.mulitply((air.getDensity(this.r)/this.m), this.v) - 1)
    }
}
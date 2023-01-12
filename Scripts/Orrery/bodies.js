import {deg2rad} from "./Support/mathsFunctions.js";
import {G} from "./Support/scientificConstants.js";

class Body{
    constructor(name, mass, position, velocity){
        // A general astronomical body
        this.m = mass;
        this.r = position;
        this.v = velocity;
        this.name = name;
    }
    getPosition(){
        return this.r
    }
    getVelocity(){
        return this.v
    }
}

class LargeBody extends Body{
    constructor(bodyName, bodyParent, mass, radius, eccentricity, semimajorAxis, inclination, longAscNode, argPeriapsis, meanAnomaly){
        // 
        // A Planet moves on 'rails', i.e, it follows the Keplerian orbit it
        // is initialised with, forever.  For this, we do not need the state vector,
        // just the Keplerian orbital elements.
        //
        super(bodyName, mass, position, velocity);

        this.parent = bodyParent;
        this.children = [];
        this.radius = radius;
        
        // Orbital parameters
        this.e = eccentricity;
        this.a = semimajorAxis;
        this.i = deg2rad(longAscNode);
        this.longAN = deg2rad(longAscNode);
        this.argPer = argPeriapsis;
        this.meanAnom = meanAnomaly;


        if (this.parent != null){
            // Compute some useful values for later.  See "Position as a function of time"
            // on wikipedia: https://en.wikipedia.org/wiki/Kepler%27s_laws_of_planetary_motion#Position_as_a_function_of_time
            this.GM = G*this.bodyParent.m;
            // #compute the period using Kepler's third law
            this.T = 2*Math.PI*Math.sqrt(this.a**3/this.GM);
            // now compute mean motion (mean angle per unit time)
            this.n = 2*Math.PI/this.T;

            // calculate transformation matrices here?

        }

        
        // #set the initial (default) position
        this.currentPosition = this.updatePosition(0);

         


    }

    addChild(child){
        // Add child to list of children (bodies orbiting this body)
        this.children.push(child);
    }

    updateParent(){
        if (this.parent!=null){
            this.parent.addChild(this);
        }
    }

    keplersEquation(E, M, epsilon){
        // This is Kepler's equation (rearranged)
        // See https://en.wikipedia.org/wiki/Kepler%27s_laws_of_planetary_motion#Position_as_a_function_of_time
        return M - epsilon*Math.sin(E)

    }

    keplersDerivative(E, M, epsilon){
        // derivative of Kepler's equation
        return -epsilon*Math.cos(E)
    }

}
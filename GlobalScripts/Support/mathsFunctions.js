function deg2rad(theta){
    // Convert angle in degrees to radians
    return theta*Math.PI/180;
}

function rad2deg(theta){
    // convert angle in radians to degrees
    return theta*180/Math.PI;
}


export {deg2rad, rad2deg};
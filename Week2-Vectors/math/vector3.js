/*
 * An "object" representing a 3d vector to make operations simple and concise.
 *
 * Similar to how we work with plain numbers, we will work with vectors as
 * an entity unto itself.  Note the syntax below: var Vector3 = function...
 * This is different than you might be used to in most programming languages.
 * Here, the function is meant to be instantiated rather than called and the
 * instantiation process IS similar to other object oriented languages => new Vector3()
 */

class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        // make sure to set a default value in case x, y, or z is not passed in
    }

    //----------------------------------------------------------------------------- 
    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;

        return this;
    }

    //----------------------------------------------------------------------------- 
    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    //----------------------------------------------------------------------------- 
    copy(other) {
        this.x = other.x;
        this.y = other.y;
        this.z = other.z;

        return this;
    }

    //----------------------------------------------------------------------------- 
    negate() {
        // multiply 'this' vector by -1
        // This SHOULD change the values of this.x, this.y, and this.z
        this.x = this.x * -1;
        this.y = this.y * -1;
        this.z = this.z * -1;

        return this;
    }

    //----------------------------------------------------------------------------- 
    add(v) {
        this.x = this.x + v.x;
        this.y = this.y + v.y;
        this.z = this.z + v.z;
        // This SHOULD change the values of this.x, this.y, and this.z
        return this;
    }

    //----------------------------------------------------------------------------- 
    subtract(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        // This SHOULD change the values of this.x, this.y, and this.z
        return this;
    }

    //----------------------------------------------------------------------------- 
    multiplyScalar(scalar) {
        // multiply 'this' vector by "scalar"
        // This SHOULD change the values of this.x, this.y, and this.z
        this.x = this.x * scalar;
        this.y = this.y * scalar;
        this.z = this.z * scalar;

        return this;
    }

    //----------------------------------------------------------------------------- 
    length() {
        // return the magnitude (A.K.A. length) of 'this' vector
        // This should NOT change the values of this.x, this.y, and this.z
        let length = 0;

        length += this.x * this.x;
        length += this.y * this.y;
        length += this.z * this.z;

        length = Math.sqrt(length);

        return length;
    }

    //----------------------------------------------------------------------------- 
    lengthSqr() {
        // return the squared magnitude of this vector ||v||^2
        // This should NOT change the values of this.x, this.y, and this.z

        // There are many occasions where knowing the exact length is unnecessary 
        // and the square can be substituted instead (for performance reasons).  
        // This function should NOT have to take the square root of anything.
        let length = 0;

        length += this.x * this.x;
        length += this.y * this.y;
        length += this.z * this.z;

        //length = Math.sqrt(length);

        return length;
    }

    //----------------------------------------------------------------------------- 
    normalize() {
        // todo - Change the components of this vector so that its magnitude will equal 1.
        // This SHOULD change the values of this.x, this.y, and this.z
        let lengthSqr = this.lengthSqr();
        let ogXSquared = this.x * this.x;
        let ogYSquared = this.y * this.y;
        let ogZSquared = this.z * this.z;

        if (this.length() > 0) {
            this.x = Math.sqrt(ogXSquared / lengthSqr);
            this.y = Math.sqrt(ogYSquared / lengthSqr);
            this.z = Math.sqrt(ogZSquared / lengthSqr);
        }

        return this;
    }

    //----------------------------------------------------------------------------- 
    dot(other) {
        // return the dot product between this vector and "other"
        // This should NOT change the values of this.x, this.y, and this.z
        let dot = 0;

        dot += this.x * other.x;
        dot += this.y * other.y;
        dot += this.z * other.z;

        return dot;
    }

    //============================================================================= 
    // The functions below must be completed in order to receive an "A"


    //----------------------------------------------------------------------------- 
    rescale(newScale) {
        // Change this vector's length to be newScale
        let length = this.length();

        if (length > 0) {
            this.normalize();
            this.multiplyScalar(newScale);
        }

        return this;
    }

    //----------------------------------------------------------------------------- 
    static fromTo(fromPoint, toPoint) {
        if (!(fromPoint instanceof Vector3) || !(toPoint instanceof Vector3)) {
            console.error("fromTo requires two vectors: 'from' and 'to'");
        }

        let result = new Vector3();

        result.x = toPoint.x - fromPoint.x;
        result.y = toPoint.y - fromPoint.y;
        result.z = toPoint.z - fromPoint.z;

        return result;
    }

    //----------------------------------------------------------------------------- 
    static angle(v1, v2) {
        // calculate the angle in degrees between vectors v1 and v2
        // Do NOT change any values on the vectors themselves

        let dot = v1.dot(v2);
        let lengths = v1.length() * v2.length();
        
        if (lengths > 0) {
            let cosAngle = dot / lengths;
            let angleInRadians = Math.acos(cosAngle);
            let angleInDegrees = angleInRadians * (180 / Math.PI);
            return angleInDegrees;
        }

        return 0;
    }

    //----------------------------------------------------------------------------- 
    static project(vectorToProject, otherVector) {
        // return a vector that points in the same direction as "otherVector"
        // but whose length is the projection of "vectorToProject" onto "otherVector"
        // NOTE - neither input vector should be altered

        let otherLengthSqr = otherVector.lengthSqr();

        if (otherLengthSqr > 0) {
            let scale = vectorToProject.dot(otherVector) / otherLengthSqr;

            let result = otherVector.clone();
            result.multiplyScalar(scale);

            return result;
        }

        return new Vector3();
    }
}

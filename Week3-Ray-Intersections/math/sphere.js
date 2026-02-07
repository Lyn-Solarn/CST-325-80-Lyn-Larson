class Sphere {
    constructor(center, radius) {
        // Clone the center vector to avoid external mutations
        if (center instanceof Vector3) {
            this.center = center.clone();
        } else {
            this.center = new Vector3(0, 0, 0); // Default to zero vector if invalid
        }
        if (typeof radius === 'number' && !isNaN(radius)) {
            this.radius = radius;
        } else {
            this.radius = 1; // Default radius if invalid
        }

        // Validate and set default values if necessary
        // - Default center: Zero vector
        // - Default radius: 1
        if (!(this.center instanceof Vector3)) {
            console.warn("Invalid center provided. Setting to default zero vector.");
            this.center = new Vector3(0, 0, 0);
        }
        else if (isNaN(this.center.x) || isNaN(this.center.y) || isNaN(this.center.z)) {
            console.warn("Invalid center components provided. Setting to default zero vector.");
            this.center = new Vector3(0, 0, 0);
        }
        else if (this.center.x === undefined || this.center.y === undefined || this.center.z === undefined) {
            console.warn("Center vector is missing components. Setting to default zero vector.");
            this.center = new Vector3(0, 0, 0);
        }
        else if (this.center.x === null || this.center.y === null || this.center.z === null) {
            console.warn("Center vector components cannot be null. Setting to default zero vector.");
            this.center = new Vector3(0, 0, 0);
        }
        else if (this.center.x === Infinity || this.center.y === Infinity || this.center.z === Infinity) {
            console.warn("Center vector components cannot be infinite. Setting to default zero vector.");
            this.center = new Vector3(0, 0, 0);
        }
        else if (this.center.x === -Infinity || this.center.y === -Infinity || this.center.z === -Infinity) {
            console.warn("Center vector components cannot be negative infinite. Setting to default zero vector.");
            this.center = new Vector3(0, 0, 0);
        }
        else {
            // Center is valid, no action needed
        }

        if (typeof this.radius !== 'number' || isNaN(this.radius)) {
            console.warn("Invalid radius provided. Setting to default value of 1.");
            this.radius = 1;
        }
    }

   /**
    * Determines whether the given ray intersects the sphere and, if so, calculates the intersection details.
    * 
    * A valid intersection satisfies the following conditions:
    * 1. The intersection point is in front of the ray's origin (not behind it).
    * 2. The ray's origin is not inside the sphere.
    */
    raycast(ray) {
        // Initialize the result object with default values
        const result = {
            hit: false,      // Boolean indicating if an intersection occurred
            point: null,     // Vector3 of the intersection point
            normal: null,    // Normal vector at the intersection point
            distance: null,  // Distance from the ray origin to the intersection
        };

        // TODO: Implement the ray-sphere intersection logic

        // Recommended steps:
        // ------------------
        // 1. Understand the math: Review the basics of ray-sphere intersections. The goal is to solve 
        //    for intersection points using the quadratic equation.
        //
        // 2. Identify vectors and setup: Compute the vector from the ray's origin to the sphere's center. 
        //    Use this to derive the quadratic coefficients.
        //
        // 3. Compute the discriminant: Solve the quadratic equation. The discriminant determines if there 
        //    are real solutions and thus potential intersections.
        //
        // 4. Analyze the discriminant:
        //    - If negative, the ray misses the sphere.  Jump to step 7.
        //    - If zero or positive, calculate intersection points.
        //
        // 5. Validate intersections: Ensure the intersection is in front of the ray and the origin is 
        //    outside the sphere.
        //
        // 6. Calculate the normal vector: The normal vector is a unit vector perpendicular to the sphere's 
        //    surface at the intersection point. Hint: you can do it if you know the circle's center and 
        //    the intersection point.  Note that it must be normalized. 
        //
        // 7. Return results: If no valid intersection:
        //      return { hit: false };
        //    If valid intersection:
        //      return { hit: true, point: <Vector3>, normal: <Vector3>, distance: <Number> };

        const originToCenter = Vector3.fromTo(ray.origin, this.center);
        const centerToOrigin = originToCenter.clone().negate();
        const a = ray.direction.dot(ray.direction);
        const b = 2.0 * centerToOrigin.dot(ray.direction);
        const c = centerToOrigin.dot(centerToOrigin) - this.radius * this.radius;
        const discriminant = b * b - 4 * a * c;

        if (discriminant < 0) {
            // Discriminant was negative, so the ray does not intersect the sphere, so whoopdeedoo
            return result;
        } else {
            // if the discrimant doesn't break, then calculate the two potential intersection points
            let sqrtDiscriminant = Math.sqrt(discriminant);
            let t1 = (-b - sqrtDiscriminant) / (2.0 * a);
            let t2 = (-b + sqrtDiscriminant) / (2.0 * a);

            // Check if the intersections are valid (in front of the ray and not inside the sphere)
            let t = null;
            if (t1 > 0 && t2 > 0) {
                t = Math.min(t1, t2); // Take the closer intersection
            } else if (t1 > 0) {
                t = t1;
            } else if (t2 > 0) {
                t = t2;
            }

            if (t !== null) {
                // Calculate the intersection point
                let intersectionPoint = ray.origin.clone().add(ray.direction.clone().multiplyScalar(t));

                // Calculate the normal vector at the intersection point
                let normal = Vector3.fromTo(this.center, intersectionPoint).normalize();
                
                let distance = t; // Distance from the ray origin to the intersection point

                if (distance < 0) {
                    // Intersection is behind the ray's origin, so ignore it
                    return result;
                }

                if (originToCenter.length() < this.radius) {
                    // Ray origin is inside the sphere, so ignore the intersection
                    return result;
                }

                if (normal.length <= 0) {
                    // Normal vector cannot be zero or negative, so ignore the intersection
                    return result;
                }

                // Update the result object with intersection details
                result.hit = true;
                result.point = intersectionPoint;
                result.normal = normal;
                result.distance = t;
            }

        }
        return result;
    }
}

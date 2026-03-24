/*
 * An object representing a Camera with position and orientation.
 */

class Camera {
  constructor(input) {
    // The following two parameters will be used to create the cameraWorldMatrix in this.update()
    this.cameraYaw = 0;
    this.cameraPosition = new Vector3();

    this.cameraWorldMatrix = new Matrix4();

    this.input = input;
  }

  // -------------------------------------------------------------------------
  getViewMatrix() {
    return this.cameraWorldMatrix.clone().inverse();
  }

  // -------------------------------------------------------------------------
  getForward() {
    // - pull out the forward direction from the world matrix and return as a vector
    // - recall that the camera looks in the "backwards" direction
    var forward = new Vector3();
    forward.x = -this.cameraWorldMatrix.elements[8];
    forward.y = -this.cameraWorldMatrix.elements[9];
    forward.z = -this.cameraWorldMatrix.elements[10];

    return forward;
  }

  // -------------------------------------------------------------------------
  update(dt) {
    const currentForward = this.getForward();

    if (this.input.up) {
      // todo #7 - move the camera position a little bit in its forward direction
      let forwardMovement = currentForward.clone().multiplyScalar(0.01);
      this.cameraPosition = this.cameraPosition.clone().add(forwardMovement);
    }

    if (this.input.down) {
      // todo #7 - move the camera position a little bit in its backward direction
      let backwardMovement = currentForward.clone().multiplyScalar(-0.01);
      this.cameraPosition = this.cameraPosition.clone().add(backwardMovement);
    }

    if (this.input.left) {
      // todo #8 - add a little bit to the current camera yaw
      let leftRotation = currentForward.clone().multiplyScalar(0.0001);
      this.cameraYaw = this.cameraPosition.clone().add(leftRotation);
      console.log(this.cameraYaw);
      console.log(this.cameraWorldMatrix);
    }

    if (this.input.right) {
      // todo #8 - subtract a little bit from the current camera yaw
      let rightRotation = currentForward.clone().multiplyScalar(-0.0001);
      this.cameraYaw = this.cameraPosition.clone().add(rightRotation);
      console.log(this.cameraYaw);
      console.log(this.cameraWorldMatrix);

    }

    // todo #7 - create the cameraWorldMatrix from scratch based on this.cameraPosition
    var translationMatrix = new Matrix4().makeTranslation(
      this.cameraPosition.x,
      this.cameraPosition.y,
      this.cameraPosition.z
    );
    this.cameraWorldMatrix = translationMatrix.multiply(this.cameraWorldMatrix);

    // todo #8 - create a rotation matrix based on cameraYaw and apply it to the cameraWorldMatrix
    // (order matters!)
    var rotationMatrix = new Matrix4().makeRotationY(this.cameraYaw);
    this.cameraWorldMatrix = this.cameraWorldMatrix.multiply(rotationMatrix);
}
}

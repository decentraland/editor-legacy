var Events = require('./Events');

let tempMatrix = new THREE.Matrix4();
let group = new THREE.Group();

AFRAME.registerSystem('vrui', {
  init: function () {
    console.log('vrui system')
  }
});

AFRAME.registerSystem('vrcontrols', {
  init: function () {
    this.tick = AFRAME.utils.throttleTick(this.tick, 750, this);
    console.log('vrcontrols')
    this.sceneEl = document.querySelector('a-scene');
    console.log(this.sceneEl)
    if (this.sceneEl.hasLoaded) {
      console.log('vrcontrols loaded')
      this.onSceneLoaded();
    } else {
      this.sceneEl.addEventListener('loaded', this.onSceneLoaded.bind(this));
    }
  },

  onSceneLoaded: function () {
    this.sceneEl.addEventListener('enter-vr', () => {
      this.vrMode = true
    })
    this.sceneEl.addEventListener('exit-vr', () => {
      this.vrMode = false
    })

    this.raycaster = new THREE.Raycaster();
    this.parcelEl = document.querySelector('a-entity#parcel');
    this.intersected = [];
    this.entities = this.getEntities();
    console.log(this.entities)

    /* Events.on('entityadded', () => {
      this.entities = this.setEntities();
    });

    Events.on('dommodified', () => {
      this.entities = this.setEntities();
    }); */

    this.initVRControllers();
  },

  initVRControllers: function () {
    this.leftController = document.createElement('a-entity');
    this.leftController.setAttribute('id', 'left-hand');
    this.leftController.setAttribute('laser-controls', 'hand: left');
    this.leftController.setAttribute('fixed', 'true');
    this.leftController.object3D.standingMatrix = this.sceneEl.renderer.vr.getStandingMatrix();
    this.leftController.addEventListener('triggerdown', this.handleTriggerDown.bind(this));
    this.leftController.addEventListener('triggerup', this.handleTriggerUp.bind(this));
    this.sceneEl.appendChild(this.leftController);

    this.rightController = document.createElement('a-entity');
    this.rightController.setAttribute('id', 'right-hand');
    this.rightController.setAttribute('laser-controls', 'hand: right');
    this.rightController.setAttribute('fixed', 'true');
    this.rightController.object3D.standingMatrix = this.sceneEl.renderer.vr.getStandingMatrix();
    this.rightController.addEventListener('triggerdown', this.handleTriggerDown.bind(this));
    this.rightController.addEventListener('triggerup', this.handleTriggerUp.bind(this));
    this.sceneEl.appendChild(this.rightController);
  },

  update: function () {
    //this.entities = this.setEntities();
    console.log(this.entities)
  },

  tick: function (time, dt) {
    if (!this.vrMode) return

    this.cleanIntersected();
    //console.log(this.intersectedObject)

    this.intersectObjects(this.leftController);
    this.intersectObjects(this.rightController);
  },

  getIntersections: function (controller) {
    tempMatrix.identity().extractRotation(controller.object3D.matrixWorld);
    this.raycaster.ray.origin.setFromMatrixPosition(controller.object3D.matrixWorld);
    this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
    //console.log(this.raycaster.intersectObjects(this.setEntities()))
    console.log(this.getEntities())
    return this.raycaster.intersectObjects(this.getEntities());
    /* console.log(controller.components.raycaster.intersectedEls)
    return controller.components.raycaster.intersectedEls; */
  },
  handleTriggerDown: function (event) {
    console.log('------------- trigger down ---------------')
    var controller = event.target;
    //console.log(controller)
    var intersections = this.getIntersections(controller);
    console.log(intersections)
    if (intersections.length > 0) {
      var intersection = intersections[0];
      /* const isFixed = intersection.getAttribute('fixed');
      if (isFixed) return; */
      console.log(tempMatrix.getInverse(controller.object3D.matrixWorld))
      tempMatrix.getInverse(controller.object3D.matrixWorld);
      var object = intersection.object;
      console.log(object)
      object.matrix.premultiply(tempMatrix);
      object.matrix.decompose(object.position, object.rotation, object.scale);
      object.material.emissive.b = 1;
      //Events.emit('objectselected', intersection);
      controller.object3D.add(object);
      controller.object3D.userData.selected = object;
    }
  },
  handleTriggerUp: function (event) {
    console.log('------------- trigger up ---------------')
    console.log(this.sceneEl)
    var controller = event.target;
    //console.log(controller)
    if (controller.object3D.userData.selected !== undefined) {
      var object = controller.object3D.userData.selected;
      object.matrix.premultiply(controller.object3D.matrixWorld);
      object.matrix.decompose(object.position, object.rotation, object.scale);
      console.log(object)
      object.material.emissive.b = 0;
      //Events.emit('entitydeselected');
      this.setEntities(object)
      /* this.entities = this.setEntities()
      this.entities.push(intersection) */
      //this.parcelEl.appendChild(intersection)
      //Events.emit('entityadded')
      controller.object3D.userData.selected = undefined;
      /*
      console.log(this.parcelEl)
      this.parcelEl.appendChild(intersection);
      console.log(this.parcelEl)
      console.log(this.sceneEl) */
    }
  },
  intersectObjects: function (controller) {
    if (controller.components && controller.components.raycaster && controller.components.line) {
      // Do not highlight when already selected
      if (controller.object3D.userData.selected !== undefined) return;

      var line = controller.components.line.line;
      var intersections = this.getIntersections(controller);
      //console.log(intersections)
      if (intersections.length > 0) {
        var intersection = intersections[0];
        var object = intersection.object;
        console.log(object)
        object.material.emissive.r = 1;
        //AFRAME.utils.entity.setComponentProperty(intersection, 'material.color', 'blue');
        this.intersected.push(object);

        line.scale.z = intersection.distance;
      } else {
        line.scale.z = 5;
      }
    }
  },
  cleanIntersected: function () {
    while (this.intersected.length) {
      var object = this.intersected.pop();
      //console.log(object)
      object.material.emissive.r = 0;
      //AFRAME.utils.entity.setComponentProperty(object, 'material.color', 'green');
    }
  },
  setEntities: function (object) {
    const groups = [...Array.from(this.parcelEl.children).filter(el => el.object3D).map(el => el.object3D), object];
    console.log(groups)
    console.log(groups.map(el => el.children[0]))
    //object.parent.children.push(object.el)
    console.log([...Array.from(this.parcelEl.children).filter(el => el.object3D).map(el => el.object3D), object.parent])
    this.entities = groups
  },
  getEntities: function () {
    if (!this.parcelEl) return;
    //console.log(Array.from(this.parcelEl.children).filter(el => el.object3D).map(el => el.object3D))
    return Array.from(this.parcelEl.children).filter(el => el.object3D).map(el => el.object3D).map(el => el.children[0]);
  },
});

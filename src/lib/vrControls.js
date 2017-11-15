var Events = require('./Events');

let tempMatrix = new THREE.Matrix4();
let group = new THREE.Group();

AFRAME.registerSystem('vrui', {
  init: function () {
    console.log('vrui system')
  }
});

AFRAME.registerComponent('vrcontrols', {
  init: function () {
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

    this.intersected = [];
    this.entities = this.setEntities();
    console.log(this.entities)
    Events.on('entityadded', () => {
      this.entities = this.setEntities();
    });

    this.raycaster = new THREE.Raycaster();
    this.initVRControllers();
  },

  initVRControllers: function () {
    this.leftController = document.createElement('a-entity');
    this.leftController.setAttribute('id', 'left-hand');
    this.leftController.setAttribute('laser-controls', 'hand: left');
    this.leftController.setAttribute('fixed', 'true');
    this.leftController.addEventListener('triggerdown', this.handleTriggerDown.bind(this));
    this.leftController.addEventListener('triggerup', this.handleTriggerUp.bind(this));
    this.sceneEl.appendChild(this.leftController);

    this.rightController = document.createElement('a-entity');
    this.rightController.setAttribute('id', 'right-hand');
    this.rightController.setAttribute('laser-controls', 'hand: right');
    this.rightController.setAttribute('fixed', 'true');
    this.rightController.addEventListener('triggerdown', this.handleTriggerDown.bind(this));
    this.rightController.addEventListener('triggerup', this.handleTriggerUp.bind(this));
    this.sceneEl.appendChild(this.rightController);
  },

  update: function () {
    this.entities = this.setEntities();
    console.log(this.entities)
  },

  tick: function () {
    if (!this.vrMode) return

    //this.cleanIntersected();

    /* this.intersectObjects(this.leftController);
    this.intersectObjects(this.rightController); */
  },

  getIntersections: function (controller) {
    //console.log(controller.components)
    return controller.components.raycaster.intersectedEls;
  },
  handleTriggerDown: function (event) {
    var controller = event.target;
    console.log(controller)
    var intersections = this.getIntersections(controller);
    console.log(intersections)
    if (intersections.length > 0) {
      var intersection = intersections[0];
      const isFixed = intersection.getAttribute('fixed');
      if (isFixed) return;

      console.log(intersection)
      tempMatrix.getInverse(controller.object3D.matrixWorld);
      var object = intersection.object3D;
      console.log(object)
      object.matrix.premultiply(tempMatrix);
      object.matrix.decompose(object.position, object.rotation, object.scale);
      //AFRAME.utils.entity.setComponentProperty(intersection, 'material.emissive.b', 1);
      Events.emit('entityselected', intersection);
      controller.add(intersection);
      controller.object3D.userData.selected = intersection;
    }
  },
  handleTriggerUp: function (event) {
    var controller = event.target;
    console.log(controller)
    if (controller.object3D.userData.selected !== undefined) {
      var intersection = controller.object3D.userData.selected;
      console.log("this is the object from previous grab: ", intersection)
      var object = intersection.object3D;
      object.matrix.premultiply(controller.object3D.matrixWorld);
      object.matrix.decompose(object.position, object.rotation, object.scale);
      //AFRAME.utils.entity.setComponentProperty(intersection, 'material.emissive.b', 0);
      Events.emit('entitydeselected');
      this.sceneEl.add(intersection);
      Events.emit('entityadded')
      controller.object3D.userData.selected = undefined;
    }
  },
  intersectObjects: function (controller) {
    if (controller.components && controller.components.raycaster) {
      // Do not highlight when already selected
      if (controller.object3D.userData.selected !== undefined) return;
      var intersections = this.getIntersections(controller);
      //console.log(intersections)
      if (intersections.length > 0) {
        var intersection = intersections[0];
        //var object = intersection.object3D;
        //object.material.emissive.r = 1;
        //AFRAME.utils.entity.setComponentProperty(intersection, 'material.emissive.b', 1);
        this.intersected.push(intersection);
      }
    }
  },
  cleanIntersected: function () {
    while (this.intersected.length) {
      var object = this.intersected.pop();
      //console.log(object)
      //AFRAME.utils.entity.setComponentProperty(object, 'material.emissive.b', 0);
    }
  },
  remove: function () {
    document.getElementById('left-hand').outerHTML = '';
    document.getElementById('right-hand').outerHTML = '';
  },
  setEntities: function () {
    if (!this.sceneEl) return;
    console.log(this.sceneEl.children)
    return Array.from(this.sceneEl.children).filter(el => el.object3D).map(el => el.object3D);
  },
  getEntities: function () {
    return this.entities;
  }
});

// JavaScript Document

(function threeApp () {

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

        var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.9 );
        directionalLight.position.set(5, 10, 5);
        scene.add( directionalLight );

        var directionalLight2 = new THREE.DirectionalLight( 0xffffff, 0.1 );
        directionalLight2.position.set(5, 4, 5);
        scene.add( directionalLight2 );

        var renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth - 300, window.innerHeight * 0.9 );

      var instructions = document.getElementById("instructions");

      this.document.body.insertBefore(renderer.domElement, this.document.body.firstChild);

        var geometry = new THREE.CubeGeometry(0.1,0.1,0.1);

        var material = new THREE.MeshLambertMaterial( { color: 0xBABABA, shading: THREE.FlatShading} );

        var cubeContainer = new Object();

        var cubes2 = new THREE.Object3D();

        var cameraTarget = new THREE.Vector3( 0, 0, -200 );

        for (c=0; c<20000; c++){
            cubeContainer["cube" + c] = new THREE.Mesh( geometry, material );

            let plusMinusX = Math.random();
            if (plusMinusX < 0.5){
                plusMinusX = -1;
            } else {
                plusMinusX = 1;
            }
            //console.log(plusMinusX);

            let xC = (Math.random())*50;
            xC = xC * plusMinusX;

            cubeContainer["cube" + c].position.x = xC;

            let plusMinusY = Math.random();
            if (plusMinusY < 0.5){
                plusMinusY = -1;
            } else {
                plusMinusY = 1;
            }
            //console.log(plusMinusY);

            let yC = (Math.random())*50;
            yC = yC * plusMinusY;

            cubeContainer["cube" + c].position.y = yC;

            let zC = (((Math.random())*50) + 2) * -1;

            cubeContainer["cube" + c].position.z = zC;
            cubes2.add( cubeContainer["cube" + c] );
        }

        scene.add(cubes2);

        camera.position.z = 0;

        camera.lookAt(cameraTarget);

        // Move the camera in the three dimensional space
        function moveCamera ()
            {
                window.onkeyup = function(e) {
                    let key = e.keyCode ? e.keyCode : e.which;
                    // Get camera target
                    let targetPositionZ = cameraTarget.z;
                    let targetPositionX = cameraTarget.x;
                    let cameraPositionZ = camera.position.z;
                    let cameraPositionX = camera.position.x;
                    var cameraDirection = '';
                    // Figure out where the camera is pointing
                    if (targetPositionZ > cameraPositionZ) {
                        cameraDirection = "behind";
                    } else if (targetPositionZ < cameraPositionZ) {
                        cameraDirection = "ahead";
                    } else {
                        cameraDirection = "side";
                    }
                    switch (key) {
                        case 40:
                            camera.position.y -= 1;
                            cameraTarget.y -= 1;
                            break;
                        case 38:
                            camera.position.y += 1;
                            cameraTarget.y += 1;
                            break;
                        case 37:
                            // Left arrow
                            if (cameraDirection === "ahead") {
                                camera.position.x -= 1;
                                cameraTarget.x -= 1;
                            } else if (cameraDirection === "behind") {
                                camera.position.x += 1;
                                cameraTarget.x += 1;
                            } else {
                                if (targetPositionX > cameraPositionX){
                                    // Looking x pos
                                    camera.position.z -= 1;
                                    cameraTarget.z -= 1;
                                } else {
                                    // Looking x neg
                                    camera.position.z += 1;
                                    cameraTarget.z += 1;
                                }
                            }
                            break;
                        case 39:
                            // Right arrow
                            if (cameraDirection === "ahead") {
                                camera.position.x += 1;
                                cameraTarget.x += 1;
                            } else if (cameraDirection === "behind") {
                                camera.position.x -= 1;
                                cameraTarget.x -= 1;
                            } else {
                                if (targetPositionX > cameraPositionX){
                                    // Looking x pos
                                    camera.position.z += 1;
                                    cameraTarget.z += 1;
                                } else {
                                    // Looking x neg
                                    camera.position.z -= 1;
                                    cameraTarget.z -= 1;
                                }
                            }
                            break;
                        case 65:
                            // A key (nominally "forward")
                            if (cameraDirection === "ahead") {
                                camera.position.z -= 1;
                                cameraTarget.z -= 1;
                            } else if (cameraDirection === "behind") {
                                camera.position.z += 1;
                                cameraTarget.z += 1;
                            } else {
                                if (targetPositionX > cameraPositionX){
                                    // Looking x pos
                                    camera.position.x += 1;
                                    cameraTarget.x += 1;
                                } else {
                                    // Looking x neg
                                    camera.position.x -= 1;
                                    cameraTarget.x -= 1;
                                }
                            }
                            break;
                        case 90:
                            // W key (nominally "reverse")
                            if (cameraDirection === "ahead") {
                                camera.position.z += 1;
                                cameraTarget.z += 1;
                            } else if (cameraDirection === "behind") {
                                camera.position.z -= 1;
                                cameraTarget.z -= 1;
                            } else {
                                if (targetPositionX > cameraPositionX){
                                    // Looking x pos
                                    camera.position.x -= 1;
                                    cameraTarget.x -= 1;
                                } else {
                                    // Looking x neg
                                    camera.position.x += 1;
                                    cameraTarget.x += 1;
                                }
                            }
                            break;
                        case 81:
                            // Rotate camera counterclockwise 90 degrees
                            console.log("Counterclockwise");
                            if (cameraDirection === "ahead") {
                                cameraTarget.z = cameraPositionZ;
                                cameraTarget.x = cameraPositionX - 200;
                            } else if (cameraDirection === "behind") {
                                cameraTarget.z = cameraPositionZ;
                                cameraTarget.x = cameraPositionX + 200;
                            } else {
                                if (targetPositionX > cameraPositionX){
                                    // Looking x pos
                                    cameraTarget.z = cameraPositionZ - 200;
                                    cameraTarget.x = cameraPositionX;
                                } else {
                                    // Looking x neg
                                    cameraTarget.z = cameraPositionZ + 200;
                                    cameraTarget.x = cameraPositionX;
                                }
                            }
                            break;
                        case 87:
                            // Rotate camera clockwise 90 degrees
                            console.log("Clockwise");
                            if (cameraDirection === "ahead") {
                                cameraTarget.z = cameraPositionZ;
                                cameraTarget.x = cameraPositionX + 200;
                            } else if (cameraDirection === "behind") {
                                cameraTarget.z = cameraPositionZ;
                                cameraTarget.x = cameraPositionX - 200;
                            } else {
                                if (targetPositionX > cameraPositionX){
                                    // Looking right
                                    cameraTarget.z = cameraPositionZ + 200;
                                    cameraTarget.x = cameraPositionX;
                                } else {
                                    // Looking left
                                    cameraTarget.z = cameraPositionZ - 200;
                                    cameraTarget.x = cameraPositionX;
                                }
                            }
                            break;
                        default:
                            console.log(`key code is :${key}`);
                            break;
                    }
                    camera.lookAt(cameraTarget);
                }
            };

        function render()
            {
                requestAnimationFrame(render);

                moveCamera();

                renderer.render(scene, camera);

            };

        render();

    })();
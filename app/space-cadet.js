// JavaScript Document

import * as THREE from 'three';
const ThreeBSP = require('../node_modules/three-js-csg/index.js')(THREE);

(function threeApp () {

    function setUpScene() {

            // Set up scene, camera, and light

            var scene = new THREE.Scene();
            var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

            // Set camera position and target

            let cameraTarget = new THREE.Vector3( 0, 0, -1 );

            camera.position.z = 0;

            camera.lookAt(cameraTarget);

            // Create a point light that will follow the camera position

            let lightDistance = 200;

            let light = new THREE.PointLight( 0x777777, 2, lightDistance );
            light.position.set( 0, 0, 0 );
            scene.add( light );

            camera.position.z = 0;

            camera.lookAt(cameraTarget);

            return {
                scene: scene,
                camera: camera,
                cameraTarget: cameraTarget,
                light: light
            }

        }

        // Call scene setup

        var setUp = setUpScene();

        // Raycaster for collision detection

        var raycaster = new THREE.Raycaster();

        // Load camera and scene

        var camera = setUp.camera,
            scene = setUp.scene,
            cameraTarget = setUp.cameraTarget,
            light = setUp.light;

        var renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth - 300, window.innerHeight * 0.9 );

        // Position the instructions next to the newly created Canvas element that will show the rendered scene

        function positionInstructions(renderer) {
            let instructions = document.getElementById("instructions");
            document.body.insertBefore(renderer.domElement, document.body.firstChild);
        }

        positionInstructions(renderer);

        function generateMaterials() {
            let tunnelMaterial = new THREE.MeshLambertMaterial( { color: 0xBABABA, side: THREE.DoubleSide } );
            return {
                tunnel: tunnelMaterial
            }
        }

        var materials = generateMaterials();

        var tunnelMaterial = materials.tunnel;

        function buildRowBSP(length, width, height, material, position) {
            let tunnelGeo = new THREE.CubeGeometry( length, width, height, 2, 2, 2 );
            let tunnelMesh = new THREE.Mesh( tunnelGeo, tunnelMaterial );
            tunnelMesh.position.set(position.x,position.y,position.z);
            var tunnel_bsp = new ThreeBSP( tunnelMesh );
            return tunnel_bsp;
        }

        function buildGalleryBSP(height, length, width, material, position) {
            let galleryGeo = new THREE.CubeGeometry( height, length, width, 2, 2, 2 );
            let galleryMesh = new THREE.Mesh( galleryGeo, tunnelMaterial );
            galleryMesh.position.set(position.x,position.y,position.z);
            let gallery_bsp = new ThreeBSP( galleryMesh );
            return gallery_bsp;
        }

        // Union experiment

        function buildInitialRowBSP(tunnelMaterial, y, z) {
            var tunnel_bsp = buildRowBSP(30, 3, 3, tunnelMaterial, {x: 15, y: 0, z: 0});

            for (var j = 0; j < 4; j++) {
                let gallery_bsp = buildGalleryBSP(5,5,5, tunnelMaterial, {x: j * 10, y: y, z: z});
                tunnel_bsp = tunnel_bsp.union(gallery_bsp);
                // Add depth tunnels
                let depthGeo = new THREE.CubeGeometry( 3, 3, 60, 2, 2, 2 );
                let depthMesh = new THREE.Mesh( depthGeo, tunnelMaterial );
                depthMesh.position.set(j * 10,y,-30);
                let depth_bsp = new ThreeBSP( depthMesh );
                tunnel_bsp = tunnel_bsp.union(depth_bsp);
            }
            return tunnel_bsp;
        };

        // Build remaining rows

        function buildAdditionalRows(bsp, tunnelMaterial, y, z) {
            for (var rowCount = 0; rowCount < 7; rowCount++) {
                var tunnel_bsp = buildRowBSP(30, 3, 3, tunnelMaterial, {x: 15, y: y, z: z});
                for (var j = 0; j < 4; j++) {
                    let gallery_bsp = buildGalleryBSP(5,5,5, tunnelMaterial, {x: j * 10, y: y, z: z});
                    tunnel_bsp = tunnel_bsp.union(gallery_bsp);
                }
                bsp = bsp.union(tunnel_bsp);
                z -= 10;
            }
            return bsp;
        }

        var initialRowBSP = buildInitialRowBSP(tunnelMaterial, 0, 0);

        var combined_bsp = buildAdditionalRows(initialRowBSP, tunnelMaterial, 0, -10);

        var tunnel_mesh = combined_bsp.toMesh( new THREE.MeshLambertMaterial({
            color: 0xBABABA,
            side: THREE.DoubleSide
        }));

        scene.add( tunnel_mesh );

        // Set camera position and target

        // Move the camera in the three dimensional space
        function controls ()
        {
            function determineCollision(rayMaster, scene, camera, axis, operation) {
                // Cast a ray from the camera position in the direction of the intended movement, and check for any collision
                var origin = camera.position.clone(),
                    environment = scene.children,
                    ray = rayMaster,
                    distance = null, // Vector for ray
                    destination = camera.position.clone(); // The future position
                if (axis === "x") {
                    if (operation === "+") {
                        destination.setX( destination.x + 1 );
                    } else {
                        destination.setX( destination.x - 1 );
                    }
                } else if (axis === "y") {
                    if (operation === "+") {
                        destination.setY( destination.y + 1 );
                    } else {
                        destination.setY( destination.y - 1 );
                    }
                } else {
                    if (operation === "+") {
                        destination.setZ( destination.z + 1 );
                    } else {
                        destination.setZ( destination.z - 1 );
                    }
                }
                // Raycast from camera to camera target
                let directionVector = destination.sub( origin );
                rayMaster.set( origin, directionVector.clone().normalize() );
                scene.updateMatrixWorld();
                // calculate objects intersecting the picking ray
                var intersects = rayMaster.intersectObjects( scene.children, true );
                // Distance holder
                var distance = 15;
                var collisionDetected = false;
                if (intersects.length > 0) {
                    distance = intersects[0].distance;
                    console.log(distance);
                }
                if (Math.round(distance) <= 1) {
                    collisionDetected = true;
                }
                return collisionDetected;
            }
            // Keyboard control function
            window.onkeyup = function(e) {
                // Read key
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
                // Keyboard actions
                switch (key) {
                    case 16:
                        // Load geometries for reference
                        // const doorA = retrieveFromScene("first door");
                        // if ( (cameraPositionZ < doorA.position.z + 4) && ( cameraPositionZ > doorA.position.z - 4) ){
                        //     // Only open door if it is closed
                        //     if (isDoorClosed) {
                        //         doorA.position.y += 4;
                        //         createMaze();
                        //         isDoorClosed = false;
                        //     }
                        // }
                        // break;
                    case 40:
                        var collisionDetected = determineCollision(raycaster, scene, camera, "y", "-");
                        if (!collisionDetected){
                            camera.position.y -= 1;
                            cameraTarget.y -= 1;
                        }
                        break;
                    case 38:
                        var collisionDetected = determineCollision(raycaster, scene, camera, "y", "+");
                        if (!collisionDetected){
                            camera.position.y += 1;
                            cameraTarget.y += 1;
                        }
                        break;
                    case 37:
                        // Left arrow
                        if (cameraDirection === "ahead") {
                            var collisionDetected = determineCollision(raycaster, scene, camera, "x", "-");
                            if (!collisionDetected){
                                camera.position.x -= 1;
                                cameraTarget.x -= 1;
                            }
                        } else if (cameraDirection === "behind") {
                            var collisionDetected = determineCollision(raycaster, scene, camera, "x", "+");
                            if (!collisionDetected){
                                camera.position.x += 1;
                                cameraTarget.x += 1;
                            }
                        } else {
                            if (targetPositionX > cameraPositionX){
                                // Looking x pos
                                var collisionDetected = determineCollision(raycaster, scene, camera, "z", "-");
                                if (!collisionDetected){
                                    camera.position.z -= 1;
                                    cameraTarget.z -= 1;
                                }
                            } else {
                                // Looking x neg
                                var collisionDetected = determineCollision(raycaster, scene, camera, "z", "+");
                                if (!collisionDetected){
                                    camera.position.z += 1;
                                    cameraTarget.z += 1;
                                }
                            }
                        }
                        break;
                    case 39:
                        // Right arrow
                        if (cameraDirection === "ahead") {
                            var collisionDetected = determineCollision(raycaster, scene, camera, "x", "+");
                            if (!collisionDetected){
                                camera.position.x += 1;
                                cameraTarget.x += 1;
                            }
                        } else if (cameraDirection === "behind") {
                            var collisionDetected = determineCollision(raycaster, scene, camera, "x", "-");
                            if (!collisionDetected){
                                camera.position.x -= 1;
                                cameraTarget.x -= 1;
                            }
                        } else {
                            if (targetPositionX > cameraPositionX){
                                var collisionDetected = determineCollision(raycaster, scene, camera, "z", "+");
                                if (!collisionDetected){
                                // Looking x pos
                                    camera.position.z += 1;
                                    cameraTarget.z += 1;
                                }
                            } else {
                                // Looking x neg
                                var collisionDetected = determineCollision(raycaster, scene, camera, "z", "-");
                                if (!collisionDetected){
                                    camera.position.z -= 1;
                                    cameraTarget.z -= 1;
                                }
                            }
                        }
                        break;
                    case 65:
                        // A key (nominally "forward")
                        if (cameraDirection === "ahead") {
                            var collisionDetected = determineCollision(raycaster, scene, camera, "z", "-");
                            if (!collisionDetected){
                                camera.position.z -= 1;
                                cameraTarget.z -= 1;
                            }
                        } else if (cameraDirection === "behind") {
                            var collisionDetected = determineCollision(raycaster, scene, camera, "z", "+");
                            if (!collisionDetected){
                                camera.position.z += 1;
                                cameraTarget.z += 1;
                            }
                        } else {
                            if (targetPositionX > cameraPositionX){
                                // Looking x pos
                                var collisionDetected = determineCollision(raycaster, scene, camera, "x", "+");
                                if (!collisionDetected){
                                    camera.position.x += 1;
                                    cameraTarget.x += 1;
                                }
                            } else {
                                // Looking x neg
                                var collisionDetected = determineCollision(raycaster, scene, camera, "x", "-");
                                if (!collisionDetected){
                                    camera.position.x -= 1;
                                    cameraTarget.x -= 1;
                                }
                            }
                        }
                        break;
                    case 90:
                        // Z key (nominally "reverse")
                        if (cameraDirection === "ahead") {
                            var collisionDetected = determineCollision(raycaster, scene, camera, "z", "+");
                            if (!collisionDetected){
                                camera.position.z += 1;
                                cameraTarget.z += 1;
                            }
                        } else if (cameraDirection === "behind") {
                            var collisionDetected = determineCollision(raycaster, scene, camera, "z", "-");
                            if (!collisionDetected){
                                camera.position.z -= 1;
                                cameraTarget.z -= 1;
                            }
                        } else {
                            if (targetPositionX > cameraPositionX){
                                // Looking x pos
                                var collisionDetected = determineCollision(raycaster, scene, camera, "x", "-");
                                if (!collisionDetected){
                                    camera.position.x -= 1;
                                    cameraTarget.x -= 1;
                                }
                            } else {
                                // Looking x neg
                                var collisionDetected = determineCollision(raycaster, scene, camera, "x", "+");
                                if (!collisionDetected){
                                    camera.position.x += 1;
                                    cameraTarget.x += 1;
                                }
                            }
                        }
                        break;
                    case 81:
                        // Rotate camera counterclockwise 90 degrees (Q)
                        console.log("Counterclockwise");
                        if (cameraDirection === "ahead") {
                            cameraTarget.z = cameraPositionZ;
                            cameraTarget.x = cameraPositionX - 1;
                        } else if (cameraDirection === "behind") {
                            cameraTarget.z = cameraPositionZ;
                            cameraTarget.x = cameraPositionX + 1;
                        } else {
                            if (targetPositionX > cameraPositionX){
                                // Looking x pos
                                cameraTarget.z = cameraPositionZ - 1;
                                cameraTarget.x = cameraPositionX;
                            } else {
                                // Looking x neg
                                cameraTarget.z = cameraPositionZ + 1;
                                cameraTarget.x = cameraPositionX;
                            }
                        }
                        break;
                    case 87:
                        // Rotate camera clockwise 90 degrees (W)
                        console.log("Clockwise");
                        if (cameraDirection === "ahead") {
                            cameraTarget.z = cameraPositionZ;
                            cameraTarget.x = cameraPositionX + 1;
                        } else if (cameraDirection === "behind") {
                            cameraTarget.z = cameraPositionZ;
                            cameraTarget.x = cameraPositionX - 1;
                        } else {
                            if (targetPositionX > cameraPositionX){
                                // Looking right
                                cameraTarget.z = cameraPositionZ + 1;
                                cameraTarget.x = cameraPositionX;
                            } else {
                                // Looking left
                                cameraTarget.z = cameraPositionZ - 1;
                                cameraTarget.x = cameraPositionX;
                            }
                        }
                        break;
                    default:
                        console.log(`key code is :${key}`);
                        break;
                }
                camera.lookAt(cameraTarget);
                // Move the light to the new camera position
                light.position.x = camera.position.x;
                light.position.y = camera.position.y;
                light.position.z = camera.position.z;
            }
        };

        function render()
            {
                requestAnimationFrame(render);

                controls();

                renderer.render(scene, camera);
            };

        render();

    })();
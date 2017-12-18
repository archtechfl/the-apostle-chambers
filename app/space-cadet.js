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

            // Set the maze dimensions

            let mazeDimensions = {
                "length": 30,
                "width": 90
            }

            return {
                scene: scene,
                camera: camera,
                cameraTarget: cameraTarget,
                light: light,
                dimensions: mazeDimensions
            }

        }

        // Call scene setup

        var setUp = setUpScene();

        // Use to keep track of the coordinates of all passages
        var mazePassages = [];

        // Raycaster for collision detection

        var raycaster = new THREE.Raycaster();

        // Load camera and scene

        var camera = setUp.camera,
            scene = setUp.scene,
            cameraTarget = setUp.cameraTarget,
            light = setUp.light;

        let mazeWidth = setUp.dimensions.width,
            mazeLength = setUp.dimensions.length;

        // Set up renderer

        var renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth - 300, window.innerHeight * 0.9 );

        // Position the instructions next to the newly created Canvas element that will show the rendered scene

        function positionInstructions(renderControl, appContainer) {
            let instructions = appContainer.getElementById("instructions");
            appContainer.body.insertBefore(renderControl.domElement, appContainer.body.firstChild);
        }

        positionInstructions(renderer, document);

        // Generate the materials needed for the scene

        function generateMaterials(MaterialType, sideRenderingSystem) {
            // Use a MeshLambertMaterial for shadows
            let tunnelMaterial = new MaterialType( { color: 0xBABABA, side: sideRenderingSystem } );
            return {
                tunnel: tunnelMaterial
            }
        }

        // Generate the material needed (this function designed to scale for multiple materials)

        let materials = generateMaterials(THREE.MeshLambertMaterial, THREE.BackSide);

        let tunnelMaterial = materials.tunnel;

        // Builds a single row, turning it into a BSP tree

        function buildRowBSP(length, width, height, material, position, GraphicSystem) {
            // Create tunnel geometry and mesh for tunnel
            let tunnelGeo = new GraphicSystem.CubeGeometry( length, width, height, 2, 2, 2 );
            let tunnelMesh = new GraphicSystem.Mesh( tunnelGeo, tunnelMaterial );
            // Position tunnel so that it is centered on the x axis for the maze
            tunnelMesh.position.set(position.x,position.y,position.z);
            // Create the BSP for calculating the union of meshes
            var tunnel_bsp = new ThreeBSP( tunnelMesh );
            return tunnel_bsp;
        }

        // Builds a gallery, turning it into a BSP tree

        function buildGalleryBSP(height, length, width, material, position, GraphicSystem) {
            // Create geometry and mesh for the cubic galleries
            let galleryGeo = new GraphicSystem.CubeGeometry( height, length, width, 2, 2, 2 );
            let galleryMesh = new GraphicSystem.Mesh( galleryGeo, tunnelMaterial );
            // Position the gallery at the specified coordinates (intersection of columns and rows)
            galleryMesh.position.set(position.x,position.y,position.z);
            // Create the BSP for calculating the union of meshes
            let gallery_bsp = new ThreeBSP( galleryMesh );
            return gallery_bsp;
        }

        // Builds the initial row, which consists of a horizontal tunnel, tunnels with depth, and the initial galleries (looks like a rake from above)
        // Additional rows are unioned to this initial geometry

        function buildInitialRowBSP(tunnelMaterial, y, z, length, depth, GraphicSystem) {
            // Create the initial row with column tunnels from each gallery
            // Additional rows will be joined to these columns

            var tunnel_bsp = buildRowBSP(length, 3, 3, tunnelMaterial, {x: length / 2, y: 0, z: 0}, GraphicSystem);
            var depth = Math.round(depth / 10) * 10;
            var length = Math.round(length / 10) * 10;

            for (var j = 0; j <= (length / 10); j++) {
                let gallery_bsp = buildGalleryBSP(5,5,5, tunnelMaterial, {x: j * 10, y: y, z: z}, GraphicSystem);
                if (j !== (length / 10)){
                    mazePassages.push([(j * 10) + 5, z]);
                }
                tunnel_bsp = tunnel_bsp.union(gallery_bsp);
                // Add depth tunnels
                let depthGeo = new GraphicSystem.CubeGeometry( 3, 3, depth, 2, 2, 2 );
                let depthMesh = new GraphicSystem.Mesh( depthGeo, tunnelMaterial );
                depthMesh.position.set(j * 10,y, ((depth * -1) / 2));
                let depth_bsp = new ThreeBSP( depthMesh );
                tunnel_bsp = tunnel_bsp.union(depth_bsp);
            }
            return tunnel_bsp;
        };

        // Build remaining rows

        function buildAdditionalRows(bsp, tunnelMaterial, y, z, length, depth, GraphicSystem) {

            // Build additional row consisting of tunnel and galleries, supplied with the initial row and tunnel BSP

            var depthSteps = Math.round(depth / 10) - 1;
            var length = Math.round(length / 10) * 10;

            for (var rowCount = 0; rowCount <= depthSteps; rowCount++) {
                var tunnel_bsp = buildRowBSP(length, 3, 3, tunnelMaterial, {x: length / 2, y: y, z: z}, GraphicSystem);
                for (var j = 0; j <= (length / 10); j++) {
                    let gallery_bsp = buildGalleryBSP(5,5,5, tunnelMaterial, {x: j * 10, y: y, z: z}, GraphicSystem);
                    mazePassages.push([(j * 10), z + 5]);
                    if (j !== (length / 10)){
                        mazePassages.push([(j * 10) + 5, z]);
                    }
                    tunnel_bsp = tunnel_bsp.union(gallery_bsp);
                }
                bsp = bsp.union(tunnel_bsp);
                z -= 10;
            }
            return bsp;
        }

        // Perform geometry union

        function generateMazeGeoemetry(GraphicSystem, tunnelMaterial, length, width){
            let initialRowBSP = buildInitialRowBSP(tunnelMaterial, 0, 0, length, width, GraphicSystem);
            let combined_bsp = buildAdditionalRows(initialRowBSP, tunnelMaterial, 0, -10, length, width, GraphicSystem);
            let combined_mesh = combined_bsp.toMesh( tunnelMaterial );
            return combined_mesh;
        }

        // Call the maze generation wrapper function and pass it the THREE graphics library
        // Maze generation is now purely functional

        var mazeFinal = generateMazeGeoemetry(THREE, tunnelMaterial, mazeLength, mazeWidth);

        // Add unioned geometry to scene

        scene.add( mazeFinal );

        // Count the passages

        for (var passageCounter = 0; passageCounter < 40; passageCounter++) {
            var passageIndex =  Math.ceil(Math.random() * mazePassages.length);
            // Remove passage now that it has been selected
            var passageSelected = mazePassages.splice(passageIndex, 1);
        }

        // Move the camera in the three dimensional space
        function controls (mazeScene, mazeCamera, mazeCameraTarget, cameraLight)
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
                let targetPositionZ = mazeCameraTarget.z;
                let targetPositionX = mazeCameraTarget.x;
                let cameraPositionZ = mazeCamera.position.z;
                let cameraPositionX = mazeCamera.position.x;
                var cameraDirection = '';
                // Figure out where the camera is pointing
                // The directions are relative to the initial view (camera pointing towards - on the Z axis)
                if (targetPositionZ > cameraPositionZ) {
                    cameraDirection = "behind";
                } else if (targetPositionZ < cameraPositionZ) {
                    cameraDirection = "ahead";
                } else {
                    cameraDirection = "side";
                }
                // Keyboard actions
                switch (key) {
                    case 40:
                        var collisionDetected = determineCollision(raycaster, mazeScene, mazeCamera, "y", "-");
                        if (!collisionDetected){
                            mazeCamera.position.y -= 1;
                            mazeCameraTarget.y -= 1;
                        }
                        break;
                    case 38:
                        var collisionDetected = determineCollision(raycaster, mazeScene, mazeCamera, "y", "+");
                        if (!collisionDetected){
                            mazeCamera.position.y += 1;
                            mazeCameraTarget.y += 1;
                        }
                        break;
                    case 37:
                        // Left arrow
                        if (cameraDirection === "ahead") {
                            var collisionDetected = determineCollision(raycaster, mazeScene, mazeCamera, "x", "-");
                            if (!collisionDetected){
                                mazeCamera.position.x -= 1;
                                mazeCameraTarget.x -= 1;
                            }
                        } else if (cameraDirection === "behind") {
                            var collisionDetected = determineCollision(raycaster, mazeScene, mazeCamera, "x", "+");
                            if (!collisionDetected){
                                mazeCamera.position.x += 1;
                                mazeCameraTarget.x += 1;
                            }
                        } else {
                            if (targetPositionX > cameraPositionX){
                                // Looking x pos
                                var collisionDetected = determineCollision(raycaster, mazeScene, mazeCamera, "z", "-");
                                if (!collisionDetected){
                                    mazeCamera.position.z -= 1;
                                    mazeCameraTarget.z -= 1;
                                }
                            } else {
                                // Looking x neg
                                var collisionDetected = determineCollision(raycaster, mazeScene, mazeCamera, "z", "+");
                                if (!collisionDetected){
                                    mazeCamera.position.z += 1;
                                    mazeCameraTarget.z += 1;
                                }
                            }
                        }
                        break;
                    case 39:
                        // Right arrow
                        if (cameraDirection === "ahead") {
                            var collisionDetected = determineCollision(raycaster, mazeScene, mazeCamera, "x", "+");
                            if (!collisionDetected){
                                mazeCamera.position.x += 1;
                                mazeCameraTarget.x += 1;
                            }
                        } else if (cameraDirection === "behind") {
                            var collisionDetected = determineCollision(raycaster, mazeScene, mazeCamera, "x", "-");
                            if (!collisionDetected){
                                mazeCamera.position.x -= 1;
                                mazeCameraTarget.x -= 1;
                            }
                        } else {
                            if (targetPositionX > cameraPositionX){
                                var collisionDetected = determineCollision(raycaster, mazeScene, mazeCamera, "z", "+");
                                if (!collisionDetected){
                                // Looking x pos
                                    mazeCamera.position.z += 1;
                                    mazeCameraTarget.z += 1;
                                }
                            } else {
                                // Looking x neg
                                var collisionDetected = determineCollision(raycaster, mazeScene, mazeCamera, "z", "-");
                                if (!collisionDetected){
                                    mazeCamera.position.z -= 1;
                                    mazeCameraTarget.z -= 1;
                                }
                            }
                        }
                        break;
                    case 65:
                        // A key (nominally "forward")
                        if (cameraDirection === "ahead") {
                            var collisionDetected = determineCollision(raycaster, mazeScene, mazeCamera, "z", "-");
                            if (!collisionDetected){
                                mazeCamera.position.z -= 1;
                                mazeCameraTarget.z -= 1;
                            }
                        } else if (cameraDirection === "behind") {
                            var collisionDetected = determineCollision(raycaster, mazeScene, mazeCamera, "z", "+");
                            if (!collisionDetected){
                                mazeCamera.position.z += 1;
                                mazeCameraTarget.z += 1;
                            }
                        } else {
                            if (targetPositionX > cameraPositionX){
                                // Looking x pos
                                var collisionDetected = determineCollision(raycaster, mazeScene, mazeCamera, "x", "+");
                                if (!collisionDetected){
                                    mazeCamera.position.x += 1;
                                    mazeCameraTarget.x += 1;
                                }
                            } else {
                                // Looking x neg
                                var collisionDetected = determineCollision(raycaster, mazeScene, mazeCamera, "x", "-");
                                if (!collisionDetected){
                                    mazeCamera.position.x -= 1;
                                    mazeCameraTarget.x -= 1;
                                }
                            }
                        }
                        break;
                    case 90:
                        // Z key (nominally "reverse")
                        if (cameraDirection === "ahead") {
                            var collisionDetected = determineCollision(raycaster, mazeScene, mazeCamera, "z", "+");
                            if (!collisionDetected){
                                mazeCamera.position.z += 1;
                                mazeCameraTarget.z += 1;
                            }
                        } else if (cameraDirection === "behind") {
                            var collisionDetected = determineCollision(raycaster, mazeScene, mazeCamera, "z", "-");
                            if (!collisionDetected){
                                mazeCamera.position.z -= 1;
                                mazeCameraTarget.z -= 1;
                            }
                        } else {
                            if (targetPositionX > cameraPositionX){
                                // Looking x pos
                                var collisionDetected = determineCollision(raycaster, mazeScene, mazeCamera, "x", "-");
                                if (!collisionDetected){
                                    mazeCamera.position.x -= 1;
                                    mazeCameraTarget.x -= 1;
                                }
                            } else {
                                // Looking x neg
                                var collisionDetected = determineCollision(raycaster, mazeScene, mazeCamera, "x", "+");
                                if (!collisionDetected){
                                    mazeCamera.position.x += 1;
                                    mazeCameraTarget.x += 1;
                                }
                            }
                        }
                        break;
                    case 81:
                        // Rotate camera counterclockwise 90 degrees (Q)
                        console.log("Counterclockwise");
                        if (cameraDirection === "ahead") {
                            mazeCameraTarget.z = cameraPositionZ;
                            mazeCameraTarget.x = cameraPositionX - 1;
                        } else if (cameraDirection === "behind") {
                            mazeCameraTarget.z = cameraPositionZ;
                            mazeCameraTarget.x = cameraPositionX + 1;
                        } else {
                            if (targetPositionX > cameraPositionX){
                                // Looking x pos
                                mazeCameraTarget.z = cameraPositionZ - 1;
                                mazeCameraTarget.x = cameraPositionX;
                            } else {
                                // Looking x neg
                                mazeCameraTarget.z = cameraPositionZ + 1;
                                mazeCameraTarget.x = cameraPositionX;
                            }
                        }
                        break;
                    case 87:
                        // Rotate camera clockwise 90 degrees (W)
                        console.log("Clockwise");
                        if (cameraDirection === "ahead") {
                            mazeCameraTarget.z = cameraPositionZ;
                            mazeCameraTarget.x = cameraPositionX + 1;
                        } else if (cameraDirection === "behind") {
                            mazeCameraTarget.z = cameraPositionZ;
                            mazeCameraTarget.x = cameraPositionX - 1;
                        } else {
                            if (targetPositionX > cameraPositionX){
                                // Looking right
                                mazeCameraTarget.z = cameraPositionZ + 1;
                                mazeCameraTarget.x = cameraPositionX;
                            } else {
                                // Looking left
                                mazeCameraTarget.z = cameraPositionZ - 1;
                                mazeCameraTarget.x = cameraPositionX;
                            }
                        }
                        break;
                    default:
                        console.log(`key code is :${key}`);
                        break;
                }
                mazeCamera.lookAt(mazeCameraTarget);
                // Move the light to the new camera position
                cameraLight.position.x = mazeCamera.position.x;
                cameraLight.position.y = mazeCamera.position.y;
                cameraLight.position.z = mazeCamera.position.z;
            };
            return {
                "scene": mazeScene,
                "camera": mazeCamera,
                "light": cameraLight
            };
        };

        function render()
            {
                // Animation loop
                requestAnimationFrame(render);

                // Respond to user navigation
                var userActions = controls(scene, camera, cameraTarget, light);

                // Update renderer
                let mazeScene = userActions.scene,
                    mazeCamera = userActions.camera;

                // Update light
                light = userActions.light;

                // Render updated scene
                renderer.render(mazeScene, mazeCamera);
            };

        render();

    })();
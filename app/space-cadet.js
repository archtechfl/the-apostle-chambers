// JavaScript Document

(function threeApp () {

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

        var light = new THREE.PointLight( 0x777777, 2, 10000 );
        light.position.set( 0, 0, 0 );
        scene.add( light );

        // scene.add( directionalLight );

        var renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth - 300, window.innerHeight * 0.9 );

        var instructions = document.getElementById("instructions");

        this.document.body.insertBefore(renderer.domElement, this.document.body.firstChild);

        var cameraTarget = new THREE.Vector3( 0, 0, -200 );

        var tunnelMaterial = new THREE.MeshLambertMaterial( { color: 0xBABABA, side: THREE.DoubleSide } );

        function buildRowBSP(length, width, height, material, position) {
            let tunnelGeo = new THREE.CubeGeometry( length, width, height, 64, 64, 64 );
            let tunnelMesh = new THREE.Mesh( tunnelGeo, tunnelMaterial );
            tunnelMesh.position.set(position.x,position.y,position.z);
            var tunnel_bsp = new ThreeBSP( tunnelMesh );
            return tunnel_bsp;
        }

        function buildGalleryBSP(height, length, width, material, position) {
            let galleryGeo = new THREE.CubeGeometry( height, length, width, 64, 64, 64 );
            let galleryMesh = new THREE.Mesh( galleryGeo, tunnelMaterial );
            galleryMesh.position.set(position.x,position.y,position.z);
            let gallery_bsp = new ThreeBSP( galleryMesh );
            return gallery_bsp;
        }

        // Union experiment

        function buildInitialRowBSP(tunnelMaterial, y, z) {
            var tunnel_bsp = buildRowBSP(30, 1, 1, tunnelMaterial, {x: 15, y: 0, z: 0});

            for (var j = 0; j < 4; j++) {
                let gallery_bsp = buildGalleryBSP(3,3,3, tunnelMaterial, {x: j * 10, y: y, z: z});
                tunnel_bsp = tunnel_bsp.union(gallery_bsp);
                // Add depth tunnels
                let depthGeo = new THREE.CubeGeometry( 1, 1, 20, 64, 64, 64 );
                let depthMesh = new THREE.Mesh( depthGeo, tunnelMaterial );
                depthMesh.position.set(j * 10,y,-10);
                let depth_bsp = new ThreeBSP( depthMesh );
                tunnel_bsp = tunnel_bsp.union(depth_bsp);
            }
            return tunnel_bsp;
        };

        // Build remaining rows

        function buildAdditionalRows(bsp, tunnelMaterial, y, z) {
            for (var rowCount = 0; rowCount < 2; rowCount++) {
                var tunnel_bsp = buildRowBSP(30, 1, 1, tunnelMaterial, {x: 15, y: y, z: z});
                for (var j = 0; j < 4; j++) {
                    let gallery_bsp = buildGalleryBSP(3,3,3, tunnelMaterial, {x: j * 10, y: y, z: z});
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
                            // camera.position.y -= 1;
                            // cameraTarget.y -= 1;
                            break;
                        case 38:
                            // camera.position.y += 1;
                            // cameraTarget.y += 1;
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
                    light.position.x = camera.position.x;
                    light.position.y = camera.position.y;
                    light.position.z = camera.position.z;
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
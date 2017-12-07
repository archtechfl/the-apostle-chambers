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

        var geometry = new THREE.BoxGeometry( 20, 10, 50 );
        var material = new THREE.MeshStandardMaterial({
            color: 0xBABABA,
            side: THREE.DoubleSide
        });
        var tunnel = new THREE.Mesh( geometry, material );

        var baseMaterial = new THREE.MeshStandardMaterial({
            color: 0xFF0000,
            side: THREE.DoubleSide
        });

        var geometryBeta = new THREE.BoxGeometry( 1, 1, 1 );
        var base = new THREE.Mesh( geometryBeta, baseMaterial );

        tunnel.position.x = 0;
        tunnel.position.y = 0;
        tunnel.position.z = -50;

        base.position.x = 0;
        base.position.y = 0;
        base.position.z = -25;

        // Union experiment

		// var alpha_bsp = new ThreeBSP( tunnel );
		// var beta_bsp = new ThreeBSP( base );

		// var union_bsp = alpha_bsp.subtract( beta_bsp );

		// var result = union_bsp.toMesh( new THREE.MeshLambertMaterial({
        //     shading: THREE.SmoothShading,
		// 	color: 0xBABABA,
        //     side: THREE.DoubleSide
        // }));

		// result.geometry.computeVertexNormals();
        // scene.add( result );

        // End union experiment

        scene.add(tunnel, base);

        var sphere_geometry = new THREE.SphereGeometry( 50, 32, 32 );
		var sphere_bsp = new ThreeBSP( sphere_geometry );

		var cube_geometry = new THREE.CubeGeometry( 150, 40, 40 );
		var cube_bsp = new ThreeBSP( cube_geometry );

		var union_bsp = sphere_bsp.union( cube_bsp );

		var result = union_bsp.toMesh( new THREE.MeshLambertMaterial({
            shading: THREE.SmoothShading,
			color: 0xBABABA,
            side: THREE.DoubleSide
		}));
		result.geometry.computeVertexNormals();
		scene.add( result );

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
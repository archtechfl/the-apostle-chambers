// JavaScript Document

(function threeApp () {

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

        // var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.9 );
        // directionalLight.position.set(100, 100, 100);

        // var targetObject = new THREE.Object3D();
        // targetObject.position.x = 0;
        // targetObject.position.y = 0;
        // targetObject.position.z = -20;
        // scene.add(targetObject);

        // directionalLight.target = targetObject;

        var light = new THREE.PointLight( 0x777777, 3, 10000 );
        light.position.set( 0, 0, 0 );
        scene.add( light );

        // scene.add( directionalLight );

        var renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth - 300, window.innerHeight * 0.9 );

        var instructions = document.getElementById("instructions");

        this.document.body.insertBefore(renderer.domElement, this.document.body.firstChild);

        var cameraTarget = new THREE.Vector3( 0, 0, -200 );

        // Start tunnel mesh

        var length = 20, width = 10;

        var tunnel = new THREE.Shape();
        tunnel.moveTo( 0,0 );
        tunnel.lineTo( 0, width );
        tunnel.lineTo( length, width );
        tunnel.lineTo( length, 0 );
        tunnel.lineTo( 0, 0 );

        var extrudeSettings = {
            steps: 20,
            amount: -100,
            bevelEnabled: false
        };

        var tunnelGeometry = new THREE.ExtrudeGeometry( tunnel, extrudeSettings );
        var tunnelMaterial = new THREE.MeshStandardMaterial( { color: 0xBABABA, side: THREE.DoubleSide } );
        var tunnelMesh = new THREE.Mesh( tunnelGeometry, tunnelMaterial ) ;

        tunnelMesh.position.x = -10;
        tunnelMesh.position.y = -5;
        tunnelMesh.position.z = -10;

        var tunnelMeshCopy = new THREE.Mesh( tunnelGeometry, tunnelMaterial ) ;;

        tunnelMeshCopy.position.x = 10;
        tunnelMeshCopy.position.y = -5;
        tunnelMeshCopy.position.z = -110;

        tunnelMeshCopy.rotation.set(0, ((2 * Math.PI) * -0.25), 0);

		// var tunnel_alpha = new ThreeBSP( tunnelMesh );
		// var tunnel_beta = new ThreeBSP( tunnelMeshCopy );

		// var tunnel_combined = tunnel_alpha.union( tunnel_beta );

		// var tunnel_combined_mesh = tunnel_combined.toMesh( new THREE.MeshLambertMaterial({
        //     color: 0xBABABA,
        //     side: THREE.DoubleSide
        // }));

        // scene.add( tunnel_combined_mesh );

        scene.add( tunnelMesh );
        scene.add( tunnelMeshCopy );

        var cube_geometry = new THREE.CubeGeometry( 3, 3, 3 );
		var cube_mesh = new THREE.Mesh( cube_geometry );
		cube_mesh.position.x = -7;
		var cube_bsp = new ThreeBSP( cube_mesh );
		var sphere_geometry = new THREE.SphereGeometry( 1.8, 32, 32 );
		var sphere_mesh = new THREE.Mesh( sphere_geometry );
		sphere_mesh.position.x = -7;
		var sphere_bsp = new ThreeBSP( sphere_mesh );

		var subtract_bsp = cube_bsp.subtract( sphere_bsp );
		var result = subtract_bsp.toMesh( new THREE.MeshLambertMaterial({
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
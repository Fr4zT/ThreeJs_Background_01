
        let renderer, camera, scene;
        let composer, renderPass, blurPass;

        const {
            Scene,
            PerspectiveCamera,
            CubeGeometry,
            MeshPhongMaterial,
            Mesh,
            AmbientLight,
            PointLight,
            Color,
            PointLightHelper,
            WebGLRenderer
        } = THREE;


        const { EffectComposer, RenderPass, BlurPass, KernelSize } = POSTPROCESSING;

        let tiles = [];
        
        function init()
        {
            tiles = [];

            const canvas = document.getElementById("threeEndlessTilesCanvas");

            scene = new THREE.Scene();
            scene.background = new THREE.Color("#000000");

            renderer = new THREE.WebGLRenderer({ canvas: canvas });
            renderer.setSize(window.innerWidth, window.innerHeight);

            camera = new THREE.PerspectiveCamera(39.6, window.innerWidth / window.innerHeight, 0.1, 10000);
            camera.position.set(11, 8, 5);
            camera.position.set(3, 5, -2);

            camera.rotation.set(degToRad(-45), 0, 0);
            camera.lookAt(0, 0, 0);

            composer = new EffectComposer(renderer);

            renderPass = new RenderPass(scene, camera);
            composer.addPass(renderPass);

            blurPass = new BlurPass({
                kernelSize: KernelSize.HUGE
            });
            composer.addPass(blurPass);

            const light = new THREE.AmbientLight(0x404040);
            scene.add(light);

            const directionalLight = new THREE.DirectionalLight(0xffffff, .5);
            scene.add(directionalLight);

            const boxGeometry = new THREE.BoxGeometry(parameters.tileHeight - .07, 1, parameters.tileWidth - .07, 1, 1, 1);

            for (let z = -parameters.xCount; z < parameters.xCount; z++) {
                let xOffset = THREE.MathUtils.randFloat(0, parameters.maxZOffset);
                let xSpeed = THREE.MathUtils.randFloat(parameters.minSpeed, parameters.maxSpeed);
                for (let x = -parameters.zCount; x < parameters.zCount; x++) {

                    const boxMaterial = new THREE.MeshStandardMaterial({ color: randomColor() });
                    let box = new THREE.Mesh(boxGeometry, boxMaterial);
                    box.position.set(x * parameters.tileHeight + xOffset, 0, z * parameters.tileWidth);
                    tiles.push({ box: box, speed: xSpeed });
                    scene.add(box);
                }
            }

            onWindowResize();
        }

        function degToRad(deg) {
            return (Math.PI / 180) * deg;
        }

        let toScroll = 0;
        const parameters = {
            speedMultiplier: 1,
            color_1: 0xff0000,
            color_2: 0x0000ff,
            blurIntensity: 0,
            xCount:10,
            zCount:3,
            tileWidth:1,
            tileHeight:5,
            maxZOffset:5,
            minSpeed:0.005,
            maxSpeed:0.02
        };
        function animate() {
            if(tiles.length==0) return;
            for (let i = 0; i < tiles.length; i++) {
                const tile = tiles[i];
                tile.box.position.x += tile.speed * parameters.speedMultiplier + toScroll;
                if (tile.box.position.x > parameters.tileHeight * parameters.zCount) {
                    tile.box.position.x = -parameters.tileHeight * parameters.zCount + (tile.box.position.x - parameters.tileHeight * parameters.zCount);
                    tile.box.material.color.setHex(randomColor());
                } else if (tile.box.position.x < -parameters.tileHeight * parameters.zCount) {
                    tile.box.position.x = parameters.tileHeight * parameters.zCount + (tile.box.position.x + parameters.tileHeight * parameters.zCount);
                    tile.box.material.color.setHex(randomColor());
                }
            }
            if (toScroll != 0) {
                toScroll = lerp(toScroll, 0, 0.1);
            }
            render();
            requestAnimationFrame(animate);
        }

        function lerp(start, end, amt) {
            return (1 - amt) * start + amt * end
        }

        function diff(num1, num2) {
            if (num1 > num2) {
                return num1 - num2
            } else {
                return num2 - num1
            }
        }

        function render() {
            blurPass.scale = parameters.blurIntensity;
            composer.render();
        }

        function randomColor() {
            let color = new THREE.Color(0xffffff).lerpColors(new THREE.Color(parameters.color_1), new THREE.Color(parameters.color_2), THREE.MathUtils.randFloat(0, 1)).getHexString();
            return parseInt("0x" + color, 16);
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function onWindowScroll(e) {
            toScroll += e.deltaY / 100;
        }

        init();
        animate();

        window.addEventListener('resize', onWindowResize, false);
        window.addEventListener('wheel', onWindowScroll, false);
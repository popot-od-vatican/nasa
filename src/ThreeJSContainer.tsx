import React, { useRef, useEffect } from 'react';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as Planets from './planets.tsx';
import * as THREE from 'three';

function calculateDistance(xObj: any, yObj: [number, number, number])
{
    const x: any = new THREE.Vector3();

    xObj.getWorldPosition(x);

    const dx = x.x - yObj[0];
    const dy = x.y - yObj[1];
    const dz = x.z - yObj[2];
        
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

let finished = false;

function cameraAnimationZoomIn(camera: any, yObj: [number, number, number], speed: any, planetObj: any, scene: any, raycast: any, controls: any)
{
    if(!finished)
    {
        if(calculateDistance(camera, yObj) >= 0.5)
        {
            camera.lookAt(yObj[0], yObj[1], yObj[2]);
            const moveDirection: any = new THREE.Vector3();
            camera.getWorldDirection(moveDirection);
            moveDirection.multiplyScalar(speed);
            camera.position.add(moveDirection);
            planetObj.bodyMesh.rotateY(speed/8.0);
        }
        else
        {
            console.log('Finished');
            controls.enableRotate = true;
            finished = true;
            return;
        }
    }
    else
    {
        planetObj.updateLabelVisibility(scene, camera, raycast);
    }
}

function getPlanet(planetName: string)
{
    switch(planetName)
    {
        case "Mercury":
            return {"Planet": Planets.Mercury, "Atmosphere": Planets.MercuryAtmosphere};
        case "Venus":
            return {"Planet": Planets.Venus, "Atmosphere": Planets.VenusAtmosphere};
        case "Mars":
            return {"Planet": Planets.Mars, "Atmosphere": Planets.MarsAtmosphere};
        case "Jupiter":
            return {"Planet": Planets.Jupiter, "Atmosphere": Planets.JupiterAtmosphere};
        case "Saturn":
            return {"Planet": Planets.Saturn, "Atmosphere": Planets.SaturnAtmosphere};
        case "Uranus":
            return {"Planet": Planets.Uranus, "Atmosphere": Planets.UranusAtmosphere};
        case "Neptune":
            return {"Planet": Planets.Neptune, "Atmosphere": Planets.NeptuneAtmosphere};
        default:
            return "EBI SE";
    }
}

export default function ThreeScene(props: any)
{
    const canvasRef = useRef(null);
    let planetObj: any;
    let planetAtmosphere: any;

    {planetObj = getPlanet(props.planetName).Planet}
    {planetAtmosphere = getPlanet(props.planetName).Atmosphere;}

    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById('viewport') as HTMLCanvasElement});
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        const mouse = new THREE.Vector2();

        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize( window.innerWidth, window.innerHeight );
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0px';
        document.body.appendChild(labelRenderer.domElement);

        function onWindowResize(){

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        
            renderer.setSize( window.innerWidth, window.innerHeight );
            labelRenderer.setSize( window.innerWidth, window.innerHeight );
        
        }

        window.addEventListener('resize', onWindowResize, false);

        const raycast = new THREE.Raycaster();

        scene.add(camera);

        Planets.Mars.addLocation(scene, 40.0834, 22.3499, 'Olympus Mons');
        Planets.Mars.addLocation(scene, 22.1, 352.0, 'Becquerel');
        Planets.Mars.addLocation(scene, -13.74, 59.20, 'Valles Marineris');
        Planets.Mars.addLocation(scene, 22, 342, 'Mawrth Vallis');
        Planets.Mars.addLocation(scene, 2.19, 342.96, 'Iani Chaos');
        Planets.Mars.addLocation(scene, 78.88, 90.0, 'Promethei Planum');
        Planets.Mars.addLocation(scene, 1, 76, 'Hebes Chasma');

        //div.addEventListener('pointerdown', ()=>{console.log(1)})


        addEventListener('mousemove', (event: any) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        })
        camera.position.z = 50;
        scene.add(planetObj.bodyMesh);
        scene.add(planetAtmosphere.bodyMesh);

        document.addEventListener('click', ()=>{
            raycast.setFromCamera(mouse, camera);
            const intersects = raycast.intersectObjects(scene.children);

            if(intersects.length == 0)
                return;

            for(let i = 0; i < intersects.length; ++i)
            {
                console.log(intersects[i]);
                if(intersects[i].object instanceof THREE.Mesh)
                {
                    // intersects[i].object.userData => object od Planet ili Star
                    //if(intersects[i].object.name === "Atmosphere")
                        //continue;
                    // TOMIIIIIIIIIIII
                    console.log(intersects[i].object.name);
                    // intersects[i].object.userData => object od Planet ili Star
                    console.log(intersects[i].object.userData);

                    // Ostaj
                    // Ako go trgnes returnot i raycastot pominuva preku povekje planeti ke bidat registrirani kako da si kliknal na povekje planeti vo isto vreme
                    return;
                }
            }
        })

        const controls = new OrbitControls(camera, labelRenderer.domElement);
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.enableRotate = false;
        // Animation function
        const animate = () => {
            requestAnimationFrame(animate);
            cameraAnimationZoomIn(camera, [0, 0, 8.5], 0.5, planetObj, scene, raycast, controls);

            //Planets.Mercury.bodyMesh.rotateY(0.001);
            controls.update();
            //raycast.setFromCamera(mouse, camera);

            labelRenderer.render(scene, camera);
            renderer.render(scene, camera);
        };

        animate();

        return () =>
        {

        };
    }, []);
    return (
        <></>
    );
}
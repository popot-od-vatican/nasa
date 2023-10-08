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
let planetObj: any;
let planetAtmosphere: any;

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
            planetObj.bodyMesh.scene.rotateY(speed/8.0);
        }
        else
        {
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

async function getPlanet(planetName: string)
{
    switch(planetName)
    {
        case "Mercury":
            await Planets.LoadMercury();
            Planets.Mercury.bodyMesh.scene.scale.set(0.008, 0.008, 0.008);
            planetObj = Planets.Mercury;
            planetAtmosphere = Planets.MercuryAtmosphere;
            break;
        case "Venus":
            await Planets.LoadVenus();
            Planets.Venus.bodyMesh.scene.scale.set(0.01, 0.01, 0.01);
            planetObj = Planets.Venus;
            planetAtmosphere = Planets.VenusAtmosphere;
            break;
        case "Mars":
            await Planets.LoadMars();
            Planets.Mars.bodyMesh.scene.scale.set(0.01, 0.01, 0.01);
            planetObj = Planets.Mars;
            planetAtmosphere = Planets.MarsAtmosphere;
            break;
        case "Jupiter":
            await Planets.LoadJupiter();
            Planets.Jupiter.bodyMesh.scene.scale.set(0.01, 0.01, 0.01);
            planetObj = Planets.Jupiter;
            planetAtmosphere = Planets.JupiterAtmosphere;
            break;
        case "Saturn":
            await Planets.LoadSaturn();
            Planets.Saturn.bodyMesh.scene.scale.set(0.0076, 0.0076, 0.0076);
            Planets.Saturn.bodyMesh.scene.rotateX(0.15);
            Planets.SaturnAtmosphere.bodyMesh.rotateX(0.15);
            planetObj = Planets.Saturn;
            planetAtmosphere = Planets.SaturnAtmosphere;
            break;
        case "Uranus":
            await Planets.LoadUranus();
            Planets.Uranus.bodyMesh.scene.scale.set(0.01, 0.01, 0.01);
            planetObj = Planets.Uranus;
            planetAtmosphere = Planets.UranusAtmosphere;
            break;
        case "Neptune":
            await Planets.LoadNeptune();
            Planets.Neptune.bodyMesh.scene.scale.set(0.01, 0.01, 0.01);
            planetObj = Planets.Neptune;
            planetAtmosphere = Planets.NeptuneAtmosphere;
            break;
        default:
            return "EBI SE";
    }
}

function LoadPlanetsLocation(scene: any, planetName: any, labelColor: any)
{
    console.log(labelColor);
    switch(planetName)
    {
        case "Mercury":
            Planets.Mercury.addLocation(scene, 31.46, 174.15, 'Caloris Montes', 4.0, labelColor)
            break;
        case "Venus":
            {
                const radius = 5.0;
                Planets.Venus.addLocation(scene, 65.2, 3.3, 'Maxwell Montes', radius, labelColor);
                Planets.Venus.addLocation(scene, 68.6, 399.3, 'Lakshmi Planum', radius, labelColor);
            }
            break;
        case "Mars":
            {
                const radius = 5.010;
                Planets.Mars.addLocation(scene, 88, 15, 'North Pole', radius, labelColor);
                Planets.Mars.addLocation(scene, -83.9, 160, 'Southern Pole', radius+0.130,labelColor);
                Planets.Mars.addLocation(scene, 24.6, -65, 'Kasei Valles', radius, labelColor);
                Planets.Mars.addLocation(scene, 0.8, -35.4, 'Hydraotes Chaos', radius, labelColor); 
                Planets.Mars.addLocation(scene, 22, 342, 'Mawrth Vallis', radius, labelColor);
                Planets.Mars.addLocation(scene, 22.1, 315.0, 'Becquerel Crater', radius, labelColor);
                Planets.Mars.addLocation(scene, 2.19, 342.96, 'Iani Chaos', radius, labelColor);
                Planets.Mars.addLocation(scene, -13.74, 59.20, 'Valles Marineris', radius + 0.15, labelColor);
                Planets.Mars.addLocation(scene, 1, 76, 'Hebes Chasma', radius + 0.16, labelColor);
            }
            break;
        case "Jupiter":
            {
                const radius = 4.95;
                Planets.Jupiter.addLocation(scene, -22, -112, 'Great Red Spot', radius);
            }
            break;
        case "Saturn":
            break;
        case "Uranus":
            break;
        case "Neptune":
            break;
        default:
            return "EBI SE";
    }
}

export default function ThreeScene(props: any)
{
    const canvasRef = useRef(null);

    getPlanet(props.planetName);

    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById('viewport') as HTMLCanvasElement});
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.outputColorSpace = THREE.SRGBColorSpace;

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

        //div.addEventListener('pointerdown', ()=>{console.log(1)})


        addEventListener('mousemove', (event: any) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        })
        camera.position.z = 45;

        document.addEventListener('click', ()=>{
            raycast.setFromCamera(mouse, camera);
            const intersects = raycast.intersectObjects(scene.children);

            if(intersects.length == 0)
                return;

            for(let i = 0; i < intersects.length; ++i)
            {
                //console.log(intersects[i]);
                if(intersects[i].object instanceof THREE.Mesh)
                {

                    //console.log(intersects[i].object.name);
                    //console.log(intersects[i].object.userData);
                    return;
                }
            }
        })

        const controls = new OrbitControls(camera, labelRenderer.domElement);
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.enableRotate = false;

        var hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444, 5.0);
        hemiLight.position.set( 0, 300, 0 );
        scene.add( hemiLight );

        var dirLight = new THREE.DirectionalLight( 0xffffff );
        dirLight.position.set( 75, 300, -75 );
        scene.add( dirLight );

        let added = false;
        // Animation function
        const animate = () => {
            requestAnimationFrame(animate);

            if(planetObj !== undefined)
            {
                if(!added)
                {
                    scene.add(planetObj.bodyMesh.scene);
                    scene.add(planetAtmosphere.bodyMesh);
                    LoadPlanetsLocation(scene, props.planetName, props.labelColor);
                    added = true;
                }
                cameraAnimationZoomIn(camera, [0, 0, 12.5], 0.6, planetObj, scene, raycast, controls);
            }
            else
            {
            }

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
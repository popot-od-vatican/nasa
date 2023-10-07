import React, { useRef, useEffect } from 'react';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as Planets from './planets.tsx';
import * as THREE from 'three';

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
        case "Neptun":
            return {"Planet": Planets.Neptun, "Atmosphere": Planets.NeptunAtmosphere};
        default:
            return "EBI SE";
    }
}

export default function ThreeScene(props)
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

        //div.addEventListener('pointerdown', ()=>{console.log(1)})

        window.addEventListener("pointerdown", (event): void =>
        {
            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
            raycast.setFromCamera(mouse, camera);
            const intersections = raycast.intersectObjects(scene.children);
            //console.log(intersections.length);
        });


        addEventListener('mousemove', (event: any) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        })

        //scene.background = new THREE.TextureLoader().load('./textures/background.png');
        // Add a cube to the scene
        //const globe = new Planet(4.5, 50, 50, earthTexture);
        //globe.addToScene(scene);
        //const atmoSphere = new Planet(4.5 * 1.1, 50, 50, earthAtmosphere);
        //atmoSphere.addToScene(scene);
        //atmoSphere.bodyMesh.position.set(0, 0, 0);
        //globe.bodyMesh.position.set(0, 0, 0);
        // Position the camera
        //scene.add(Planets.Mars.bodyMesh);
        //scene.add(Planets.MarsAtmosphere.bodyMesh);
        camera.position.z = 8;
        scene.add(planetObj.bodyMesh);
        scene.add(planetAtmosphere.bodyMesh);

        const controls = new OrbitControls(camera, labelRenderer.domElement);
        // Animation function
        const animate = () => {
            requestAnimationFrame(animate);

            //Planets.Mercury.bodyMesh.rotateY(0.001);
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();


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
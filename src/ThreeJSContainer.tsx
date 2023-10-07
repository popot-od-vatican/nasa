import React, { useRef, useEffect } from 'react';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as Planets from './planets.tsx';
import * as THREE from 'three';

export default function ThreeScene()
{
    const canvasRef = useRef(null);

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

        const div = document.createElement('div');
        div.className = 'label';
        div.textContent = 'NESO';
        div.style.background = 'purple';

        const raycast = new THREE.Raycaster();

        scene.add(Planets.Mars.bodyMesh);

        const label = new CSS2DObject(div);
        label.position.set(0.0, 0, -3.5);
        //Planets.Mercury.bodyMesh.add(label);
        scene.add(label);
        scene.add(camera);

        Planets.Mars.addLocation(51.5072, 0.1276);

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
        camera.position.z = 10;

        const controls = new OrbitControls(camera, labelRenderer.domElement);
        // Animation function
        const animate = () => {
            requestAnimationFrame(animate);

            //Planets.Mercury.bodyMesh.rotateY(0.001);

            label.getWorldPosition(raycast.ray.origin);
            const rd=camera.position.clone().sub(raycast.ray.origin).normalize();
            raycast.ray.direction.set(rd.x,rd.y,rd.z);
            const hits=raycast.intersectObjects(scene.children);
            if(hits.length>0){ label.visible=false; }
            else{ label.visible=true; }



            labelRenderer.render(scene, camera);
            renderer.render(scene, camera);
        };

        animate();

        return () =>
        {

        };
    }, []);
    return (
        <div ref={canvasRef}></div>
    );
}
import * as THREE from 'three';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';


const vertexShader = `
    varying vec2 vertexUV;
    varying vec3 vertexNormal;

    void main()
    {
        vertexUV = uv;
        vertexNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, position.z, 1.0);
    }
`;

const fragmetShader = `
    uniform sampler2D globeTexture;
    uniform vec3 vColor;
    varying vec2 vertexUV;
    varying vec3 vertexNormal;

    void main()
    {
        float intensity = 1.05 - dot(vertexNormal, vec3(0.0, 0.0, 1.0));
        vec3 atmosphere = vColor * pow(intensity, 2.0);

        gl_FragColor = vec4(atmosphere + texture2D(globeTexture, vertexUV).xyz, 1.0);
    }
`;

const atmoSphereVertexShader = `
    varying vec3 vertexNormal;

    void main()
    {
        vertexNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const atmoSphereFragmentShader = `
    varying vec3 vertexNormal;
    uniform vec4 vColor;

    void main()
    {
        float intensity = pow(0.8 - dot(vertexNormal, vec3(0, 0, 1.0)), 2.0);

        gl_FragColor = vColor * intensity;
    }
`;

export function placeObjectOnPlanet(object: any, lat: any, lon: any, radius: any) {
    let latRad = (lat) * Math.PI / 180;
    let lonRad = -(lon) * Math.PI / 180;
    object.position.set(
        Math.cos(latRad) * Math.cos(lonRad) * radius,
        Math.sin(latRad) * radius,
        Math.cos(latRad) * Math.sin(lonRad) * radius
    );
    object.rotation.set(0.0, -lonRad, latRad - Math.PI * 0.5);
}

const textureLoader: any = new THREE.TextureLoader();

class Planet
{
    public radius: number;
    public widthSeg: number;
    public heightSeg: number;
    public bodyMesh: any;
    public labels: any = [];

    constructor(radius: number, widthSeg: number, heightSeg: number, texture: any)
    {
        this.radius = radius;
        this.widthSeg = widthSeg;
        this.heightSeg = heightSeg;

        const bodyGeo = new THREE.SphereGeometry(this.radius, this.widthSeg, this.heightSeg);
        
        this.bodyMesh = new THREE.Mesh(bodyGeo, texture);
    }

    addLocation(lat: any, lon: any, name: string): void
    {
        const pointGeo = new THREE.SphereGeometry(0.08, 20, 20);
        const pointMat = new THREE.MeshBasicMaterial({color: "red"});
        const pointMesh = new THREE.Mesh(pointGeo, pointMat);

        let latRad = (lat) * Math.PI / 180;
        let lonRad = -(lon) * Math.PI / 180;
        pointMesh.position.set(
            Math.cos(latRad) * Math.cos(lonRad) * this.radius,
            Math.sin(latRad) * this.radius,
            Math.cos(latRad) * Math.sin(lonRad) * this.radius
        );
        pointMesh.rotation.set(0.0, -lonRad, latRad - Math.PI * 0.5);
        this.bodyMesh.add(pointMesh);

        const div = document.createElement('div');
        div.className = 'label';
        div.textContent = name;
        div.style.background = 'purple';
        const label = new CSS2DObject(div);
        label.position.set(Math.cos(latRad) * Math.cos(lonRad) * this.radius, Math.sin(latRad) * this.radius, Math.cos(latRad) * Math.sin(lonRad) * this.radius);
        label.center.set(0, 1);
        this.bodyMesh.add(label);
        this.labels.push(label);

    }

    updateLabelVisibility(scene: any, camera: any, raycast: any): void
    {
        for(let i = 0; i < this.labels.length; ++i)
        {
            this.labels[i].getWorldPosition(raycast.ray.origin);
            const rd=camera.position.clone().sub(raycast.ray.origin).normalize();
            raycast.ray.direction.set(rd.x,rd.y,rd.z);
            const hits=raycast.intersectObjects(scene.children);
            if(hits.length>0){ this.labels[i].visible=false; }
            else{ this.labels[i].visible=true; }
        }
    }

    addToScene(scene: any): void
    {
        scene.add(this.bodyMesh);
    }
}

export const earthTexture = new THREE.ShaderMaterial({
    uniforms:
    {
        globeTexture: {
            value: textureLoader.load('./textures/planets/earth.jpg')
        }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmetShader,
});

export const earthAtmoSphereTexture = new THREE.ShaderMaterial({

    uniforms: {
        colors: {
            value: [0.9, 0.1, 0.1, 1.0]
        }
    },

    vertexShader: atmoSphereVertexShader,
    fragmentShader: atmoSphereFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
});

// Mercury
export const mercuryTexture = new THREE.ShaderMaterial({
    uniforms:
    {
        globeTexture: {
            value: textureLoader.load('./textures/planets/mercury.jpg')
        },
        vColor: {
            value: [0.1, 0.9, 0.1] // Za Highlight
        }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmetShader,
});

export const mercuryAtmoSphereTexture = new THREE.ShaderMaterial({

    uniforms: {
        vColor: {
            value: [0.9, 0.1, 0.1, 1.0] // Za obvivka
        }
    },

    vertexShader: atmoSphereVertexShader,
    fragmentShader: atmoSphereFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
});

// Venus
export const venusTexture = new THREE.ShaderMaterial({
    uniforms:
    {
        globeTexture: {
            value: textureLoader.load('./textures/planets/venus.jpg')
        },
        vColor: {
            value: [0.1, 0.9, 0.1] // Za Highlight
        }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmetShader,
});

export const venusAtmoSphereTexture = new THREE.ShaderMaterial({

    uniforms: {
        vColor: {
            value: [0.9, 0.1, 0.1, 1.0] // Za obvivka
        }
    },

    vertexShader: atmoSphereVertexShader,
    fragmentShader: atmoSphereFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
});

// Mars
export const marsTexture = new THREE.ShaderMaterial({
    uniforms:
    {
        globeTexture: {
            value: textureLoader.load('./textures/planets/mars.jpg')
        },
        vColor: {
            value: [0.85, 0.1, 0.1] // Za Highlight
        }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmetShader,
});

export const marsAtmoSphereTexture = new THREE.ShaderMaterial({

    uniforms: {
        vColor: {
            value: [0.9, 0.1, 0.1, 1.0] // Za obvivka
        }
    },

    vertexShader: atmoSphereVertexShader,
    fragmentShader: atmoSphereFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
});

export const Earth = new Planet(4.5, 50, 50, earthTexture);
export const EarthAtmosphere = new Planet(4.6, 50, 50, earthAtmoSphereTexture);
export const Mercury = new Planet(3.2, 50, 50, mercuryTexture);
export const MercuryAtmosphere = new Planet(3.4, 50, 50, mercuryAtmoSphereTexture);
export const Venus = new Planet(3.2, 50, 50, venusTexture);
export const VenusAtmosphere = new Planet(3.4, 50, 50, venusAtmoSphereTexture);
export const Mars = new Planet(3.2, 50, 50, marsTexture);
export const MarsAtmosphere = new Planet(3.4, 50, 50, marsAtmoSphereTexture);

/*
export const mercuryTexture = new THREE.MeshStandardMaterial({
    map: textureLoader.load('./textures/planets/mercury.jpg'),
});

export const venusTexture = new THREE.MeshStandardMaterial({
    map: textureLoader.load('./textures/planets/venus.jpg'),
});

export const marsTexture = new THREE.MeshStandardMaterial({
    map: textureLoader.load('./textures/planets/mars.png'),
});

export const jupiterTexture = new THREE.MeshStandardMaterial({
    map: textureLoader.load('./textures/planets/jupiter.jpg'),
});

export const saturnTexture = new THREE.MeshStandardMaterial({
    map: textureLoader.load('./textures/planets/saturn.jpg'),
});

export const neptunTexture = new THREE.MeshStandardMaterial({
    map: textureLoader.load('./textures/planets/neptun.jpg'),
});

export const uranusTexture = new THREE.MeshStandardMaterial({
    map: textureLoader.load('./textures/planets/uranus.png'),
});

/*
export const saturnRingTexture = new THREE.MeshBasicMaterial({
    map: textureLoader.load('./textures/rings/saturnRing.png'),
    transparent: true,
});

export const uranusRingTexture = new THREE.MeshBasicMaterial({
    map: textureLoader.load('./textures/rings/uranusRing.png'),
    transparent: true,
});

*/

/*
export const moonTexture = new THREE.MeshStandardMaterial({
    map: textureLoader.load('./textures/satellites/moon.jfif'),
});
*/

/*
export const titanTexture = new THREE.MeshStandardMaterial({
    map: textureLoader.load('./textures/satellites/titan.jfif'),
});
*/

/*
export const ganymedeTexture = new THREE.MeshStandardMaterial({
    map: textureLoader.load('./textures/satellites/ganymede.jpg'),
});
*/

/*
export const plutoTexture = new THREE.MeshStandardMaterial({
    map: textureLoader.load('./textures/satellites/pluto.jpg'),
});
*/

/*
export const earthClouds = new THREE.MeshStandardMaterial({
    map: textureLoader.load('./textures/planets/earthClouds.png'),
    transparent: true,
});
*/
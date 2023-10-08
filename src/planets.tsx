import * as THREE from 'three';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


const modelLoader = new GLTFLoader();

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
    public bodyMesh: any;
    public labels: any = [];

    constructor(model: any = null, texture: any = null, radius: any)
    {
        if(model !== null)
        {
            this.bodyMesh = model;
        }
        else
        {
            const Geo = new THREE.SphereGeometry(radius, 50, 50);
            this.bodyMesh = new THREE.Mesh(Geo, texture);
        }

    }

    addRing(innerRadius: number, outerRadius: number, segments: number, rotation: any, texture: any): void
    {
        const ringGeo = new THREE.RingGeometry(innerRadius, outerRadius, segments);
        const ringMesh = new THREE.Mesh(ringGeo, texture);
        ringMesh.position.set(0, 0, 0);
        ringMesh.rotateX(rotation[0]);
        ringMesh.rotateY(rotation[1]);
        ringMesh.rotateZ(rotation[2]);
        this.bodyMesh.add(ringMesh);
    }

    addLocation(scene: any, lat: any, lon: any, name: string, radius: any, labelColor: any): void
    {
        const pointGeo = new THREE.SphereGeometry(0.05, 20, 20);
        const pointMat = new THREE.MeshBasicMaterial({color: "red"});
        const pointMesh = new THREE.Mesh(pointGeo, pointMat);

        let latRad = (lat) * Math.PI / 180;
        let lonRad = -(lon) * Math.PI / 180;
        pointMesh.position.set(
            Math.cos(latRad) * Math.cos(lonRad) * radius,
            Math.sin(latRad) * radius,
            Math.cos(latRad) * Math.sin(lonRad) * radius,
        );

        const div = document.createElement('div');
        div.className = 'label';
        div.textContent = name;
        div.style.background = labelColor;
        const label = new CSS2DObject(div);
        label.position.set(Math.cos(latRad) * Math.cos(lonRad) * radius + 0.25, Math.sin(latRad) * radius + 0.15, Math.cos(latRad) * Math.sin(lonRad) * radius+ 0.25);
        //console.log(label.position);
        div.addEventListener('pointerdown', ()=>{})
        scene.add(label);
        scene.add(pointMesh);
        this.labels.push(label);
        //label.element.style.opacity = '0';
    }

    updateLabelVisibility(scene: any, camera: any, raycast: any): void
    {
        for(let i = 0; i < this.labels.length; ++i)
        {
            raycast.ray.origin.copy(camera.position);
            this.labels[i].getWorldPosition(raycast.ray.origin);
            const rd=camera.position.clone().sub(raycast.ray.origin).normalize();
            raycast.ray.direction.set(rd.x,rd.y,rd.z);

            const hits=raycast.intersectObjects(scene.children);
            if(hits.length > 0){


                if(hits.length == 2)
                {
                    this.labels[i].element.style.opacity = '0';
                }
                else
                {
                    this.labels[i].element.style.opacity = '1';
                }
                //console.log(hits);
                //this.labels[i].visible = false;
                //this.labels[i].element.style.opacity = '0';
            }
            else{
                //this.labels[i].visible = true;
                this.labels[i].element.style.opacity = '1';
            }
        }
    }

    addToScene(scene: any): void
    {
        scene.add(this.bodyMesh);
    }
}

// Mercury
export const mercuryTexture = new THREE.ShaderMaterial({
    uniforms:
    {
        globeTexture: {
            value: textureLoader.load('./textures/planets/mercury.jpg')
        },
        vColor: {
            value: [0.4, 0.4, 0.8] // Za Highlight
        }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmetShader,
});

export const mercuryAtmoSphereTexture = new THREE.ShaderMaterial({

    uniforms: {
        vColor: {
            value: [0.2, 0.1, 0.9, 1.0] // Za obvivka
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
            value: [0.5, 0.5, 0.5] // Za Highlight
        }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmetShader,
});

export const venusAtmoSphereTexture = new THREE.ShaderMaterial({

    uniforms: {
        vColor: {
            value: [0.5, 0.5, 0.5, 1.0] // Za obvivka
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

// Jupiter
export const jupiterTexture = new THREE.ShaderMaterial({
    uniforms:
    {
        globeTexture: {
            value: textureLoader.load('./textures/planets/jupiter.jpg')
        },
        vColor: {
            value: [0.85, 0.1, 0.1] // Za Highlight
        }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmetShader,
});

export const jupiterAtmoSphereTexture = new THREE.ShaderMaterial({

    uniforms: {
        vColor: {
            value: [0.3, 0.6, 0.3, 1.0] // Za obvivka
        }
    },

    vertexShader: atmoSphereVertexShader,
    fragmentShader: atmoSphereFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
});

// Saturn
export const saturnTexture = new THREE.ShaderMaterial({
    uniforms:
    {
        globeTexture: {
            value: textureLoader.load('./textures/planets/saturn.jpg')
        },
        vColor: {
            value: [0.85, 0.1, 0.1] // Za Highlight
        }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmetShader,
});

export const saturnAtmoSphereTexture = new THREE.ShaderMaterial({

    uniforms: {
        vColor: {
            value: [0.9, 0.8, 0.1, 1.0] // Za obvivka
        }
    },

    vertexShader: atmoSphereVertexShader,
    fragmentShader: atmoSphereFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
});

// Uranus
export const uranusTexture = new THREE.ShaderMaterial({
    uniforms:
    {
        globeTexture: {
            value: textureLoader.load('./textures/planets/uranus.jpg')
        },
        vColor: {
            value: [0.85, 0.7, 0.1] // Za Highlight
        }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmetShader,
});

export const uranusAtmoSphereTexture = new THREE.ShaderMaterial({

    uniforms: {
        vColor: {
            value: [1.0, 0.50, 0.1, 1.0] // Za obvivka
        }
    },

    vertexShader: atmoSphereVertexShader,
    fragmentShader: atmoSphereFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
});

// Neptun
export const neptuneTexture = new THREE.ShaderMaterial({
    uniforms:
    {
        globeTexture: {
            value: textureLoader.load('./textures/planets/neptune.jpg')
        },
        vColor: {
            value: [0.85, 0.1, 0.1] // Za Highlight
        }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmetShader,
});

export const neptuneAtmoSphereTexture = new THREE.ShaderMaterial({

    uniforms: {
        vColor: {
            value: [0.9, 0.15, 0.5, 1.0] // Za obvivka
        }
    },

    vertexShader: atmoSphereVertexShader,
    fragmentShader: atmoSphereFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
});


export let Mercury: any;
export let MercuryAtmosphere: any;
export let Venus: any;
export let VenusAtmosphere: any;
export let Mars: any;
export let MarsAtmosphere: any;
export let Jupiter: any;
export let JupiterAtmosphere: any;
export let Saturn: any;
export let SaturnAtmosphere: any;
export let Uranus: any;
export let UranusAtmosphere: any;
export let Neptune: any;
export let NeptuneAtmosphere: any;

export function LoadMercury(): any
{
    return new Promise((resolve, reject) => {

        modelLoader.load('./models/Mercury.glb', (object) =>
        {
            Mercury = new Planet(object, null, null);
            MercuryAtmosphere = new Planet(null, mercuryAtmoSphereTexture, 4.35);
            resolve('Success');
        });
    })
}

export function LoadVenus(): any
{
    return new Promise((resolve, reject) => {

        modelLoader.load('./models/Venus.glb', (object) =>
        {
            Venus = new Planet(object, null, null);
            VenusAtmosphere = new Planet(null, venusAtmoSphereTexture, 5.5);
            resolve('Success');
        });
    })
}

export function LoadMars(): any
{
    return new Promise((resolve, reject) => {

        modelLoader.load('./models/Mars.glb', (object) =>
        {
            Mars = new Planet(object, null, null);
            MarsAtmosphere = new Planet(null, marsAtmoSphereTexture, 5.4);
            resolve('Success');
        });
    })
}

export function LoadJupiter(): any
{
    return new Promise((resolve, reject) => {

        modelLoader.load('./models/Jupiter.glb', (object) =>
        {
            Jupiter = new Planet(object, null, null);
            JupiterAtmosphere = new Planet(null, jupiterAtmoSphereTexture, 5.6);
            resolve('Success');
        });
    })
}

export function LoadSaturn(): any
{
    return new Promise((resolve, reject) => {

        modelLoader.load('./models/Saturn.glb', (object) =>
        {
            Saturn = new Planet(object, null, null);
            SaturnAtmosphere = new Planet(null, saturnAtmoSphereTexture, 4.1);
            resolve('Success');
        });
    })
}

export function LoadUranus(): any
{
    return new Promise((resolve, reject) => {

        modelLoader.load('./models/Uranus.glb', (object) =>
        {
            Uranus = new Planet(object, null, null);
            UranusAtmosphere = new Planet(null, uranusAtmoSphereTexture, 5.4);
            resolve('Success');
        });
    })
}

export function LoadNeptune(): any
{
    return new Promise((resolve, reject) => {

        modelLoader.load('./models/Neptune.glb', (object) =>
        {
            Neptune = new Planet(object, null, null);
            NeptuneAtmosphere = new Planet(null, neptuneAtmoSphereTexture, 5.63);
            resolve('Success');
        });
    })
}

/*
export const Venus = new Planet(3.2, 50, 50, venusTexture, "Venus");
export const VenusAtmosphere = new Planet(3.6, 50, 50, venusAtmoSphereTexture, "Atmosphere");

export const Mars = new Planet(3.2, 50, 50, marsTexture, "Mars");
export const MarsAtmosphere = new Planet(3.4, 50, 50, marsAtmoSphereTexture, "Atmosphere");

export const Jupiter = new Planet(4.2, 50, 50, jupiterTexture, "Jupiter");
export const JupiterAtmosphere = new Planet(4.6, 50, 50, jupiterAtmoSphereTexture, "Atmosphere");

export const Saturn = new Planet(3.9, 50, 50, saturnTexture, "Saturn");
export const SaturnAtmosphere = new Planet(4.1, 50, 50, saturnAtmoSphereTexture, "Atmosphere");
Saturn.addRing(4.4, 5.2, 50, [5.0, 0.0, 0.0], new THREE.MeshBasicMaterial({
    map: textureLoader.load('textures/planets/saturnRing.png'),
    side: THREE.DoubleSide,
    transparent: true,
}));

export const Uranus = new Planet(3.2, 50, 50, uranusTexture, "Uranus");
export const UranusAtmosphere = new Planet(3.4, 50, 50, uranusAtmoSphereTexture, "Atmosphere");
Uranus.addRing(4.5, 5.2, 50, [-1.9, 0.0, 0.0], new THREE.MeshBasicMaterial({
    map: textureLoader.load('textures/planets/uranusRing.png'),
    side: THREE.DoubleSide,
    transparent: true,
}));


export const Neptune = new Planet(2.76, 50, 50, neptuneTexture, "Neptun");
export const NeptuneAtmosphere = new Planet(2.92, 50, 50, neptuneAtmoSphereTexture, "Atmosphere");
*/
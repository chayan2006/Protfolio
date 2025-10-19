// Custom Cursor Logic
const cursorDot = document.querySelector('#cursor-dot');
const cursorOutline = document.querySelector('#cursor-outline');

window.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    cursorDot.style.left = `${clientX}px`;
    cursorDot.style.top = `${clientY}px`;
    cursorOutline.style.left = `${clientX}px`;
    cursorOutline.style.top = `${clientY}px`;
});

document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseover', () => cursorOutline.classList.add('hover'));
    el.addEventListener('mouseout', () => cursorOutline.classList.remove('hover'));
});

// Smooth scrolling & Active nav link highlighting
const sections = document.querySelectorAll('main section[id]');
const navItems = document.querySelectorAll('nav .nav-item');

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (document.querySelector(targetId)) {
            document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
        }
    });
});

const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navItems.forEach(item => {
                item.classList.remove('active');
                const link = item.querySelector('a');
                if (link && link.getAttribute('href') === `#${id}`) {
                    item.classList.add('active');
                }
            });
        }
    });
}, { rootMargin: '-40% 0px -60% 0px' });

sections.forEach(section => navObserver.observe(section));

// Scroll-reveal animation
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in-section').forEach(section => {
    scrollObserver.observe(section);
});


// Three.js Background Animation
if (typeof THREE !== 'undefined') {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg-canvas'), alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = 15;

    const particlesCount = 250;
    const positions = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);
    const velocities = [];

    for (let i = 0; i < particlesCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 25;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
        sizes[i] = Math.random() * 0.1 + 0.05;
        velocities.push(new THREE.Vector3((Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01));
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: false,
        color: 0x64ffda,
        transparent: true,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const mouse = new THREE.Vector2(-100, -100);
    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    const raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 0.5;

    function animate() {
        requestAnimationFrame(animate);
        
        const positionAttribute = geometry.attributes.position;
        const sizeAttribute = geometry.attributes.size;

        for (let i = 0; i < particlesCount; i++) {
            positionAttribute.array[i * 3] += velocities[i].x;
            positionAttribute.array[i * 3 + 1] += velocities[i].y;
            positionAttribute.array[i * 3 + 2] += velocities[i].z;
            
            if (Math.abs(positionAttribute.array[i * 3]) > 12.5) velocities[i].x *= -1;
            if (Math.abs(positionAttribute.array[i * 3 + 1]) > 12.5) velocities[i].y *= -1;
            if (Math.abs(positionAttribute.array[i * 3 + 2]) > 12.5) velocities[i].z *= -1;
        }
        positionAttribute.needsUpdate = true;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(particles);

        // Reset sizes
        for(let i = 0; i < particlesCount; i++) {
            sizeAttribute.array[i] -= 0.01;
            if(sizeAttribute.array[i] < 0.1) sizeAttribute.array[i] = 0.1;
        }

        if (intersects.length > 0) {
            intersects.forEach(intersect => {
                sizeAttribute.array[intersect.index] = 0.4;
            });
        }
        
        sizeAttribute.needsUpdate = true;

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

/**
 * Utility functions for the Tanks! game
 */

// Helper for random number generation
const Utils = {
    // Random number between min and max (inclusive)
    random: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    
    // Random element from an array
    randomElement: (array) => array[Math.floor(Math.random() * array.length)],
    
    // Detect collision between two objects with position and size
    boxCollision: (box1, box2) => {
        // Check if either box or their properties are undefined/null
        if (!box1 || !box2 || !box1.position || !box2.position || 
            !box1.size || !box2.size) {
            return false;
        }
        
        // Safe access to position and size properties
        const pos1 = box1.position || { x: 0, z: 0 };
        const pos2 = box2.position || { x: 0, z: 0 };
        const size1 = box1.size || { x: 0, z: 0 };
        const size2 = box2.size || { x: 0, z: 0 };
        
        // Ensure position and size properties have x and z
        if (pos1.x === undefined || pos1.z === undefined || 
            pos2.x === undefined || pos2.z === undefined ||
            size1.x === undefined || size1.z === undefined ||
            size2.x === undefined || size2.z === undefined) {
            return false;
        }
        
        // Get half-sizes for more intuitive collision calculation
        const halfWidth1 = size1.x / 2;
        const halfDepth1 = size1.z / 2;
        const halfWidth2 = size2.x / 2;
        const halfDepth2 = size2.z / 2;
        
        // AABB (Axis-Aligned Bounding Box) collision check with slightly expanded bounds
        // This adds a tiny bit of extra collision margin
        const collisionMargin = 0.05;
        
        return (
            pos1.x - (halfWidth1 + collisionMargin) < pos2.x + (halfWidth2 + collisionMargin) &&
            pos1.x + (halfWidth1 + collisionMargin) > pos2.x - (halfWidth2 + collisionMargin) &&
            pos1.z - (halfDepth1 + collisionMargin) < pos2.z + (halfDepth2 + collisionMargin) &&
            pos1.z + (halfDepth1 + collisionMargin) > pos2.z - (halfDepth2 + collisionMargin)
        );
    },
    
    // Calculate distance between two points
    distance: (x1, z1, x2, z2) => {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2));
    },
    
    // Calculate angle between two points in radians
    angle: (x1, z1, x2, z2) => {
        return Math.atan2(z2 - z1, x2 - x1);
    },
    
    // Convert degrees to radians
    degToRad: (degrees) => degrees * (Math.PI / 180),
    
    // Convert radians to degrees
    radToDeg: (radians) => radians * (180 / Math.PI),
    
    // Clamp a value between min and max
    clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
    
    // Linear interpolation
    lerp: (a, b, t) => a + (b - a) * t,
    
    // Deep clone an object
    deepClone: (obj) => JSON.parse(JSON.stringify(obj)),
    
    // Create an explosion effect at position
    createExplosion: (scene, position, radius = 1, duration = 1000) => {
        const particles = [];
        const count = 20;
        
        // Create particle group
        for (let i = 0; i < count; i++) {
            const geometry = new THREE.SphereGeometry(0.1, 8, 8);
            const material = new THREE.MeshBasicMaterial({ 
                color: 0xffaa00,
                transparent: true,
                opacity: 1 
            });
            
            const particle = new THREE.Mesh(geometry, material);
            
            // Set random position within radius
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * radius;
            const x = Math.cos(angle) * r;
            const z = Math.sin(angle) * r;
            
            particle.position.set(
                position.x + x,
                position.y + Math.random() * 0.5,
                position.z + z
            );
            
            // Set random velocity
            particle.velocity = {
                x: x * 0.1,
                y: 0.1 + Math.random() * 0.1,
                z: z * 0.1
            };
            
            scene.add(particle);
            particles.push(particle);
        }
        
        // Animation timer
        const startTime = Date.now();
        
        // Animation function
        function animateParticles() {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                // Update particles
                particles.forEach(particle => {
                    particle.position.x += particle.velocity.x;
                    particle.position.y += particle.velocity.y;
                    particle.position.z += particle.velocity.z;
                    
                    // Slow down
                    particle.velocity.x *= 0.95;
                    particle.velocity.y *= 0.95;
                    particle.velocity.z *= 0.95;
                    
                    // Fade out
                    particle.material.opacity = 1 - progress;
                    particle.scale.multiplyScalar(0.97);
                });
                
                requestAnimationFrame(animateParticles);
            } else {
                // Remove particles
                particles.forEach(particle => {
                    scene.remove(particle);
                    particle.geometry.dispose();
                    particle.material.dispose();
                });
            }
        }
        
        // Start animation
        animateParticles();
    }
}; 
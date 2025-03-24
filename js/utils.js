import * as THREE from 'three';

/**
 * Utility functions for the Tanks! game
 */

// Helper for random number generation
export class Utils {
    static random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // Random element from an array
    static randomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    // Detect collision between two objects with position and size
    static boxCollision(box1, box2) {
        return (
            box1.position.x - box1.size.x/2 < box2.position.x + box2.size.x/2 &&
            box1.position.x + box1.size.x/2 > box2.position.x - box2.size.x/2 &&
            box1.position.z - box1.size.z/2 < box2.position.z + box2.size.z/2 &&
            box1.position.z + box1.size.z/2 > box2.position.z - box2.size.z/2
        );
    }
    
    // Calculate distance between two points
    static distance(x1, z1, x2, z2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2));
    }
    
    // Calculate angle between two points in radians
    static angle(x1, z1, x2, z2) {
        return Math.atan2(z2 - z1, x2 - x1);
    }
    
    // Convert degrees to radians
    static degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    // Convert radians to degrees
    static radToDeg(radians) {
        return radians * (180 / Math.PI);
    }
    
    // Clamp a value between min and max
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    
    // Linear interpolation
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    // Deep clone an object
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    
    // Create an explosion effect at position
    static createExplosion(scene, position, scale, duration) {
        const particleCount = 20;
        const particles = [];
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xff6600 });
        
        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(position);
            
            // Random direction
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 0.5;
            particle.userData.velocity = new THREE.Vector3(
                Math.cos(angle) * speed,
                Math.random() * speed,
                Math.sin(angle) * speed
            );
            
            scene.add(particle);
            particles.push(particle);
        }
        
        const startTime = performance.now();
        
        function animateParticles() {
            const currentTime = performance.now();
            const elapsed = currentTime - startTime;
            
            if (elapsed < duration) {
                particles.forEach(particle => {
                    particle.position.add(particle.userData.velocity);
                    particle.userData.velocity.y -= 0.01; // Gravity
                });
                
                requestAnimationFrame(animateParticles);
            } else {
                particles.forEach(particle => {
                    scene.remove(particle);
                    geometry.dispose();
                    material.dispose();
                });
            }
        }
        
        animateParticles();
    }
} 
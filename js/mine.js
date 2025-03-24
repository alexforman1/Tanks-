import * as THREE from 'three';
import { Utils } from './utils.js';

/**
 * Mine Class - Represents mines placed by tanks
 */
export class Mine {
    constructor(scene, position, owner = null) {
        this.scene = scene;
        this.position = position.clone();
        this.owner = owner;
        this.active = true;
        this.timeToArm = 5000; // ms: Explode 5 seconds after placement
        this.creationTime = Date.now();
        this.explosionRadius = 3;
        this.damage = 1;
        this.size = 0.3;
        
        console.log("Mine created at:", 
            this.position.x.toFixed(2), 
            this.position.y.toFixed(2), 
            this.position.z.toFixed(2)
        );
        
        // Create mine mesh
        const mineGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16);
        const mineMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.7,
            metalness: 0.5
        });
        
        this.mesh = new THREE.Mesh(mineGeometry, mineMaterial);
        this.mesh.position.copy(this.position);
        this.mesh.rotation.x = Math.PI / 2; // Lay flat on the ground
        
        // Add to scene
        scene.add(this.mesh);
        
        // Blinking indicator light
        const indicatorGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const indicatorMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.8
        });
        
        this.indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
        this.indicator.position.set(0, 0.08, 0);
        this.mesh.add(this.indicator);
        
        // Start blinking
        this.startBlinking();
    }
    
    /**
     * Make the indicator light blink
     */
    startBlinking() {
        const blinkInterval = 200; // ms
        let visible = true;
        
        const blink = () => {
            if (!this.active || !this.indicator) return;
            
            // Toggle visibility
            visible = !visible;
            this.indicator.visible = visible;
            
            // Continue blinking
            setTimeout(blink, blinkInterval);
        };
        
        // Start blinking cycle
        setTimeout(blink, blinkInterval);
    }
    
    /**
     * Update mine state and check for detonation
     * @param {Array} tanks - Array of tanks to check for proximity
     * @returns {Object|null} Detonation data if exploded, null otherwise
     */
    update(tanks) {
        if (!this.active) return null;
        const now = Date.now();
        // If 5 seconds have passed, detonate regardless of tank proximity
        if (now - this.creationTime >= this.timeToArm) {
            this.detonate();
            return {
                position: this.position,
                radius: this.explosionRadius,
                damage: this.damage,
                owner: this.owner
            };
        }
        return null;
    }
    
    /**
     * Detonate the mine
     */
    detonate() {
        if (!this.active) return;
        
        this.active = false;
        
        // Create explosion effect
        const explosionGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const explosionMaterial = new THREE.MeshBasicMaterial({
            color: 0xff8800,
            transparent: true,
            opacity: 0.8
        });
        
        const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
        explosion.position.copy(this.position);
        this.scene.add(explosion);
        
        // Animate explosion
        const startScale = 0.1;
        const endScale = this.explosionRadius;
        const duration = 300; // ms
        const startTime = Date.now();
        
        const animateExplosion = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Scale explosion
            const scale = startScale + (endScale - startScale) * progress;
            explosion.scale.set(scale, scale, scale);
            
            // Fade out
            explosionMaterial.opacity = 0.8 * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(animateExplosion);
            } else {
                // Remove explosion mesh
                this.scene.remove(explosion);
                explosionGeometry.dispose();
                explosionMaterial.dispose();
            }
        };
        
        requestAnimationFrame(animateExplosion);
        
        // Hide mine mesh
        this.mesh.visible = false;
    }
    
    /**
     * Remove mine from scene
     */
    remove() {
        this.scene.remove(this.mesh);
        
        // Clean up geometries and materials
        if (this.mesh.geometry) this.mesh.geometry.dispose();
        if (this.mesh.material) this.mesh.material.dispose();
        
        if (this.indicator.geometry) this.indicator.geometry.dispose();
        if (this.indicator.material) this.indicator.material.dispose();
    }
} 
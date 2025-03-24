import * as THREE from 'three';
import { Utils } from './utils.js';

/**
 * Projectile Class - Represents bullets fired by tanks
 */
export class Projectile {
    constructor(scene, position, direction, speed = 0.05, owner = null) {
        // Safety check - don't create projectiles with zero direction
        if (direction.lengthSq() === 0) {
            console.error("Cannot create projectile with zero direction vector!");
            this.active = false;
            return;
        }
        
        console.log("Projectile created at:", 
            position.x.toFixed(2), 
            position.y.toFixed(2), 
            position.z.toFixed(2),
            "with direction:", 
            direction.x.toFixed(2), 
            direction.y.toFixed(2), 
            direction.z.toFixed(2)
        );
        
        this.scene = scene;
        this.position = position.clone();
        this.direction = direction.clone().normalize();
        this.speed = speed;
        this.owner = owner;
        this.bounceCount = 0;
        this.maxBounces = 1; // Only one bounce for bullets
        this.damage = 1;
        this.active = true;
        this.timeAlive = 0;
        this.size = 0.15;
        
        // Create projectile mesh
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        
        // Add trail effect
        const trailGeometry = new THREE.BufferGeometry();
        const trailMaterial = new THREE.LineBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.7
        });
        
        // Create trail points
        this.trailPoints = [];
        for (let i = 0; i < 10; i++) {
            this.trailPoints.push(this.position.clone());
        }
        
        trailGeometry.setFromPoints(this.trailPoints);
        this.trail = new THREE.Line(trailGeometry, trailMaterial);
        
        // Add to scene
        scene.add(this.mesh);
        scene.add(this.trail);
    }
    
    /**
     * Update projectile position
     */
    update(deltaTime) {
        if (!this.active) return;
        
        // Use a constant factor for consistent speed regardless of framerate
        const speedFactor = deltaTime / 16.67; // 60fps baseline
        
        // Use steps to check for collisions along the path
        const steps = 8; 
        const stepSize = this.speed * speedFactor / steps;
        
        for (let i = 0; i < steps; i++) {
            // Store previous position
            const prevPosition = this.position.clone();
            
            // Move in small increments
            this.position.add(
                this.direction.clone().multiplyScalar(stepSize)
            );
        }
        
        // Update mesh position
        this.mesh.position.copy(this.position);
        
        // Update trail
        this.trailPoints.pop(); // Remove last point
        this.trailPoints.unshift(this.position.clone()); // Add current position at the beginning
        this.trail.geometry.setFromPoints(this.trailPoints);
    }
    
    /**
     * Handle collision with obstacles and tanks
     */
    checkCollisions(obstacles, tanks) {
        if (!this.active) return null;
        
        // Collision buffer
        const collisionBuffer = 0.15; 
        
        // Create a collision box for the projectile
        const projectileBox = {
            position: this.position,
            size: {
                x: this.size + collisionBuffer,
                z: this.size + collisionBuffer
            }
        };
        
        // Check against obstacles first
        for (const obstacle of obstacles) {
            if (!obstacle || !obstacle.position || !obstacle.userData) {
                continue;
            }
            
            // Create obstacle collision box with userData.size if available
            const obstacleSize = obstacle.userData.size || { x: 1, z: 1 };
            const obstacleBox = {
                position: obstacle.position,
                size: {
                    x: obstacleSize.x + collisionBuffer,
                    z: obstacleSize.z + collisionBuffer
                }
            };
            
            if (this.boxCollision(projectileBox, obstacleBox)) {
                // Handle bounce or destroy projectile
                if (this.bounceCount < this.maxBounces) {
                    this.bounce(obstacle);
                    return { type: 'obstacle', object: obstacle };
                } else {
                    this.destroy();
                    return { type: 'obstacle', object: obstacle };
                }
            }
        }
        
        // Check against tanks next
        for (const tank of tanks) {
            if (!tank || !tank.active || tank === this.owner) {
                continue;
            }
            
            if (!tank.position || !tank.size) {
                continue;
            }
            
            const tankBox = {
                position: tank.position,
                size: {
                    x: tank.size.x + collisionBuffer,
                    z: tank.size.z + collisionBuffer
                }
            };
            
            if (this.boxCollision(projectileBox, tankBox)) {
                // Hit the tank and destroy projectile
                this.destroy();
                return { type: 'tank', object: tank };
            }
        }
        
        return null;
    }
    
    /**
     * Simple box collision detection
     */
    boxCollision(box1, box2) {
        return (
            Math.abs(box1.position.x - box2.position.x) < (box1.size.x / 2 + box2.size.x / 2) &&
            Math.abs(box1.position.z - box2.position.z) < (box1.size.z / 2 + box2.size.z / 2)
        );
    }
    
    /**
     * Bounce projectile off an obstacle
     */
    bounce(obstacle) {
        if (!this.active) return;
        
        this.bounceCount++;
        
        // Calculate bounce direction
        const obstaclePos = obstacle.position;
        const projectilePos = this.position;
        
        // Determine which side of the obstacle was hit
        const dx = projectilePos.x - obstaclePos.x;
        const dz = projectilePos.z - obstaclePos.z;
        const absDx = Math.abs(dx);
        const absDz = Math.abs(dz);
        
        // Get obstacle dimensions
        const obstacleWidth = obstacle.userData && obstacle.userData.size ? 
                             obstacle.userData.size.x : 1;
        const obstacleDepth = obstacle.userData && obstacle.userData.size ? 
                             obstacle.userData.size.z : 1;
        
        // Move position slightly away from the obstacle to prevent getting stuck
        const pushDistance = 0.2;
        
        // Bounce horizontally or vertically based on collision side
        if (absDx / obstacleWidth > absDz / obstacleDepth) {
            // Horizontal collision (left/right)
            this.direction.x *= -1;
            
            // Push away from obstacle
            if (dx > 0) {
                this.position.x += pushDistance;
            } else {
                this.position.x -= pushDistance;
            }
        } else {
            // Vertical collision (top/bottom)
            this.direction.z *= -1;
            
            // Push away from obstacle
            if (dz > 0) {
                this.position.z += pushDistance;
            } else {
                this.position.z -= pushDistance;
            }
        }
        
        // Add slight randomness to bounce
        this.direction.x += (Math.random() - 0.5) * 0.03;
        this.direction.z += (Math.random() - 0.5) * 0.03;
        this.direction.normalize();
        
        // Update mesh position
        this.mesh.position.copy(this.position);
    }
    
    /**
     * Destroy the projectile
     */
    destroy() {
        if (!this.active) return;
        
        this.active = false;
    }
    
    /**
     * Remove the projectile from the scene
     */
    remove() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        
        if (this.trail) {
            this.scene.remove(this.trail);
            this.trail.geometry.dispose();
            this.trail.material.dispose();
        }
    }
} 
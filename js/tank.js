import * as THREE from 'three';
import { Utils } from './utils.js';

/**
 * Tank Class - Base class for player and enemy tanks
 */
export class Tank {
    constructor(scene, x, z, color = 0x44aa44) {
        this.scene = scene;
        this.position = new THREE.Vector3(x, 0.3, z);
        this.initialPosition = this.position.clone();
        this.direction = new THREE.Vector3(1, 0, 0);
        this.turretDirection = new THREE.Vector3(1, 0, 0);
        this.turretTarget = null; // Store the actual target position
        this.speed = 0.008;
        this.turnSpeed = 0.01;
        this.size = { x: 1.0, z: 1.0 };
        this.health = 1;
        this.lastShootTime = 0;
        this.shootCooldown = 750; // ms
        this.mineCooldown = 2000; // ms
        this.lastMineTime = 0;
        this.color = color;
        this.active = true;
        
        // Create tank mesh group
        this.mesh = new THREE.Group();
        
        // Tank body
        const bodyGeometry = new THREE.BoxGeometry(0.8, 0.4, 0.6);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.5,
            metalness: 0.3
        });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.castShadow = true;
        this.body.receiveShadow = true;
        this.mesh.add(this.body);
        
        // Create a distinct front part (to clearly show direction)
        const frontGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.4);
        const frontMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.5,
            metalness: 0.3
        });
        this.frontPart = new THREE.Mesh(frontGeometry, frontMaterial);
        this.frontPart.position.set(0.4, 0.0, 0); // Position at front of tank
        this.body.add(this.frontPart);
        
        // Tank turret
        const turretGeometry = new THREE.BoxGeometry(0.4, 0.2, 0.4);
        const turretMaterial = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.5,
            metalness: 0.3
        });
        this.turret = new THREE.Mesh(turretGeometry, turretMaterial);
        this.turret.position.y = 0.3;
        this.turret.castShadow = true;
        this.mesh.add(this.turret);
        
        // Tank barrel
        const barrelGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8);
        const barrelMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.8,
            metalness: 0.5
        });
        this.barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        
        // Rotate cylinder to align with X-axis
        this.barrel.rotation.z = -Math.PI / 2;
        
        // Fixed: Position barrel on the FRONT side of the turret
        this.barrel.position.set(0.45, 0, 0);
        
        this.barrel.castShadow = true;
        this.turret.add(this.barrel); // Add barrel to turret so it rotates with it
        
        // Set initial position
        this.mesh.position.copy(this.position);
        
        // Add to scene
        scene.add(this.mesh);
    }
    
    /**
     * Update tank position and rotation
     */
    update(deltaTime) {
        if (!this.active) return;
        
        // Update tank mesh position
        this.mesh.position.copy(this.position);
        
        // Set body rotation based on tank's movement direction
        const bodyAngle = Math.atan2(this.direction.z, this.direction.x);
        this.mesh.rotation.y = bodyAngle;
        
        // TURRET ROTATION: Completely independent of tank body
        if (this.turretTarget) {
            // Compute vector from tank (world position) to the mouse position
            const dx = this.turretTarget.x - this.position.x;
            const dz = this.turretTarget.z - this.position.z;
            
            // Flip the Z component so that vertical movement isn't inverted
            const desiredWorldAngle = Math.atan2(-dz, dx);
            
            // Since the turret is a child of the tank body, subtract the tank's rotation
            // so that the turret faces the desired world direction independently.
            this.turret.rotation.y = desiredWorldAngle - this.mesh.rotation.y;
        }
        
        // Keep barrel horizontal
        this.barrel.rotation.z = -Math.PI / 2;
    }
    
    /**
     * Move tank forward in the direction it's facing
     */
    moveForward(distance = 1) {
        if (!this.active) return;
        
        // Calculate movement using the direction the tank is facing
        const moveAmount = this.speed * distance;
        
        // Get the forward vector based on mesh rotation
        const forward = new THREE.Vector3(1, 0, 0);
        forward.applyQuaternion(this.mesh.quaternion);
        
        // Create movement vector
        const movementVector = forward.multiplyScalar(moveAmount);
        
        // Apply the movement
        const newPosition = new THREE.Vector3().copy(this.position).add(movementVector);
        
        // Position update will be validated by the game's collision detection
        this.position.copy(newPosition);
    }
    
    /**
     * Move tank backward (opposite of the direction it's facing)
     */
    moveBackward(distance = 1) {
        if (!this.active) return;
        
        // Calculate movement in the opposite direction of where the tank is facing
        const moveAmount = this.speed * distance;
        
        // Get the backward vector based on mesh rotation
        const backward = new THREE.Vector3(-1, 0, 0);
        backward.applyQuaternion(this.mesh.quaternion);
        
        // Create movement vector
        const movementVector = backward.multiplyScalar(moveAmount);
        
        // Apply the movement
        const newPosition = new THREE.Vector3().copy(this.position).add(movementVector);
        
        // Position update will be validated by the game's collision detection
        this.position.copy(newPosition);
    }
    
    /**
     * Rotate tank body to the left (counterclockwise)
     */
    turnLeft(factor = 1) {
        if (!this.active) return;
        
        // Calculate rotation angle
        const angle = this.turnSpeed * factor;
        
        // Rotate the mesh directly
        this.mesh.rotation.y += angle;
        
        // Update direction vector to match the new rotation
        this.direction.set(
            Math.cos(this.mesh.rotation.y),
            0,
            Math.sin(this.mesh.rotation.y)
        ).normalize();
    }
    
    /**
     * Rotate tank body to the right (clockwise)
     */
    turnRight(factor = 1) {
        if (!this.active) return;
        
        // Calculate rotation angle
        const angle = this.turnSpeed * factor;
        
        // Rotate the mesh directly
        this.mesh.rotation.y -= angle;
        
        // Update direction vector to match the new rotation
        this.direction.set(
            Math.cos(this.mesh.rotation.y),
            0,
            Math.sin(this.mesh.rotation.y)
        ).normalize();
    }
    
    /**
     * Aim turret at a specific point in world space
     */
    aimAt(x, z) {
        if (!this.active) return;
        
        // Simply store the mouse position in world coordinates
        this.turretTarget = new THREE.Vector3(x, 0, z);
    }
    
    /**
     * Fire a projectile from the tank
     * @returns {Projectile} The created projectile or null if on cooldown
     */
    shoot() {
        if (!this.active) return null;
        
        const now = Date.now();
        if (now - this.lastShootTime < this.shootCooldown) {
            return null; // Still on cooldown
        }
        
        this.lastShootTime = now;
        
        // Force update the matrices to ensure accurate positioning
        this.mesh.updateMatrixWorld(true);
        this.turret.updateMatrixWorld(true);
        this.barrel.updateMatrixWorld(true);
        
        // Since the barrel is aligned along the X axis locally and rotated to
        // point horizontally, we need a different approach to get the correct direction.
        
        // First, get the barrel's world position
        const barrelPosition = new THREE.Vector3();
        this.barrel.getWorldPosition(barrelPosition);
        
        // Get the turret's aim direction - this is more reliable than trying to extract from the barrel
        // since we know the turret is aiming directly at the mouse position
        const turretDirection = new THREE.Vector3();
        
        if (this.turretTarget) {
            // Direct vector from tank to target
            turretDirection.x = this.turretTarget.x - this.position.x;
            turretDirection.z = this.turretTarget.z - this.position.z;
            turretDirection.normalize();
        } else {
            // Fallback - use tank's forward direction
            turretDirection.copy(this.direction);
        }
        
        console.log("Turret direction:", 
            turretDirection.x.toFixed(2), 
            turretDirection.y.toFixed(2), 
            turretDirection.z.toFixed(2)
        );
        
        // Calculate barrel tip position based on turret direction
        const barrelLength = 0.5;
        const barrelTip = barrelPosition.clone().add(
            turretDirection.clone().multiplyScalar(barrelLength/2)
        );
        
        console.log("Barrel position:", 
            barrelPosition.x.toFixed(2), 
            barrelPosition.y.toFixed(2), 
            barrelPosition.z.toFixed(2)
        );
        
        console.log("Barrel tip position:", 
            barrelTip.x.toFixed(2), 
            barrelTip.y.toFixed(2), 
            barrelTip.z.toFixed(2)
        );
        
        // Spawn position slightly in front of barrel tip
        const projectilePosition = barrelTip.clone().add(
            turretDirection.clone().multiplyScalar(0.2)
        );
        
        console.log("Projectile spawn position:", 
            projectilePosition.x.toFixed(2), 
            projectilePosition.y.toFixed(2), 
            projectilePosition.z.toFixed(2),
            "with direction:",
            turretDirection.x.toFixed(2),
            turretDirection.y.toFixed(2),
            turretDirection.z.toFixed(2)
        );
        
        // Create muzzle flash at barrel tip
        this.createMuzzleFlash(barrelTip);
        
        // Return projectile data to be created by the game
        return {
            position: projectilePosition,
            direction: turretDirection.clone(),
            speed: 0.05,
            owner: this
        };
    }
    
    /**
     * Create a muzzle flash effect at the barrel tip
     * @param {THREE.Vector3} position - World position for the muzzle flash
     */
    createMuzzleFlash(position) {
        // Create a bright flash of light at the barrel tip
        const flashGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const flashMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.8
        });
        
        const flash = new THREE.Mesh(flashGeometry, flashMaterial);
        flash.position.copy(position);
        this.scene.add(flash);
        
        // Create a small particle burst
        const particleCount = 10;
        const particleGroup = new THREE.Group();
        
        for (let i = 0; i < particleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.05, 4, 4);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: 0xff6600,
                transparent: true,
                opacity: 0.7
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            // Random initial position near the barrel tip
            const angle = Math.random() * Math.PI * 2;
            const radius = 0.05 + Math.random() * 0.1;
            particle.position.set(
                position.x + Math.cos(angle) * radius,
                position.y + Math.random() * 0.1,
                position.z + Math.sin(angle) * radius
            );
            
            // Store velocity for animation
            particle.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.03,
                Math.random() * 0.02,
                (Math.random() - 0.5) * 0.03
            );
            
            particleGroup.add(particle);
        }
        
        this.scene.add(particleGroup);
        
        // Animate and remove the effect after a short delay
        const startTime = Date.now();
        const duration = 300; // ms
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Fade out the flash
            flashMaterial.opacity = 0.8 * (1 - progress);
            
            // Animate particles
            particleGroup.children.forEach(particle => {
                particle.position.add(particle.userData.velocity);
                particle.userData.velocity.y -= 0.001; // Gravity
                particle.material.opacity = 0.7 * (1 - progress);
            });
            
            // Continue animation until done
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Remove effect objects
                this.scene.remove(flash);
                flashMaterial.dispose();
                flashGeometry.dispose();
                
                particleGroup.children.forEach(particle => {
                    particle.material.dispose();
                    particle.geometry.dispose();
                });
                
                this.scene.remove(particleGroup);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    /**
     * Drop a mine at the tank's position
     * @returns {Object} Mine data or null if on cooldown
     */
    dropMine() {
        if (!this.active) return null;
        
        const now = Date.now();
        if (now - this.lastMineTime < this.mineCooldown) {
            return null; // Still on cooldown
        }
        
        this.lastMineTime = now;
        
        // Create the mine (will be handled by the game class)
        return {
            position: new THREE.Vector3(this.position.x, 0.05, this.position.z),
            owner: this
        };
    }
    
    /**
     * Check for collisions with obstacles
     * @param {Array} obstacles - Array of obstacles to check against
     * @returns {boolean} True if a collision was detected
     */
    checkCollisions(obstacles) {
        if (!obstacles || !Array.isArray(obstacles)) {
            return false;
        }
        
        // Create a bounding box for the tank
        const tankBox = {
            position: this.position,
            size: this.size
        };
        
        // Check against each obstacle
        for (const obstacle of obstacles) {
            // Skip invalid obstacles
            if (!obstacle || !obstacle.position || !obstacle.size) {
                continue;
            }
            
            if (Utils.boxCollision(tankBox, obstacle)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Handle damage to the tank
     * @param {number} amount - Amount of damage to take
     * @returns {boolean} True if tank was destroyed
     */
    takeDamage(amount = 1) {
        if (!this.active) return false;
        
        this.health -= amount;
        
        if (this.health <= 0) {
            this.destroy();
            return true;
        }
        
        // Visual feedback - flash red
        const originalColor = this.body.material.color.getHex();
        this.body.material.color.set(0xff0000);
        this.turret.material.color.set(0xff0000);
        
        setTimeout(() => {
            if (this.active) {
                this.body.material.color.set(originalColor);
                this.turret.material.color.set(originalColor);
            }
        }, 100);
        
        return false;
    }
    
    /**
     * Destroy the tank
     */
    destroy() {
        if (!this.active) return;
        
        this.active = false;
        
        // Explosion effect
        Utils.createExplosion(this.scene, this.position, 1.5, 1000);
        
        // Hide the tank
        this.mesh.visible = false;
    }
    
    /**
     * Reset tank to initial state
     */
    reset() {
        this.active = true;
        this.mesh.visible = true;
        this.position.copy(this.initialPosition);
        this.direction.set(1, 0, 0);
        this.mesh.position.copy(this.position);
        this.mesh.rotation.y = 0;
        this.turret.rotation.y = 0;
    }

    /**
     * Remove tank from scene
     */
    remove() {
        this.scene.remove(this.mesh);
        // Clean up geometries and materials
        this.body.geometry.dispose();
        this.body.material.dispose();
        this.turret.geometry.dispose();
        this.turret.material.dispose();
        this.barrel.geometry.dispose();
        this.barrel.material.dispose();
    }
}

/**
 * PlayerTank Class - Represents the player's tank
 * Extends the base Tank class with player-specific functionality
 */
export class PlayerTank extends Tank {
    constructor(scene, x, z) {
        super(scene, x, z, 0x4444dd); // Blue color for player
        this.health = 2; // Player has more health
        this.shootCooldown = 500; // ms - faster shooting for player
        this.inputEnabled = true;
        this.initialPosition = new THREE.Vector3(x, 0.3, z);
        
        // Override size for player tank
        this.size = { x: 0.8, z: 0.8 };
    }
    
    /**
     * Process player input
     */
    processInput(keys, mousePos) {
        if (!this.active || !this.inputEnabled) return;
        
        // Get key states
        const wPressed = keys['w'] || keys['ArrowUp'];
        const sPressed = keys['s'] || keys['ArrowDown'];
        const aPressed = keys['a'] || keys['ArrowLeft'];
        const dPressed = keys['d'] || keys['ArrowRight'];
        
        // TANK MOVEMENT RULES:
        // 1. W/Up Arrow: Move forward in the direction the tank is facing
        // 2. S/Down Arrow: Move backward (opposite of facing direction)
        // 3. A/Left Arrow: Rotate tank counter-clockwise
        // 4. D/Right Arrow: Rotate tank clockwise
        // 5. Movement and rotation are mutually exclusive
        
        // Handle forward/backward movement first (takes priority)
        if (wPressed) {
            // Move forward in the direction the tank is facing
            this.moveForward();
        } 
        else if (sPressed) {
            // Move backward (opposite of facing direction)
            this.moveBackward();
        }
        // Only allow turning if not moving forward/backward
        else if (aPressed) {
            // Rotate tank counter-clockwise
            this.turnLeft();
        }
        else if (dPressed) {
            // Rotate tank clockwise
            this.turnRight();
        }
        
        // Aim turret at mouse position regardless of movement
        if (mousePos) {
            this.aimAt(mousePos.x, mousePos.z);
        }
    }
    
    /**
     * Reset the player tank to initial state
     */
    reset() {
        this.active = true;
        this.health = 2;
        this.mesh.visible = true;
        this.position.copy(this.initialPosition);
        this.direction.set(1, 0, 0);
        this.mesh.position.copy(this.position);
        this.mesh.rotation.y = 0;
        this.turret.rotation.y = 0;
    }
}

/**
 * EnemyTank Class - Base class for AI-controlled enemy tanks
 */
export class EnemyTank extends Tank {
    constructor(scene, x, z, type = "basic", speedMultiplier = 1) {
        let color, health, speed, shootCooldown;
        
        switch (type) {
            case "basic":
                color = 0xaa4444; // Red
                health = 1;
                speed = 0.006; // Further reduced from 0.01
                shootCooldown = 1200;
                break;
            case "faster":
                color = 0xaaaaaa; // Gray
                health = 1;
                speed = 0.009; // Further reduced from 0.015
                shootCooldown = 1000;
                break;
            case "minelayer":
                color = 0x44aa44; // Green
                health = 1;
                speed = 0.005; // Further reduced from 0.008
                shootCooldown = 1500;
                break;
            case "sniper":
                color = 0xaa44aa; // Purple
                health = 1;
                speed = 0.004; // Further reduced from 0.007
                shootCooldown = 2000;
                break;
            case "boss":
                color = 0xffaa00; // Orange
                health = 3;
                speed = 0.007; // Further reduced from 0.012
                shootCooldown = 800;
                break;
            default:
                color = 0xaa4444;
                health = 1;
                speed = 0.006; // Further reduced from 0.01
                shootCooldown = 1200;
        }
        
        super(scene, x, z, color);
        
        this.type = type;
        this.health = health;
        this.speed *= speedMultiplier;
        this.shootCooldown = shootCooldown;
        this.mineCooldown = 3000;
        this.state = "patrol"; // patrol, chase, attack
        this.targetPosition = null;
        this.targetPlayer = null;
        this.patrolTimer = 0;
        this.thinkTimer = 0;
        this.lastRaycast = 0;
        this.raycastInterval = 250;
        this.visibilityRange = 12;
        this.fleeThreshold = 3;
        this.attackRange = 8;
        
        // AIs don't automatically track turret with body
        this.turretDirection = this.direction.clone();
    }
    
    /**
     * Update enemy tank AI behavior
     */
    update(deltaTime, player, obstacles) {
        if (!this.active) return null;
        
        // Call base class update
        super.update(deltaTime);
        
        // Store player reference
        if (player && player.active) {
            this.targetPlayer = player;
        }
        
        // Update AI state timers
        this.patrolTimer += deltaTime;
        this.thinkTimer += deltaTime;
        
        // Check if player is visible
        if (obstacles && Array.isArray(obstacles)) {
            this.checkPlayerVisibility(obstacles);
        }
        
        // AI behavior based on state
        switch (this.state) {
            case "patrol":
                return this.patrolBehavior(deltaTime);
            case "chase":
                return this.chaseBehavior(deltaTime);
            case "attack":
                return this.attackBehavior(deltaTime);
            case "flee":
                return this.fleeBehavior(deltaTime);
            default:
                return null;
        }
    }
    
    /**
     * Check if player is visible via raycasting
     */
    checkPlayerVisibility(obstacles) {
        if (!this.targetPlayer || !this.targetPlayer.active || 
            !this.targetPlayer.position) {
            return false;
        }
        
        const now = Date.now();
        if (now - this.lastRaycast < this.raycastInterval) return false;
        this.lastRaycast = now;
        
        // Distance to player
        const distanceToPlayer = Utils.distance(
            this.position.x, this.position.z,
            this.targetPlayer.position.x, this.targetPlayer.position.z
        );
        
        // If player is out of range, don't bother checking
        if (distanceToPlayer > this.visibilityRange) {
            if (this.state === "chase" || this.state === "attack") {
                this.state = "patrol";
            }
            return false;
        }
        
        // Direction to player
        const toPlayerX = this.targetPlayer.position.x - this.position.x;
        const toPlayerZ = this.targetPlayer.position.z - this.position.z;
        const toPlayerDist = Math.sqrt(toPlayerX * toPlayerX + toPlayerZ * toPlayerZ);
        
        if (toPlayerDist < 0.1) return false;
        
        const toPlayerNormX = toPlayerX / toPlayerDist;
        const toPlayerNormZ = toPlayerZ / toPlayerDist;
        
        // Check for obstacles between tank and player
        let hit = false;
        let currentDist = 0;
        const step = 0.5;
        
        while (currentDist < toPlayerDist && !hit) {
            const rayX = this.position.x + toPlayerNormX * currentDist;
            const rayZ = this.position.z + toPlayerNormZ * currentDist;
            
            // Check against obstacles
            for (const obstacle of obstacles) {
                if (obstacle && obstacle.userData && 
                    (obstacle.userData.isWall || obstacle.userData.isBlock) &&
                    obstacle.position) {
                    const dx = rayX - obstacle.position.x;
                    const dz = rayZ - obstacle.position.z;
                    
                    // Simple circle-box collision
                    if (obstacle.userData.size && 
                        Math.abs(dx) < obstacle.userData.size.x / 2 + 0.2 &&
                        Math.abs(dz) < obstacle.userData.size.z / 2 + 0.2) {
                        hit = true;
                        break;
                    }
                }
            }
            
            currentDist += step;
        }
        
        // If no obstacles are in the way, player is visible
        if (!hit) {
            // Transition to chase or attack
            if (distanceToPlayer <= this.attackRange) {
                this.state = "attack";
            } else {
                this.state = "chase";
            }
            return true;
        } else if (this.state === "chase" || this.state === "attack") {
            // Lost sight of player, go back to patrol
            this.state = "patrol";
        }
        
        return false;
    }
    
    /**
     * Patrol behavior - wander randomly
     */
    patrolBehavior(deltaTime) {
        // Generate new random target periodically
        if (this.patrolTimer > 3000 || !this.targetPosition) {
            this.patrolTimer = 0;
            
            // Create a safer patrol area that's not too close to the boundaries
            // Using a smaller boundary to keep tanks well away from edges
            const safeMargin = 5; // Keep 5 units away from the boundary
            const maxBoundary = 20; // Game boundary is around 25 units
            
            // Create target within a safer region
            let targetX, targetZ;
            
            // Either choose a point near the current position or a completely new position
            if (Math.random() < 0.7) {
                // Near current position, but still within safe bounds
                const maxDistance = 10; 
                const angle = Math.random() * Math.PI * 2;
                const distance = 2 + Math.random() * maxDistance;
                
                // Calculate target position
                targetX = this.position.x + Math.cos(angle) * distance;
                targetZ = this.position.z + Math.sin(angle) * distance;
            } else {
                // Completely new position within the safe play area
                targetX = -maxBoundary + safeMargin + Math.random() * (maxBoundary * 2 - safeMargin * 2);
                targetZ = -maxBoundary + safeMargin + Math.random() * (maxBoundary * 2 - safeMargin * 2);
            }
            
            // Clamp to ensure it stays within the safe area
            targetX = Math.max(-maxBoundary + safeMargin, Math.min(maxBoundary - safeMargin, targetX));
            targetZ = Math.max(-maxBoundary + safeMargin, Math.min(maxBoundary - safeMargin, targetZ));
            
            this.targetPosition = {
                x: targetX,
                z: targetZ
            };
        }
        
        // Move towards target
        this.moveTowardsTarget(this.targetPosition, deltaTime);
        
        // Occasionally shoot while patrolling (only some types)
        if (this.type === "sniper" || this.type === "boss") {
            if (Math.random() < 0.005 * deltaTime) {
                return this.shoot();
            }
        }
        
        // Drop mines while patrolling (only minelayers)
        if (this.type === "minelayer" || this.type === "boss") {
            if (Math.random() < 0.002 * deltaTime) {
                return this.dropMine();
            }
        }
        
        return null;
    }
    
    /**
     * Chase behavior - follow player
     */
    chaseBehavior(deltaTime) {
        if (!this.targetPlayer || !this.targetPlayer.active) {
            this.state = "patrol";
            return null;
        }
        
        // Calculate distance to player
        const distanceToPlayer = Utils.distance(
            this.position.x, this.position.z,
            this.targetPlayer.position.x, this.targetPlayer.position.z
        );
        
        // If too close to player, try to maintain distance (some types)
        if (this.type === "sniper" && distanceToPlayer < this.fleeThreshold) {
            this.state = "flee";
            return null;
        }
        
        // If in attack range, switch to attack
        if (distanceToPlayer <= this.attackRange) {
            this.state = "attack";
            return null;
        }
        
        // Always aim at player while chasing
        this.aimAt(this.targetPlayer.position.x, this.targetPlayer.position.z);
        
        // Move towards player
        this.moveTowardsTarget(this.targetPlayer.position, deltaTime);
        
        // Shoot while chasing - increased chance significantly
        if (Math.random() < 0.05 * deltaTime) {
            return this.shoot();
        }
        
        return null;
    }
    
    /**
     * Attack behavior - focus on shooting player
     */
    attackBehavior(deltaTime) {
        if (!this.targetPlayer || !this.targetPlayer.active) {
            this.state = "patrol";
            return null;
        }
        
        // Calculate distance to player
        const distanceToPlayer = Utils.distance(
            this.position.x, this.position.z,
            this.targetPlayer.position.x, this.targetPlayer.position.z
        );
        
        // If too far from player, switch to chase
        if (distanceToPlayer > this.attackRange * 1.2) {
            this.state = "chase";
            return null;
        }
        
        // If too close to player, try to maintain distance (some types)
        if ((this.type === "sniper" || this.type === "minelayer") && 
            distanceToPlayer < this.fleeThreshold) {
            this.state = "flee";
            return null;
        }
        
        // Always aim at player
        this.aimAt(this.targetPlayer.position.x, this.targetPlayer.position.z);
        
        // For most types, try to maintain optimal attack distance
        const optimalDistance = this.type === "sniper" ? 6 : 4;
        
        // Try to keep optimal distance without excessive movement
        if (Math.abs(distanceToPlayer - optimalDistance) > 2) {
            // Only move if we're significantly off the optimal distance
            if (distanceToPlayer < optimalDistance - 2) {
                // Too close, back up
                this.moveBackward(0.5);
            } else if (distanceToPlayer > optimalDistance + 2) {
                // Too far, move closer
                this.moveTowardsTarget(this.targetPlayer.position, deltaTime, 0.5);
            }
        } else {
            // At good distance, occasionally strafe
            if (Math.random() < 0.005 * deltaTime) {
                // Change strafe direction
                this.strafeDirection = Math.random() < 0.5 ? -1 : 1;
            }
            
            if (this.strafeDirection) {
                const strafeAngle = Math.atan2(
                    this.targetPlayer.position.z - this.position.z,
                    this.targetPlayer.position.x - this.position.x
                ) + Math.PI / 2 * this.strafeDirection;
                
                // Move perpendicular to player with reduced speed for more controlled strafing
                this.position.x += Math.cos(strafeAngle) * this.speed * 0.3;
                this.position.z += Math.sin(strafeAngle) * this.speed * 0.3;
            }
        }
        
        // Frequently try to shoot - much higher chance to ensure regular shooting
        const shootChance = this.type === "sniper" ? 0.15 : 
                           this.type === "boss" ? 0.2 : 0.1;
        
        if (Math.random() < shootChance * deltaTime) {
            return this.shoot();
        }
        
        // Drop mines in attack mode (only minelayers and boss)
        if ((this.type === "minelayer" || this.type === "boss") && 
            Math.random() < 0.01 * deltaTime) {
            return this.dropMine();
        }
        
        return null;
    }
    
    /**
     * Flee behavior - try to maintain distance from player
     */
    fleeBehavior(deltaTime) {
        if (!this.targetPlayer || !this.targetPlayer.active) {
            this.state = "patrol";
            return null;
        }
        
        // Calculate angle away from player
        const angleFromPlayer = Math.atan2(
            this.position.z - this.targetPlayer.position.z,
            this.position.x - this.targetPlayer.position.x
        );
        
        // Set direction opposite of player
        this.direction.set(
            Math.cos(angleFromPlayer),
            0,
            Math.sin(angleFromPlayer)
        ).normalize();
        
        // Move away from player
        this.moveForward();
        
        // Still aim at player while fleeing
        this.aimAt(this.targetPlayer.position.x, this.targetPlayer.position.z);
        
        // Calculate distance to player
        const distanceToPlayer = Utils.distance(
            this.position.x, this.position.z,
            this.targetPlayer.position.x, this.targetPlayer.position.z
        );
        
        // If we've fled far enough, go back to attack mode
        if (distanceToPlayer > this.fleeThreshold * 2) {
            this.state = "attack";
        }
        
        // Occasionally try to shoot while fleeing
        if (Math.random() < 0.02 * deltaTime) {
            return this.shoot();
        }
        
        // Drop mines while fleeing (only minelayers)
        if (this.type === "minelayer" && Math.random() < 0.01 * deltaTime) {
            return this.dropMine();
        }
        
        return null;
    }
    
    /**
     * Helper method to move towards a target position (EnemyTank version)
     */
    moveTowardsTarget(target, deltaTime, speedFactor = 1) {
        if (!target) return;
        
        // Calculate angle to target
        const targetAngle = Math.atan2(
            target.z - this.position.z,
            target.x - this.position.x
        );
        // Current facing angle of the tank
        const currentAngle = this.mesh.rotation.y;
        
        // Calculate angle difference
        let angleDiff = targetAngle - currentAngle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        // Use a tighter angle threshold
        const angleTolerance = Math.PI / 16; // ~11 degrees
        
        if (Math.abs(angleDiff) > angleTolerance) {
            // Calculate maximum turn allowed this frame (60fps baseline)
            const maxTurn = this.turnSpeed * (deltaTime / 16.67);
            const turnAmount = Math.min(Math.abs(angleDiff), maxTurn);
            
            if (angleDiff > 0) {
                this.turnLeft(turnAmount / this.turnSpeed);
            } else {
                this.turnRight(turnAmount / this.turnSpeed);
            }
        } else {
            // If aligned, move forward
            this.moveForward(speedFactor);
        }
    }
    
    /**
     * Reset enemy tank state
     */
    reset(x, z) {
        this.position.set(x, 0.3, z);
        this.health = this.type === "boss" ? 3 : 1;
        this.active = true;
        this.mesh.visible = true;
        this.state = "patrol";
        this.targetPosition = null;
        this.patrolTimer = 0;
        this.thinkTimer = 0;
    }
} 
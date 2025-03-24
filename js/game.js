import * as THREE from 'three';
import { AudioManager } from './audio.js';
import { LevelManager } from './levels.js';
import { Leaderboard } from './leaderboard.js';
import { PlayerTank, EnemyTank } from './tank.js';
import { Projectile } from './projectile.js';
import { Mine } from './mine.js';
import { Utils } from './utils.js';

/**
 * Game Class - Main game controller handling levels, entities, and game state
 */
export class Game {
    constructor() {
        // Game version
        this.version = "v1.2.2";
        
        // Initialize class properties
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.mines = [];
        this.obstacles = [];
        this.level = null;
        this.levelManager = null;
        this.leaderboard = null;
        this.audioManager = new AudioManager();
        this.isRunning = false;
        this.isPaused = false;
        this.lives = 3;
        this.score = 0;
        this.keys = {};
        this.mousePosition = new THREE.Vector3();
        this.raycaster = new THREE.Raycaster();
        this.lastFrameTime = 0;
        this.accumTime = 0;
        this.levelCompletionTimeout = null;
        this.boundarySize = 25;
        
        // Initialize DOM elements after a short delay to ensure they exist
        setTimeout(() => {
            this.initializeDOMElements();
            this.setupEventListeners();
        }, 100);
    }
    
    initializeDOMElements() {
        // DOM elements
        this.container = document.getElementById('game-canvas');
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.livesElement = document.getElementById('lives');
        this.userPrompt = document.getElementById('user-prompt');
        this.gameOver = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
        this.leaderboardListElement = document.getElementById('leaderboard-list');
        this.playAgainButton = document.getElementById('play-again');
        this.mainMenuButton = document.getElementById('main-menu');
        
        // Setup three.js scene
        this.setupScene();
        
        // Initialize managers
        this.levelManager = new LevelManager(this);
        this.leaderboard = new Leaderboard();
        
        // Set up HUD
        this.setupHUD();
    }
    
    /**
     * Set up the THREE.js scene, camera, renderer, and lighting
     */
    setupScene() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xccbb99);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            45, window.innerWidth / window.innerHeight, 0.1, 1000
        );
        
        // Position camera for top-down view with slight angle
        this.camera.position.set(0, 20, 15);
        this.camera.lookAt(0, 0, 0);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Add renderer to DOM
        this.container.appendChild(this.renderer.domElement);
        
        // Create lighting
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xcccccc, 0.5);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        
        // Configure shadow properties
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -25;
        directionalLight.shadow.camera.right = 25;
        directionalLight.shadow.camera.top = 25;
        directionalLight.shadow.camera.bottom = -25;
        
        this.scene.add(directionalLight);
        
        // Create ground plane
        const planeGeometry = new THREE.PlaneGeometry(this.boundarySize * 2, this.boundarySize * 2);
        const planeMaterial = new THREE.MeshStandardMaterial({
            color: 0xddcc99,
            roughness: 0.8,
            metalness: 0.2,
            side: THREE.DoubleSide
        });
        
        // Add wooden texture pattern to floor
        const textureSize = 64;
        const data = new Uint8Array(textureSize * textureSize * 3);
        
        for (let i = 0; i < textureSize; i++) {
            for (let j = 0; j < textureSize; j++) {
                const stride = (i * textureSize + j) * 3;
                
                // Create a wooden texture pattern with grain
                const distance = Math.sqrt(Math.pow(i - textureSize / 2, 2) + Math.pow(j - textureSize / 2, 2));
                const noiseValue = Math.sin(i * 0.1) * 10 + Math.random() * 5;
                
                data[stride] = 221 + noiseValue; // R
                data[stride + 1] = 204 + noiseValue; // G
                data[stride + 2] = 153 + noiseValue; // B
            }
        }
        
        const texture = new THREE.DataTexture(data, textureSize, textureSize, THREE.RGBFormat);
        texture.needsUpdate = true;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10, 10);
        
        planeMaterial.map = texture;
        
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = Math.PI / 2;
        plane.receiveShadow = true;
        this.scene.add(plane);
        
        // Create game boundary
        this.createBoundary();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    /**
     * Create invisible game boundary walls
     */
    createBoundary() {
        const halfSize = this.boundarySize;
        const wallHeight = 2;
        
        // Boundary object is just for physics, we don't render it
        const boundaryGeometry = new THREE.BoxGeometry(1, wallHeight, 1);
        const boundaryMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.2 // Make slightly visible for debugging
        });
        
        // Create four walls
        const walls = [
            // North wall
            { pos: [0, wallHeight / 2, -halfSize], scale: [halfSize * 2, wallHeight, 1] },
            // South wall
            { pos: [0, wallHeight / 2, halfSize], scale: [halfSize * 2, wallHeight, 1] },
            // East wall
            { pos: [halfSize, wallHeight / 2, 0], scale: [1, wallHeight, halfSize * 2] },
            // West wall
            { pos: [-halfSize, wallHeight / 2, 0], scale: [1, wallHeight, halfSize * 2] }
        ];
        
        walls.forEach(wall => {
            const mesh = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
            mesh.position.set(...wall.pos);
            mesh.scale.set(...wall.scale);
            
            // Add physics info
            mesh.userData.isWall = true;
            mesh.userData.isBoundary = true; // Mark as a boundary wall specifically
            mesh.userData.size = {
                x: boundaryGeometry.parameters.width * wall.scale[0],
                z: boundaryGeometry.parameters.depth * wall.scale[2]
            };
            
            this.scene.add(mesh);
            this.obstacles.push(mesh);
        });
    }
    
    /**
     * Check if position is within game boundaries
     */
    isWithinBoundaries(position) {
        const margin = 0.5; // Add a small margin to keep tanks from touching the walls
        return (
            position.x > -this.boundarySize + margin &&
            position.x < this.boundarySize - margin &&
            position.z > -this.boundarySize + margin &&
            position.z < this.boundarySize - margin
        );
    }
    
    /**
     * Set up event listeners for keyboard and mouse input
     */
    setupEventListeners() {
        // Keyboard input
        document.addEventListener('keydown', (event) => {
            this.keys[event.key] = true;
            
            // Space bar for dropping mines
            if (event.key === ' ' && this.isRunning && !this.isPaused) {
                this.dropMine();
            }
        });
        
        document.addEventListener('keyup', (event) => {
            this.keys[event.key] = false;
        });
        
        // Mouse input
        document.addEventListener('mousemove', (event) => {
            // Update crosshair position
            const crosshair = document.getElementById('crosshair');
            if (crosshair) {
                crosshair.style.left = event.clientX + 'px';
                crosshair.style.top = event.clientY + 'px';
            }
            
            // Convert mouse coordinates to normalized device coordinates (NDC)
            const mouse = new THREE.Vector2(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1
            );
            
            // Raycasting to get the point on the ground plane
            this.raycaster.setFromCamera(mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.scene.children, false);
            
            // Find the first intersection with the ground plane
            for (const intersect of intersects) {
                const object = intersect.object;
                if (object.geometry instanceof THREE.PlaneGeometry) {
                    this.mousePosition.copy(intersect.point);
                    break;
                }
            }
        });
        
        // Mouse click for shooting
        document.addEventListener('mousedown', (event) => {
            if (event.button === 0 && this.isRunning && !this.isPaused) {
                this.shootProjectile();
            }
        });
        
        // Start game button
        const startGameButton = document.getElementById('start-game');
        if (startGameButton) {
            startGameButton.addEventListener('click', () => {
                const usernameInput = document.getElementById('username-input');
                if (usernameInput) {
                    const username = usernameInput.value.trim();
                    this.startGame(username);
                }
            });
        }
        
        // Game over screen buttons
        if (this.playAgainButton) {
            this.playAgainButton.addEventListener('click', () => {
                this.restartGame();
            });
        }
        
        if (this.mainMenuButton) {
            this.mainMenuButton.addEventListener('click', () => {
                this.showMainMenu();
            });
        }
    }
    
    /**
     * Start the game with the given username
     */
    startGame(username) {
        // Validate username - if empty, don't start the game
        if (!username || username.trim() === '') {
            // Highlight the input field to indicate it's required
            const inputField = document.getElementById('username-input');
            inputField.classList.add('error');
            inputField.placeholder = 'Please enter your name!';
            
            // Add a shake effect to indicate error
            inputField.classList.add('shake');
            setTimeout(() => {
                inputField.classList.remove('shake');
            }, 500);
            
            return; // Exit the function without starting the game
        }
        
        // Username is valid, remove any error indicators
        const inputField = document.getElementById('username-input');
        if (inputField) {
            inputField.classList.remove('error');
        }
        
        // Hide user prompt
        this.userPrompt.classList.add('hidden');
        
        // Clear any pending level completion timeout
        if (this.levelCompletionTimeout) {
            clearTimeout(this.levelCompletionTimeout);
            this.levelCompletionTimeout = null;
        }
        
        // Set up leaderboard
        this.leaderboard.setUser(username);
        
        // Reset game state
        this.isRunning = true;
        this.isPaused = false;
        this.lives = 3;
        this.score = 0;
        this.levelManager.reset();
        
        // Update HUD
        this.updateHUD();
        
        // Load first level
        this.loadLevel(this.levelManager.getCurrentLevel());
        
        // Start game loop
        this.lastFrameTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
        
        // Start background music
        this.audioManager.playBackgroundMusic();
    }
    
    /**
     * Restart the game
     */
    restartGame() {
        // Hide game over screen
        this.gameOver.classList.add('hidden');
        
        // Clear any pending level completion timeout
        if (this.levelCompletionTimeout) {
            clearTimeout(this.levelCompletionTimeout);
            this.levelCompletionTimeout = null;
        }
        
        // Reset game state
        this.isRunning = true;
        this.isPaused = false;
        this.lives = 3;
        this.score = 0;
        this.leaderboard.resetScore();
        this.levelManager.reset();
        
        // Update HUD
        this.updateHUD();
        
        // Load first level
        this.loadLevel(this.levelManager.getCurrentLevel());
    }
    
    /**
     * Game over
     */
    gameOver() {
        this.isRunning = false;
        this.audioManager.stopBackgroundMusic();
        this.audioManager.playSound('gameOver');
        
        // Save score to leaderboard
        const position = this.leaderboard.saveScore();
        
        // Update game over screen
        this.finalScoreElement.textContent = `Final Score: ${this.score}`;
        
        // Render leaderboard
        this.leaderboard.renderLeaderboard(this.leaderboardListElement, position);
        
        // Show game over screen
        this.gameOver.classList.remove('hidden');
    }
    
    /**
     * Load a level
     */
    loadLevel(levelData) {
        // Clear previous level
        this.clearLevel();
        
        // Parse the level layout
        this.level = this.levelManager.parseLevel(
            levelData,
            this.scene,
            this.createEnemy.bind(this)
        );
        
        // Create player with validated spawn position
        if (this.level.playerStart) {
            // Use original position by default
            let validatedPosition = this.level.playerStart;
            
            // Validate the player spawn position against obstacles if the method exists
            if (this.levelManager && typeof this.levelManager.validateSpawnPosition === 'function') {
                validatedPosition = this.levelManager.validateSpawnPosition(
                    this.level.playerStart,
                    this.obstacles
                );
            }
            
            this.player = new PlayerTank(
                this.scene,
                validatedPosition.x,
                validatedPosition.z
            );
        }
        
        // Update level display
        this.levelElement.textContent = `Level: ${this.levelManager.getLevelNumber()}`;
    }
    
    /**
     * Clear all entities from the current level
     */
    clearLevel() {
        // Clear any pending level completion timeout
        if (this.levelCompletionTimeout) {
            clearTimeout(this.levelCompletionTimeout);
            this.levelCompletionTimeout = null;
        }
        
        // Remove player
        if (this.player) {
            this.player.remove();
            this.player = null;
        }
        
        // Remove enemies
        this.enemies.forEach(enemy => enemy.remove());
        this.enemies = [];
        
        // Remove projectiles
        this.projectiles.forEach(projectile => projectile.remove());
        this.projectiles = [];
        
        // Remove mines
        this.mines.forEach(mine => mine.remove());
        this.mines = [];
        
        // Remove obstacles (except boundary)
        const boundaryObstacles = this.obstacles.slice(0, 4); // Assuming first 4 are boundary walls
        
        for (let i = 4; i < this.obstacles.length; i++) {
            this.scene.remove(this.obstacles[i]);
            
            // Dispose geometries and materials
            if (this.obstacles[i].geometry) this.obstacles[i].geometry.dispose();
            if (this.obstacles[i].material) this.obstacles[i].material.dispose();
        }
        
        this.obstacles = boundaryObstacles;
    }
    
    /**
     * Create an enemy tank
     */
    createEnemy(type, x, z, speedMultiplier) {
        // Validate the enemy spawn position against obstacles if the method exists
        const spawnPosition = {x, z};
        let validatedPosition = spawnPosition;
        
        // Check if validateSpawnPosition method exists, otherwise use original position
        if (this.levelManager && typeof this.levelManager.validateSpawnPosition === 'function') {
            validatedPosition = this.levelManager.validateSpawnPosition(
                spawnPosition,
                this.obstacles
            );
        }
        
        const enemy = new EnemyTank(
            this.scene, 
            validatedPosition.x, 
            validatedPosition.z, 
            type, 
            speedMultiplier
        );
        
        this.enemies.push(enemy);
        return enemy;
    }
    
    /**
     * Player shoots a projectile
     */
    shootProjectile() {
        if (!this.player || !this.player.active) return;
        
        const projectileData = this.player.shoot();
        
        if (projectileData) {
            // Debug logging to verify projectile data
            console.log("Creating player projectile:", 
                "pos:", projectileData.position.x.toFixed(2), projectileData.position.z.toFixed(2),
                "dir:", projectileData.direction.x.toFixed(2), projectileData.direction.z.toFixed(2)
            );
            
            const projectile = new Projectile(
                this.scene,
                projectileData.position,
                projectileData.direction,
                projectileData.speed,
                this.player
            );
            
            this.projectiles.push(projectile);
            this.audioManager.playSound('shoot');
        } else {
            console.log("Failed to create projectile - check cooldown or active status");
        }
    }
    
    /**
     * Player drops a mine
     */
    dropMine() {
        if (!this.player || !this.player.active) return;
        
        const mineData = this.player.dropMine();
        
        if (mineData) {
            const mine = new Mine(
                this.scene,
                mineData.position,
                mineData.owner
            );
            
            this.mines.push(mine);
        }
    }
    
    /**
     * Main game loop
     */
    gameLoop(timestamp) {
        if (!this.isRunning) return;
        
        // Calculate delta time
        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        
        // Cap delta time to prevent physics issues after tab switch
        const clampedDelta = Math.min(deltaTime, 100);
        
        try {
            // Update game state
            this.update(clampedDelta);
            
            // Render the scene
            this.render();
        } catch (error) {
            console.error("Error in game loop:", error);
        }
        
        // Schedule next frame
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    /**
     * Check if a position collides with any obstacles
     */
    checkObstacleCollision(position, size, obstacles) {
        if (!obstacles || !Array.isArray(obstacles) || obstacles.length === 0) {
            return false;
        }
        
        // Add a larger collision buffer to help prevent objects from clipping through obstacles
        const collisionBuffer = 0.5; // Increased buffer to ensure tanks do not clip through obstacles (was 0.25)
        
        const entityBox = {
            position: position,
            size: {
                x: size.x + collisionBuffer,
                z: size.z + collisionBuffer
            }
        };
        
        for (const obstacle of obstacles) {
            if (!obstacle || !obstacle.position || !obstacle.userData || !obstacle.userData.size) {
                continue;
            }
            
            const obstacleBox = {
                position: obstacle.position,
                size: {
                    x: obstacle.userData.size.x + collisionBuffer,
                    z: obstacle.userData.size.z + collisionBuffer
                }
            };
            
            if (Utils.boxCollision(entityBox, obstacleBox)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Move tank with collision detection
     * @param {Tank} tank - The tank to move
     * @param {THREE.Vector3} newPosition - The target position
     * @returns {boolean} - Whether a collision occurred
     */
    moveTankWithCollision(tank, newPosition) {
        // Store original position
        const originalPosition = tank.position.clone();
        
        // Use a step-based approach to prevent going through obstacles
        const steps = 8; // Increased from 5 to make movement more precise
        const stepVector = new THREE.Vector3()
            .subVectors(newPosition, originalPosition)
            .divideScalar(steps);
        
        let collision = false;
        let lastValidPosition = originalPosition.clone();
        
        // Move in small steps and check for collisions at each step
        for (let i = 1; i <= steps; i++) {
            const stepPosition = new THREE.Vector3()
                .copy(originalPosition)
                .add(stepVector.clone().multiplyScalar(i));
            
            // Update tank position temporarily
            tank.position.copy(stepPosition);
            
            // Check for collisions with boundaries
            if (!this.isWithinBoundaries(tank.position)) {
                collision = true;
                break;
            }
            
            // Check for collisions with obstacles
            if (this.obstacles && this.obstacles.length > 0 && 
                this.checkObstacleCollision(tank.position, tank.size, this.obstacles)) {
                collision = true;
                break;
            }
            
            // Check for collisions with other tanks
            let tankCollision = false;
            const tanks = [this.player, ...this.enemies].filter(t => 
                t && t !== tank && t.active && t.position && t.size);
            
            for (const otherTank of tanks) {
                const tankBox = {
                    position: otherTank.position,
                    size: otherTank.size
                };
                
                const currentTankBox = {
                    position: tank.position,
                    size: tank.size
                };
                
                if (Utils.boxCollision(currentTankBox, tankBox)) {
                    tankCollision = true;
                    break;
                }
            }
            
            if (tankCollision) {
                collision = true;
                break;
            }
            
            // If no collision at this step, save the position as valid
            lastValidPosition.copy(stepPosition);
        }
        
        // If collision occurred, revert to last valid position
        if (collision) {
            tank.position.copy(lastValidPosition);
        }
        
        // Update the tank's visual representation
        tank.update(0);
        
        return collision;
    }
    
    /**
     * Update game state
     */
    update(deltaTime) {
        if (this.isPaused) return;
        
        // Update player tank
        if (this.player && this.player.active) {
            // Store previous position for collision handling
            const prevPosition = this.player.position.clone();
            
            // Handle player input
            this.player.processInput(this.keys, this.mousePosition);
            
            // Use step-based collision detection for the player
            this.moveTankWithCollision(this.player, this.player.position);
        }
        
        // Update enemy tanks
        if (this.enemies && this.enemies.length > 0) {
            this.enemies.forEach(enemy => {
                if (enemy && enemy.active) {
                    // Store original position for collision handling
                    const prevPosition = enemy.position.clone();
                    
                    // Update AI to get action but don't immediately move the tank
                    const action = enemy.update(deltaTime, this.player, this.obstacles); // Use deltaTime here
                    
                    // Now handle movement with step-based collision detection
                    const collision = this.moveTankWithCollision(enemy, enemy.position);
                    
                    // If collision occurred, make enemy reconsider its path
                    if (collision) {
                        // Choose a random new direction for the enemy to attempt to navigate around the obstacle
                        const randomAngle = Math.random() * Math.PI * 2;
                        enemy.direction.set(
                            Math.cos(randomAngle),
                            0,
                            Math.sin(randomAngle)
                        ).normalize();
                        
                        // Force enemy to find a new target if in patrol state
                        if (enemy.state === "patrol") {
                            enemy.patrolTimer = 9999;
                        }
                    }
                    
                    // Process action from AI update (shooting/mine dropping)
                    if (action) {
                        if (action.direction) { // It's a projectile
                            const projectile = new Projectile(
                                this.scene,
                                action.position,
                                action.direction,
                                action.speed,
                                enemy
                            );
                            this.projectiles.push(projectile);
                        } else if (action.position) { // It's a mine
                            const mine = new Mine(
                                this.scene,
                                action.position,
                                action.owner
                            );
                            this.mines.push(mine);
                        }
                    }
                }
            });
        }
        
        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            if (!projectile) continue;
            
            // Update position
            projectile.update(deltaTime);
            
            // Check for collisions
            const tanks = [this.player, ...this.enemies].filter(t => t && t.active && t.position && t.size);
            const collision = projectile.checkCollisions(this.obstacles, tanks);
            
            if (collision) {
                // Handle collision
                if (collision.type === 'tank' && collision.object) {
                    const tank = collision.object;
                    
                    // Damage tank
                    const destroyed = tank.takeDamage();
                    
                    // Handle player death
                    if (tank === this.player && destroyed) {
                        this.playerDied();
                    }
                    
                    // Handle enemy death
                    if (tank !== this.player && destroyed) {
                        this.enemyDestroyed(tank);
                    }
                } else if (collision.type === 'obstacle' && collision.object) {
                    // Check if it's a breakable block
                    const obstacle = collision.object;
                    
                    if (obstacle.userData && obstacle.userData.isBreakable) {
                        // Damage block
                        obstacle.userData.health--;
                        
                        // Destroy block if health is depleted
                        if (obstacle.userData.health <= 0) {
                            // Remove from scene
                            this.scene.remove(obstacle);
                            
                            // Remove from obstacles array
                            const index = this.obstacles.indexOf(obstacle);
                            if (index !== -1) {
                                this.obstacles.splice(index, 1);
                            }
                            
                            // Create destruction effect
                            Utils.createExplosion(this.scene, obstacle.position, 1, 800);
                        }
                    }
                }
            }
            
            // Remove inactive projectiles
            if (!projectile.active || projectile.position.y < 0 || 
                Math.abs(projectile.position.x) > this.boundarySize ||
                Math.abs(projectile.position.z) > this.boundarySize) {
                projectile.remove();
                this.projectiles.splice(i, 1);
            }
        }
        
        // Update mines
        for (let i = this.mines.length - 1; i >= 0; i--) {
            const mine = this.mines[i];
            if (!mine) continue;
            
            // Update mine and check for detonation
            const tanks = [this.player, ...this.enemies].filter(t => t && t.active && t.position);
            const detonation = mine.update(tanks);
            
            if (detonation) {
                // Handle detonation
                this.handleExplosion(
                    detonation.position,
                    detonation.radius,
                    detonation.damage,
                    detonation.owner,
                    true // mineExplosion flag
                );
                
                // Remove mine
                mine.remove();
                this.mines.splice(i, 1);
            } else if (!mine.active) {
                // Remove inactive mines
                mine.remove();
                this.mines.splice(i, 1);
            }
        }
        
        // Check if all enemies are destroyed
        if (this.enemies.length > 0 && !this.enemies.some(enemy => enemy.active) && !this.levelCompletionTimeout) {
            this.levelCompleted();
        }
    }
    
    /**
     * Handle explosions (e.g., from mines)
     */
    handleExplosion(position, radius, damage, source, mineExplosion = false) {
        // Check all tanks in explosion radius
        const tanks = [this.player, ...this.enemies].filter(t => t && t.active);
        
        for (const tank of tanks) {
            // Skip the source of the explosion
            if (tank === source) continue;
            
            // Calculate distance to explosion center
            const distance = Utils.distance(
                position.x, position.z,
                tank.position.x, tank.position.z
            );
            
            if (distance < radius) {
                if (mineExplosion) {
                    // For mine explosions, kill any tank in range
                    tank.takeDamage(9999);
                    if (tank === this.player) {
                        this.playerDied();
                    } else {
                        this.enemyDestroyed(tank);
                    }
                } else {
                    // Damage falls off with distance for other explosions
                    const damageFactor = 1 - (distance / radius);
                    const finalDamage = Math.max(1, Math.floor(damage * damageFactor));
                    const destroyed = tank.takeDamage(finalDamage);
                    
                    if (tank === this.player && destroyed) {
                        this.playerDied();
                    }
                    if (tank !== this.player && destroyed) {
                        this.enemyDestroyed(tank);
                    }
                }
            }
        }
        
        // Check for breakable blocks in explosion radius
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            
            if (obstacle.userData && obstacle.userData.isBreakable) {
                const distance = Utils.distance(
                    position.x, position.z,
                    obstacle.position.x, obstacle.position.z
                );
                
                if (distance < radius) {
                    const damageFactor = 1 - (distance / radius);
                    const finalDamage = Math.max(1, Math.floor(damage * damageFactor));
                    obstacle.userData.health -= finalDamage;
                    
                    if (obstacle.userData.health <= 0) {
                        this.scene.remove(obstacle);
                        this.obstacles.splice(i, 1);
                        Utils.createExplosion(this.scene, obstacle.position, 0.8, 500);
                    }
                }
            }
        }
        
        this.audioManager.playSound('explosion');
    }
    
    /**
     * Handle level completion
     */
    levelCompleted() {
        // If there's already a pending level completion, don't schedule another one
        if (this.levelCompletionTimeout) {
            clearTimeout(this.levelCompletionTimeout);
        }
        
        // Add completion bonus
        const levelBonus = 500 * this.levelManager.getLevelNumber();
        this.score += levelBonus;
        this.leaderboard.addScore(levelBonus);
        
        // Update score display
        this.updateHUD();
        
        // Create and display level completion message
        const popup = document.createElement('div');
        popup.className = 'lives-popup';
        popup.innerHTML = `
            <h2>Level Complete!</h2>
            <p>Bonus: ${levelBonus} points</p>
            <p>Loading next level...</p>
        `;
        document.body.appendChild(popup);
        
        // Load next level after a delay
        this.isPaused = true; // Pause the game during transition
        this.levelCompletionTimeout = setTimeout(() => {
            document.body.removeChild(popup);
            this.isPaused = false; // Unpause the game
            this.loadLevel(this.levelManager.nextLevel());
            this.levelCompletionTimeout = null;
        }, 2000);
    }
    
    /**
     * Handle player death
     */
    playerDied() {
        this.lives--;
        this.updateHUD();
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Create death effect
            Utils.createExplosion(this.scene, this.player.position, 1.5, 1000);
            
            // Reset player position and state
            this.player.reset();
            
            // Add brief invulnerability period
            this.player.active = false;
            setTimeout(() => {
                this.player.active = true;
            }, 2000); // 2 seconds of invulnerability
            
            // Play death sound
            this.audioManager.playSound('explosion');
            
            // Show respawn message
            const popup = document.createElement('div');
            popup.className = 'lives-popup';
            popup.innerHTML = `
                <h2>Tank Destroyed!</h2>
                <p>Lives remaining: ${this.lives}</p>
                <p>Respawning...</p>
            `;
            document.body.appendChild(popup);
            
            // Remove popup after delay
            setTimeout(() => {
                document.body.removeChild(popup);
            }, 2000);
        }
    }
    
    /**
     * Handle enemy destruction
     */
    enemyDestroyed(enemy) {
        // Award points based on enemy type
        let points;
        switch (enemy.type) {
            case "basic": points = 100; break;
            case "faster": points = 150; break;
            case "minelayer": points = 200; break;
            case "sniper": points = 250; break;
            case "boss": points = 500; break;
            default: points = 100;
        }
        
        // Add points to score
        this.score += points;
        this.leaderboard.addScore(points);
        
        // Update score display
        this.updateHUD();
    }
    
    /**
     * Update the HUD (lives, score, level)
     */
    updateHUD() {
        // Update score
        this.scoreElement.textContent = `Score: ${this.score}`;
        
        // Update level
        this.levelElement.textContent = `Level: ${this.levelManager.getLevelNumber()}`;
        
        // Update lives
        this.livesElement.innerHTML = '';
        for (let i = 0; i < this.lives; i++) {
            const lifeElement = document.createElement('div');
            lifeElement.className = 'life';
            this.livesElement.appendChild(lifeElement);
        }
        
        // Update version display
        if (this.versionDisplay) {
            this.versionDisplay.textContent = this.version;
        }
    }
    
    /**
     * Render the game
     */
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * Create an obstacle at position
     */
    createObstacle(x, z, type) {
        let geometry, material, mesh;
        const y = 0.3; // Height of obstacles
        
        if (type === 'wall') {
            // Wall - solid obstacle (brown) with no gaps and indestructible
            geometry = new THREE.BoxGeometry(2.0, 0.6, 2.0);
            material = new THREE.MeshStandardMaterial({
                color: 0x8B4513, // Brown
                roughness: 0.8,
                metalness: 0.2
            });
            mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, y, z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            // Mark as a wall obstacle for game logic (indestructible)
            mesh.userData.isWall = true;
            mesh.userData.isLevel = true; // Mark as level wall (not boundary)
            mesh.userData.size = { x: 2.0, z: 2.0 }; // Updated size for contiguous walls
            mesh.userData.isBreakable = false; // Walls are indestructible
            
        } else if (type === 'block') {
            // Breakable block (grey)
            geometry = new THREE.BoxGeometry(0.9, 0.5, 0.9);
            material = new THREE.MeshStandardMaterial({
                color: 0x888888, // Grey
                roughness: 0.6,
                metalness: 0.4
            });
            mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, y, z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            // Add custom properties for game logic
            mesh.userData.isBlock = true;
            mesh.userData.isBreakable = true;
            mesh.userData.health = 2;
            mesh.userData.size = { x: 0.9, z: 0.9 };
        }
        
        if (mesh) {
            this.scene.add(mesh);
            this.obstacles.push(mesh);
        }
        
        return mesh;
    }
    
    /**
     * Set up the HUD (Heads-Up Display)
     */
    setupHUD() {
        // Find DOM elements
        this.container = document.getElementById('game-canvas');
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.livesElement = document.getElementById('lives');
        this.userPrompt = document.getElementById('user-prompt');
        this.gameOver = document.getElementById('game-over');
        this.finalScore = document.getElementById('final-score');
        this.leaderboardList = document.getElementById('leaderboard-list');
        
        // Create version display
        this.versionDisplay = document.createElement('div');
        this.versionDisplay.id = 'version-display';
        this.versionDisplay.textContent = this.version;
        document.getElementById('ui-overlay').appendChild(this.versionDisplay);
        
        // Debug log to verify version is being set correctly
        console.log("Game initialized with version:", this.version);
        
        // Initialize HUD values
        this.updateHUD();
    }
    
    showMainMenu() {
        this.gameOver.classList.add('hidden');
        this.userPrompt.classList.remove('hidden');
        this.audioManager.stopBackgroundMusic();
        this.audioManager.stopAllSounds();
    }
} 
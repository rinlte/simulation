import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function AltitudeGame() {
  const mountRef = useRef(null);
  const [altitude, setAltitude] = useState(0);
  const [oxygenLevel, setOxygenLevel] = useState(100);
  const [temperature, setTemperature] = useState(25);
  const [joystickActive, setJoystickActive] = useState({ up: false, down: false });
  const characterAltitudeRef = useRef(0);

  useEffect(() => {
    // Scene setup with enhanced atmosphere
    const scene = new THREE.Scene();
    const skyColor = new THREE.Color(0x87ceeb);
    scene.background = skyColor;
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.0008);

    // Camera with better positioning
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(15, 8, 25);
    camera.lookAt(0, 5, 0);

    // Renderer with maximum quality settings
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.outputEncoding = THREE.sRGBEncoding;
    mountRef.current.appendChild(renderer.domElement);

    // Enhanced Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.0);
    sunLight.position.set(150, 200, 100);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.far = 1500;
    sunLight.shadow.camera.left = -300;
    sunLight.shadow.camera.right = 300;
    sunLight.shadow.camera.top = 300;
    sunLight.shadow.camera.bottom = -300;
    sunLight.shadow.bias = -0.00015;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x8b7355, 0.8);
    scene.add(hemiLight);

    const fillLight = new THREE.DirectionalLight(0xadd8e6, 0.4);
    fillLight.position.set(-100, 50, -100);
    scene.add(fillLight);

    // Ultra-detailed Ground with multiple noise layers
    const groundGeometry = new THREE.PlaneGeometry(800, 800, 200, 200);
    const vertices = groundGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      const noise1 = Math.sin(x * 0.05) * Math.cos(y * 0.05) * 2;
      const noise2 = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 1;
      const noise3 = Math.random() * 0.8;
      vertices[i + 2] = noise1 + noise2 + noise3;
    }
    groundGeometry.attributes.position.needsUpdate = true;
    groundGeometry.computeVertexNormals();

    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3a5f2a,
      roughness: 0.98,
      metalness: 0.0,
      flatShading: false,
      side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Add grass patches using instanced meshes for performance
    const grassGeometry = new THREE.ConeGeometry(0.3, 1.2, 6);
    const grassMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2d4a1f,
      roughness: 1.0,
      metalness: 0.0
    });
    
    for (let i = 0; i < 300; i++) {
      const grass = new THREE.Mesh(grassGeometry, grassMaterial);
      grass.position.set(
        Math.random() * 400 - 200,
        0.6,
        Math.random() * 400 - 200
      );
      grass.rotation.y = Math.random() * Math.PI;
      grass.scale.set(
        0.8 + Math.random() * 0.4,
        0.8 + Math.random() * 0.6,
        0.8 + Math.random() * 0.4
      );
      grass.castShadow = true;
      scene.add(grass);
    }

    // Ultra-detailed Mountain with complex geometry
    const mountainGeometry = new THREE.ConeGeometry(50, 140, 64, 40);
    const mountainVertices = mountainGeometry.attributes.position.array;
    for (let i = 0; i < mountainVertices.length; i += 3) {
      const x = mountainVertices[i];
      const y = mountainVertices[i + 1];
      const z = mountainVertices[i + 2];
      const distance = Math.sqrt(x * x + z * z);
      const heightFactor = 1 - (y / 70);
      const noise = Math.sin(x * 0.3) * Math.cos(z * 0.3) * heightFactor * 4;
      mountainVertices[i] += (Math.random() - 0.5) * 3 + noise;
      mountainVertices[i + 1] += (Math.random() - 0.5) * 2;
      mountainVertices[i + 2] += (Math.random() - 0.5) * 3 + noise;
    }
    mountainGeometry.attributes.position.needsUpdate = true;
    mountainGeometry.computeVertexNormals();

    const mountainMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x6b5944,
      roughness: 0.95,
      metalness: 0.05,
      flatShading: false
    });
    const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
    mountain.position.set(0, 70, -100);
    mountain.castShadow = true;
    mountain.receiveShadow = true;
    scene.add(mountain);

    // Detailed Snow cap with layered effect
    const snowCapGeometry = new THREE.ConeGeometry(28, 50, 64, 20);
    const snowVertices = snowCapGeometry.attributes.position.array;
    for (let i = 0; i < snowVertices.length; i += 3) {
      const x = snowVertices[i];
      const z = snowVertices[i + 2];
      const noise = Math.sin(x * 0.5) * Math.cos(z * 0.5) * 1.5;
      snowVertices[i] += (Math.random() - 0.5) * 1.8 + noise;
      snowVertices[i + 2] += (Math.random() - 0.5) * 1.8 + noise;
    }
    snowCapGeometry.attributes.position.needsUpdate = true;
    snowCapGeometry.computeVertexNormals();

    const snowMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.15,
      flatShading: false,
      emissive: 0xffffff,
      emissiveIntensity: 0.1
    });
    const snowCap = new THREE.Mesh(snowCapGeometry, snowMaterial);
    snowCap.position.set(0, 115, -100);
    snowCap.castShadow = true;
    snowCap.receiveShadow = true;
    scene.add(snowCap);

    // Add multiple distant mountains for depth
    for (let i = 0; i < 8; i++) {
      const distMountainGeometry = new THREE.ConeGeometry(30 + Math.random() * 20, 80 + Math.random() * 60, 32, 10);
      const distMountainMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x5a4a3a,
        roughness: 0.9,
        metalness: 0.0
      });
      const distMountain = new THREE.Mesh(distMountainGeometry, distMountainMaterial);
      distMountain.position.set(
        (Math.random() - 0.5) * 400,
        40 + Math.random() * 20,
        -200 - Math.random() * 200
      );
      distMountain.castShadow = true;
      scene.add(distMountain);
    }

    // MINECRAFT STEVE CHARACTER - High Detail
    const characterGroup = new THREE.Group();
    
    // Texture-like materials for pixelated Minecraft look
    const skinMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf4c896,
      roughness: 0.8,
      metalness: 0.0,
      flatShading: true
    });
    
    const shirtMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4a90a4,
      roughness: 0.9,
      metalness: 0.0,
      flatShading: true
    });
    
    const pantsMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3b4a8a,
      roughness: 0.9,
      metalness: 0.0,
      flatShading: true
    });
    
    const shoeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2a2a2a,
      roughness: 0.8,
      metalness: 0.1,
      flatShading: true
    });
    
    const hairMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4a3728,
      roughness: 0.9,
      metalness: 0.0,
      flatShading: true
    });

    // Head (larger, blocky)
    const headGeometry = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    const head = new THREE.Mesh(headGeometry, skinMaterial);
    head.position.y = 3.2;
    head.castShadow = true;
    characterGroup.add(head);

    // Hair/Top of head (blocky layer)
    const hairGeometry = new THREE.BoxGeometry(1.65, 0.4, 1.65);
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.y = 4.0;
    hair.castShadow = true;
    characterGroup.add(hair);

    // Eyes (simple blocks)
    const eyeGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.05);
    const eyeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4a9cd4,
      roughness: 0.3,
      metalness: 0.2,
      flatShading: true
    });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.4, 3.4, 0.8);
    characterGroup.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.4, 3.4, 0.8);
    characterGroup.add(rightEye);

    // Mouth (simple block)
    const mouthGeometry = new THREE.BoxGeometry(0.6, 0.15, 0.05);
    const mouthMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8b5a3c,
      roughness: 0.8,
      flatShading: true
    });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, 2.8, 0.8);
    characterGroup.add(mouth);

    // Body (torso) - rectangular and blocky
    const bodyGeometry = new THREE.BoxGeometry(1.6, 2.4, 0.8);
    const body = new THREE.Mesh(bodyGeometry, shirtMaterial);
    body.position.y = 1.2;
    body.castShadow = true;
    characterGroup.add(body);

    // Arms - blocky rectangular prisms
    const armGeometry = new THREE.BoxGeometry(0.6, 2.0, 0.6);
    
    const leftArm = new THREE.Mesh(armGeometry, shirtMaterial);
    leftArm.position.set(-1.1, 1.4, 0);
    leftArm.castShadow = true;
    characterGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, shirtMaterial);
    rightArm.position.set(1.1, 1.4, 0);
    rightArm.castShadow = true;
    characterGroup.add(rightArm);

    // Hands (skin colored blocks)
    const handGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const leftHand = new THREE.Mesh(handGeometry, skinMaterial);
    leftHand.position.set(-1.1, 0.2, 0);
    leftHand.castShadow = true;
    characterGroup.add(leftHand);

    const rightHand = new THREE.Mesh(handGeometry, skinMaterial);
    rightHand.position.set(1.1, 0.2, 0);
    rightHand.castShadow = true;
    characterGroup.add(rightHand);

    // Legs - blocky rectangular prisms
    const legGeometry = new THREE.BoxGeometry(0.7, 2.0, 0.7);
    
    const leftLeg = new THREE.Mesh(legGeometry, pantsMaterial);
    leftLeg.position.set(-0.45, -0.8, 0);
    leftLeg.castShadow = true;
    characterGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, pantsMaterial);
    rightLeg.position.set(0.45, -0.8, 0);
    rightLeg.castShadow = true;
    characterGroup.add(rightLeg);

    // Shoes (darker blocks at bottom)
    const shoeGeometry = new THREE.BoxGeometry(0.7, 0.4, 0.9);
    const leftShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
    leftShoe.position.set(-0.45, -1.8, 0.1);
    leftShoe.castShadow = true;
    characterGroup.add(leftShoe);

    const rightShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
    rightShoe.position.set(0.45, -1.8, 0.1);
    rightShoe.castShadow = true;
    characterGroup.add(rightShoe);

    // Belt detail
    const beltGeometry = new THREE.BoxGeometry(1.65, 0.3, 0.85);
    const beltMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2a2a2a,
      roughness: 0.7,
      metalness: 0.2,
      flatShading: true
    });
    const belt = new THREE.Mesh(beltGeometry, beltMaterial);
    belt.position.y = 0.15;
    belt.castShadow = true;
    characterGroup.add(belt);

    characterGroup.position.set(0, 0, 5);
    characterGroup.castShadow = true;
    scene.add(characterGroup);

    // Ultra-realistic volumetric clouds
    const clouds = [];
    const cloudMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
      roughness: 1,
      metalness: 0,
      flatShading: false
    });

    for (let i = 0; i < 35; i++) {
      const cloudGroup = new THREE.Group();
      const numParts = 12 + Math.floor(Math.random() * 8);
      for (let j = 0; j < numParts; j++) {
        const cloudGeometry = new THREE.SphereGeometry(
          Math.random() * 5 + 4, 
          24, 
          24
        );
        const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial.clone());
        cloudPart.material.opacity = 0.7 + Math.random() * 0.2;
        cloudPart.position.set(
          Math.random() * 16 - 8,
          Math.random() * 4 - 2,
          Math.random() * 16 - 8
        );
        cloudPart.scale.set(
          1 + Math.random() * 0.7,
          0.5 + Math.random() * 0.4,
          1 + Math.random() * 0.7
        );
        cloudGroup.add(cloudPart);
      }
      cloudGroup.position.set(
        Math.random() * 300 - 150,
        Math.random() * 100 + 40,
        Math.random() * 300 - 150
      );
      clouds.push(cloudGroup);
      scene.add(cloudGroup);
    }

    // Enhanced altitude markers with detailed design
    const markers = [];
    for (let i = 0; i <= 88; i += 10) {
      // Main pole
      const markerGeometry = new THREE.CylinderGeometry(0.2, 0.2, 3.0, 16);
      const markerMaterial = new THREE.MeshStandardMaterial({ 
        color: i > 50 ? 0xdd1111 : 0x11dd11,
        roughness: 0.5,
        metalness: 0.4,
        emissive: i > 50 ? 0x330000 : 0x003300,
        emissiveIntensity: 0.2
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(-12, i + 1.5, 0);
      marker.castShadow = true;
      markers.push(marker);
      scene.add(marker);

      // Base platform
      const baseGeometry = new THREE.CylinderGeometry(0.5, 0.6, 0.3, 16);
      const baseMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x444444,
        roughness: 0.7,
        metalness: 0.3
      });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.set(-12, i, 0);
      base.castShadow = true;
      scene.add(base);

      // Top sphere
      const topGeometry = new THREE.SphereGeometry(0.3, 16, 16);
      const top = new THREE.Mesh(topGeometry, markerMaterial);
      top.position.set(-12, i + 3.2, 0);
      top.castShadow = true;
      scene.add(top);

      // Sign board with better design
      const signGeometry = new THREE.BoxGeometry(2.0, 0.8, 0.15);
      const signMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.4,
        metalness: 0.1
      });
      const sign = new THREE.Mesh(signGeometry, signMaterial);
      sign.position.set(-12, i + 2.8, 0);
      sign.castShadow = true;
      scene.add(sign);

      // Sign frame
      const frameGeometry = new THREE.BoxGeometry(2.1, 0.9, 0.1);
      const frameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x222222,
        roughness: 0.6,
        metalness: 0.4
      });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.position.set(-12, i + 2.8, -0.05);
      scene.add(frame);
    }

    // Add trees for environment detail
    for (let i = 0; i < 50; i++) {
      const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 4, 8);
      const trunkMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4a3020,
        roughness: 0.95
      });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      
      const leavesGeometry = new THREE.ConeGeometry(2, 5, 8);
      const leavesMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2d5016,
        roughness: 0.9
      });
      const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
      leaves.position.y = 4.5;
      
      const tree = new THREE.Group();
      tree.add(trunk);
      tree.add(leaves);
      tree.position.set(
        Math.random() * 200 - 100,
        0,
        Math.random() * 200 - 100
      );
      tree.castShadow = true;
      tree.receiveShadow = true;
      scene.add(tree);
    }

    // Add rocks for detail
    for (let i = 0; i < 80; i++) {
      const rockGeometry = new THREE.DodecahedronGeometry(Math.random() * 1.5 + 0.5, 0);
      const rockMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x666666,
        roughness: 0.95,
        metalness: 0.05,
        flatShading: true
      });
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      rock.position.set(
        Math.random() * 300 - 150,
        0.5,
        Math.random() * 300 - 150
      );
      rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      rock.castShadow = true;
      rock.receiveShadow = true;
      scene.add(rock);
    }

    const maxAltitude = 88;
    const speed = 0.3;
    let animationTime = 0;

    // Animation loop with enhanced effects
    function animate() {
      requestAnimationFrame(animate);
      animationTime += 0.01;

      // Update character position based on joystick - PERSISTENT POSITION
      if (joystickActive.up && characterAltitudeRef.current < maxAltitude) {
        characterAltitudeRef.current += speed;
      } else if (joystickActive.down && characterAltitudeRef.current > 0) {
        characterAltitudeRef.current -= speed;
      }

      characterAltitudeRef.current = Math.max(0, Math.min(maxAltitude, characterAltitudeRef.current));
      
      characterGroup.position.y = characterAltitudeRef.current;
      camera.position.y = characterAltitudeRef.current + 8;
      camera.lookAt(0, characterAltitudeRef.current + 3, 0);

      // Update stats
      setAltitude(Math.round(characterAltitudeRef.current * 100));
      const oxygenPercent = Math.max(30, 100 - (characterAltitudeRef.current / maxAltitude) * 70);
      setOxygenLevel(Math.round(oxygenPercent));
      const temp = 25 - (characterAltitudeRef.current / maxAltitude) * 50;
      setTemperature(Math.round(temp));

      // Dynamic sky color based on altitude
      const skyBrightness = 1 - (characterAltitudeRef.current / maxAltitude) * 0.3;
      scene.background.setRGB(
        0.53 * skyBrightness,
        0.81 * skyBrightness,
        0.92 * skyBrightness
      );

      // Animate clouds with varying speeds and subtle rotation
      clouds.forEach((cloud, index) => {
        cloud.position.x += 0.012 * (1 + index * 0.03);
        if (cloud.position.x > 200) cloud.position.x = -200;
        cloud.rotation.y += 0.0003;
        cloud.position.y += Math.sin(animationTime + index) * 0.01;
      });

      // Minecraft-style character animation (subtle block movement)
      head.rotation.y = Math.sin(animationTime * 1.5) * 0.15;
      
      if (joystickActive.up || joystickActive.down) {
        // Walking animation
        leftArm.rotation.x = Math.sin(animationTime * 4) * 0.5;
        rightArm.rotation.x = Math.sin(animationTime * 4 + Math.PI) * 0.5;
        leftLeg.rotation.x = Math.sin(animationTime * 4 + Math.PI) * 0.4;
        rightLeg.rotation.x = Math.sin(animationTime * 4) * 0.4;
      } else {
        // Idle animation
        leftArm.rotation.x = Math.sin(animationTime * 0.5) * 0.05;
        rightArm.rotation.x = Math.sin(animationTime * 0.5 + Math.PI) * 0.05;
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
      }

      // Subtle light movement for dynamic shadows
      sunLight.position.x = 150 + Math.sin(animationTime * 0.1) * 20;
      sunLight.position.z = 100 + Math.cos(animationTime * 0.1) * 20;

      renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [joystickActive]);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <div ref={mountRef} />
      
      {/* Enhanced Stats Panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,30,0.95) 100%)',
        color: 'white',
        padding: '28px',
        borderRadius: '20px',
        fontFamily: "'Segoe UI', Arial, sans-serif",
        minWidth: '240px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)',
        backdropFilter: 'blur(15px)',
        border: '2px solid rgba(255,255,255,0.15)'
      }}>
        <h2 style={{ 
          margin: '0 0 18px 0', 
          fontSize: '26px', 
          background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          borderBottom: '3px solid #4CAF50', 
          paddingBottom: '12px',
          fontWeight: '700'
        }}>
          📊 Statistics
        </h2>
        <div style={{ fontSize: '18px', lineHeight: '2.4', fontWeight: '500' }}>
          <div style={{
            background: 'rgba(76, 175, 80, 0.1)',
            padding: '10px',
            borderRadius: '10px',
            marginBottom: '10px',
            borderLeft: '4px solid #4CAF50'
          }}>
            <strong>🏔️ Altitude:</strong> <span style={{ float: 'right', color: '#4CAF50' }}>{altitude}m</span>
          </div>
          <div style={{ 
            background: oxygenLevel < 60 ? 'rgba(255, 68, 68, 0.1)' : 'rgba(76, 175, 80, 0.1)',
            padding: '10px',
            borderRadius: '10px',
            marginBottom: '10px',
            borderLeft: `4px solid ${oxygenLevel < 60 ? '#ff4444' : '#4CAF50'}`
          }}>
            <strong>💨 Oxygen:</strong> <span style={{ float: 'right', color: oxygenLevel < 60 ? '#ff4444' : '#4CAF50' }}>{oxygenLevel}%</span>
          </div>
          <div style={{ 
            background: temperature < 0 ? 'rgba(0, 191, 255, 0.1)' : 'rgba(255, 140, 0, 0.1)',
            padding: '10px',
            borderRadius:

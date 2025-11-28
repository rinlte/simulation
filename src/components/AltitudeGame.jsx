import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function AltitudeGame() {
  const mountRef = useRef(null);
  const [altitude, setAltitude] = useState(0);
  const [oxygenLevel, setOxygenLevel] = useState(100);
  const [temperature, setTemperature] = useState(25);
  const [speed, setSpeed] = useState(0);
  const gameStateRef = useRef({ altitude: 0, velocity: 0 });

  useEffect(() => {
    const scene = new THREE.Scene();
    
    // Dynamic sky color based on altitude
    const skyColor = new THREE.Color(0x87ceeb);
    scene.background = skyColor;
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.0015);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 5, 25);

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

    // Enhanced lighting system
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
    sunLight.shadow.bias = -0.0001;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x8b7355, 0.7);
    scene.add(hemiLight);

    const fillLight = new THREE.DirectionalLight(0x9ec7ff, 0.4);
    fillLight.position.set(-100, 50, -100);
    scene.add(fillLight);

    // Highly detailed ground with varied terrain
    const groundGeometry = new THREE.PlaneGeometry(800, 800, 200, 200);
    const vertices = groundGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      const dist = Math.sqrt(x * x + y * y);
      vertices[i + 2] = Math.sin(x * 0.05) * Math.cos(y * 0.05) * 3 + 
                        Math.random() * 2 - 
                        dist * 0.002;
    }
    groundGeometry.attributes.position.needsUpdate = true;
    groundGeometry.computeVertexNormals();

    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3a5f2a,
      roughness: 0.95,
      metalness: 0.0,
      flatShading: false
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Add grass patches for realism
    const grassGroup = new THREE.Group();
    for (let i = 0; i < 150; i++) {
      const grassGeometry = new THREE.ConeGeometry(0.3, 1.5, 4);
      const grassMaterial = new THREE.MeshStandardMaterial({ 
        color: Math.random() > 0.5 ? 0x2d4a1f : 0x3a5f2a,
        roughness: 1.0
      });
      const grass = new THREE.Mesh(grassGeometry, grassMaterial);
      grass.position.set(
        Math.random() * 400 - 200,
        0,
        Math.random() * 400 - 200
      );
      grass.rotation.y = Math.random() * Math.PI;
      grass.scale.set(
        0.5 + Math.random() * 0.5,
        0.5 + Math.random() * 1,
        0.5 + Math.random() * 0.5
      );
      grass.castShadow = true;
      grassGroup.add(grass);
    }
    scene.add(grassGroup);

    // Multiple mountains with varied sizes
    const mountains = [];
    const mountainConfigs = [
      { x: 0, z: -100, radius: 50, height: 150, color: 0x6b5944 },
      { x: -80, z: -150, radius: 35, height: 100, color: 0x7a6a54 },
      { x: 90, z: -180, radius: 40, height: 120, color: 0x5d4e3c },
      { x: -150, z: -250, radius: 30, height: 80, color: 0x8b7a65 }
    ];

    mountainConfigs.forEach(config => {
      const mountainGeometry = new THREE.ConeGeometry(config.radius, config.height, 64, 32);
      const mountainVertices = mountainGeometry.attributes.position.array;
      for (let i = 0; i < mountainVertices.length; i += 3) {
        const noise = (Math.random() - 0.5) * 4;
        mountainVertices[i] += noise;
        mountainVertices[i + 1] += (Math.random() - 0.5) * 3;
        mountainVertices[i + 2] += noise;
      }
      mountainGeometry.attributes.position.needsUpdate = true;
      mountainGeometry.computeVertexNormals();

      const mountainMaterial = new THREE.MeshStandardMaterial({ 
        color: config.color,
        roughness: 0.9,
        metalness: 0.05,
        flatShading: false
      });
      const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
      mountain.position.set(config.x, config.height / 2, config.z);
      mountain.castShadow = true;
      mountain.receiveShadow = true;
      mountains.push(mountain);
      scene.add(mountain);

      // Snow cap
      const snowHeight = config.height * 0.3;
      const snowRadius = config.radius * 0.5;
      const snowCapGeometry = new THREE.ConeGeometry(snowRadius, snowHeight, 32, 16);
      const snowVertices = snowCapGeometry.attributes.position.array;
      for (let i = 0; i < snowVertices.length; i += 3) {
        snowVertices[i] += (Math.random() - 0.5) * 1.5;
        snowVertices[i + 2] += (Math.random() - 0.5) * 1.5;
      }
      snowCapGeometry.attributes.position.needsUpdate = true;
      snowCapGeometry.computeVertexNormals();

      const snowMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xfafafa,
        roughness: 0.3,
        metalness: 0.15,
        emissive: 0xffffff,
        emissiveIntensity: 0.1
      });
      const snowCap = new THREE.Mesh(snowCapGeometry, snowMaterial);
      snowCap.position.set(config.x, config.height - snowHeight / 2, config.z);
      snowCap.castShadow = true;
      scene.add(snowCap);
    });

    // Enhanced character with better proportions
    const characterGroup = new THREE.Group();
    
    const headGeometry = new THREE.SphereGeometry(0.7, 32, 32);
    const skinMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf4c2a8,
      roughness: 0.6,
      metalness: 0.1
    });
    const head = new THREE.Mesh(headGeometry, skinMaterial);
    head.position.y = 2.2;
    head.castShadow = true;
    characterGroup.add(head);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 2.3, 0.6);
    characterGroup.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 2.3, 0.6);
    characterGroup.add(rightEye);

    const bodyGeometry = new THREE.CylinderGeometry(0.6, 0.7, 2.0, 32);
    const clothMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2c5f8d,
      roughness: 0.8,
      metalness: 0.0
    });
    const body = new THREE.Mesh(bodyGeometry, clothMaterial);
    body.position.y = 1.0;
    body.castShadow = true;
    characterGroup.add(body);

    // Backpack
    const backpackGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.4);
    const backpackMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8b4513,
      roughness: 0.9
    });
    const backpack = new THREE.Mesh(backpackGeometry, backpackMaterial);
    backpack.position.set(0, 1.3, -0.5);
    backpack.castShadow = true;
    characterGroup.add(backpack);

    const armGeometry = new THREE.CylinderGeometry(0.18, 0.16, 1.4, 16);
    const leftArm = new THREE.Mesh(armGeometry, clothMaterial);
    leftArm.position.set(-0.8, 1.0, 0);
    leftArm.rotation.z = 0.2;
    leftArm.castShadow = true;
    characterGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, clothMaterial);
    rightArm.position.set(0.8, 1.0, 0);
    rightArm.rotation.z = -0.2;
    rightArm.castShadow = true;
    characterGroup.add(rightArm);

    const legGeometry = new THREE.CylinderGeometry(0.22, 0.2, 1.6, 16);
    const leftLeg = new THREE.Mesh(legGeometry, clothMaterial);
    leftLeg.position.set(-0.3, -0.8, 0);
    leftLeg.castShadow = true;
    characterGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, clothMaterial);
    rightLeg.position.set(0.3, -0.8, 0);
    rightLeg.castShadow = true;
    characterGroup.add(rightLeg);

    characterGroup.position.set(0, 0, 5);
    characterGroup.castShadow = true;
    scene.add(characterGroup);

    // Volumetric clouds with better variety
    const clouds = [];
    const cloudMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
      roughness: 1,
      metalness: 0
    });

    for (let i = 0; i < 40; i++) {
      const cloudGroup = new THREE.Group();
      const numParts = 10 + Math.floor(Math.random() * 8);
      for (let j = 0; j < numParts; j++) {
        const cloudGeometry = new THREE.SphereGeometry(
          Math.random() * 5 + 3, 
          16, 
          16
        );
        const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial.clone());
        cloudPart.position.set(
          (Math.random() - 0.5) * 18,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 18
        );
        cloudPart.scale.set(
          1 + Math.random() * 0.6,
          0.5 + Math.random() * 0.4,
          1 + Math.random() * 0.6
        );
        cloudGroup.add(cloudPart);
      }
      cloudGroup.position.set(
        Math.random() * 400 - 200,
        Math.random() * 100 + 40,
        Math.random() * 400 - 200
      );
      clouds.push({
        group: cloudGroup,
        speed: 0.01 + Math.random() * 0.02
      });
      scene.add(cloudGroup);
    }

    // Altitude markers with better design
    const markers = [];
    for (let i = 0; i <= 88; i += 10) {
      const markerGeometry = new THREE.CylinderGeometry(0.2, 0.2, 3, 16);
      const markerMaterial = new THREE.MeshStandardMaterial({ 
        color: i > 50 ? 0xcc0000 : 0x00aa00,
        roughness: 0.5,
        metalness: 0.4,
        emissive: i > 50 ? 0x440000 : 0x004400,
        emissiveIntensity: 0.2
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(-12, i + 1.5, 0);
      marker.castShadow = true;
      markers.push(marker);
      scene.add(marker);

      const signGeometry = new THREE.BoxGeometry(2, 0.8, 0.15);
      const signMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.4,
        metalness: 0.1
      });
      const sign = new THREE.Mesh(signGeometry, signMaterial);
      sign.position.set(-12, i + 3.2, 0);
      sign.castShadow = true;
      scene.add(sign);

      // Number on sign
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 80px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${i * 100}m`, 128, 64);
      
      const texture = new THREE.CanvasTexture(canvas);
      const textMaterial = new THREE.MeshBasicMaterial({ map: texture });
      const textGeometry = new THREE.PlaneGeometry(1.8, 0.7);
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textMesh.position.set(-12, i + 3.2, 0.08);
      scene.add(textMesh);
    }

    // Birds for atmosphere
    const birds = [];
    for (let i = 0; i < 15; i++) {
      const birdGeometry = new THREE.ConeGeometry(0.3, 0.8, 4);
      const birdMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
      const bird = new THREE.Mesh(birdGeometry, birdMaterial);
      bird.rotation.x = Math.PI / 2;
      bird.position.set(
        Math.random() * 200 - 100,
        Math.random() * 60 + 20,
        Math.random() * 200 - 100
      );
      birds.push({
        mesh: bird,
        speed: 0.1 + Math.random() * 0.2,
        radius: 30 + Math.random() * 50,
        angle: Math.random() * Math.PI * 2,
        height: bird.position.y
      });
      scene.add(bird);
    }

    // Particle system for atmosphere
    const particleCount = 500;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = Math.random() * 400 - 200;
      particlePositions[i + 1] = Math.random() * 200;
      particlePositions[i + 2] = Math.random() * 400 - 200;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.3,
      transparent: true,
      opacity: 0.6
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const maxAltitude = 88;
    const climbSpeed = 0.5;
    const descendSpeed = 0.5;

    function animate() {
      requestAnimationFrame(animate);

      const currentVelocity = gameStateRef.current.velocity;
      gameStateRef.current.altitude += currentVelocity;
      gameStateRef.current.altitude = Math.max(0, Math.min(maxAltitude, gameStateRef.current.altitude));

      const altitude = gameStateRef.current.altitude;
      characterGroup.position.y = altitude;
      
      // Smooth camera follow
      const targetCameraY = altitude + 8;
      camera.position.y += (targetCameraY - camera.position.y) * 0.1;
      camera.position.z = 25 + altitude * 0.1;
      camera.lookAt(0, altitude + 3, 0);

      // Dynamic sky and fog based on altitude
      const altitudeRatio = altitude / maxAltitude;
      const skyColorValue = 0x87ceeb * (1 - altitudeRatio * 0.5) + 0x1a1a3a * altitudeRatio * 0.5;
      scene.background.setHex(skyColorValue);
      scene.fog.color.setHex(skyColorValue);
      scene.fog.density = 0.0015 + altitudeRatio * 0.003;

      // Update stats
      setAltitude(Math.round(altitude * 100));
      const oxygenPercent = Math.max(30, 100 - (altitude / maxAltitude) * 70);
      setOxygenLevel(Math.round(oxygenPercent));
      const temp = 25 - (altitude / maxAltitude) * 50;
      setTemperature(Math.round(temp));
      setSpeed(Math.abs(currentVelocity * 100).toFixed(1));

      // Animate clouds
      clouds.forEach((cloud) => {
        cloud.group.position.x += cloud.speed;
        if (cloud.group.position.x > 250) cloud.group.position.x = -250;
        cloud.group.rotation.y += 0.0002;
      });

      // Animate birds
      birds.forEach((bird) => {
        bird.angle += bird.speed * 0.01;
        bird.mesh.position.x = Math.cos(bird.angle) * bird.radius;
        bird.mesh.position.z = Math.sin(bird.angle) * bird.radius;
        bird.mesh.position.y = bird.height + Math.sin(bird.angle * 2) * 3;
        bird.mesh.rotation.y = bird.angle + Math.PI / 2;
      });

      // Animate particles
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.05;
        if (positions[i + 1] < 0) positions[i + 1] = 200;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Character animations
      const time = Date.now() * 0.001;
      head.rotation.y = Math.sin(time * 0.5) * 0.15;
      head.rotation.x = Math.sin(time * 0.3) * 0.05;
      
      if (Math.abs(currentVelocity) > 0.01) {
        leftArm.rotation.z = 0.2 + Math.sin(time * 8) * 0.3;
        rightArm.rotation.z = -0.2 - Math.sin(time * 8) * 0.3;
        leftLeg.rotation.x = Math.sin(time * 8) * 0.4;
        rightLeg.rotation.x = -Math.sin(time * 8) * 0.4;
      } else {
        leftArm.rotation.z += (0.2 - leftArm.rotation.z) * 0.1;
        rightArm.rotation.z += (-0.2 - rightArm.rotation.z) * 0.1;
        leftLeg.rotation.x *= 0.9;
        rightLeg.rotation.x *= 0.9;
      }

      renderer.render(scene, camera);
    }

    animate();

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  const handleMoveUp = (active) => {
    if (active) {
      gameStateRef.current.velocity = 0.5;
    } else {
      gameStateRef.current.velocity = 0;
    }
  };

  const handleMoveDown = (active) => {
    if (active) {
      gameStateRef.current.velocity = -0.5;
    } else {
      gameStateRef.current.velocity = 0;
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <div ref={mountRef} />
      
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '25px 30px',
        borderRadius: '20px',
        fontFamily: "'Segoe UI', Arial, sans-serif",
        minWidth: '240px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
        backdropFilter: 'blur(15px)',
        border: '2px solid rgba(255,255,255,0.15)'
      }}>
        <h2 style={{ 
          margin: '0 0 20px 0', 
          fontSize: '26px', 
          borderBottom: '3px solid #4CAF50', 
          paddingBottom: '12px',
          fontWeight: '700',
          letterSpacing: '1px'
        }}>
          📊 STATS
        </h2>
        <div style={{ fontSize: '18px', lineHeight: '2.4', fontWeight: '500' }}>
          <div style={{ 
            background: 'rgba(76, 175, 80, 0.2)', 
            padding: '8px 12px', 
            borderRadius: '8px',
            marginBottom: '10px'
          }}>
            <strong>🏔️ Altitude:</strong> {altitude}m
          </div>
          <div style={{ 
            background: oxygenLevel < 60 ? 'rgba(255, 68, 68, 0.2)' : 'rgba(76, 175, 80, 0.2)',
            padding: '8px 12px', 
            borderRadius: '8px',
            marginBottom: '10px',
            color: oxygenLevel < 60 ? '#ff4444' : '#4CAF50'
          }}>
            <strong>💨 Oxygen:</strong> {oxygenLevel}%
          </div>
          <div style={{ 
            background: temperature < 0 ? 'rgba(0, 191, 255, 0.2)' : 'rgba(255, 140, 0, 0.2)',
            padding: '8px 12px', 
            borderRadius: '8px',
            marginBottom: '10px',
            color: temperature < 0 ? '#00bfff' : '#ff8c00'
          }}>
            <strong>🌡️ Temp:</strong> {temperature}°C
          </div>
          <div style={{ 
            background: 'rgba(138, 43, 226, 0.2)', 
            padding: '8px 12px', 
            borderRadius: '8px'
          }}>
            <strong>⚡ Speed:</strong> {speed} m/s
          </div>
        </div>
        <div style={{ 
          marginTop: '18px', 
          fontSize: '13px', 
          color: '#bbb', 
          borderTop: '2px solid #444', 
          paddingTop: '12px',
          fontStyle: 'italic'
        }}>
          Max: 8,800m (Mt. Everest) 🏔️
        </div>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '50px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        alignItems: 'center'
      }}>
        <button
          onMouseDown={() => handleMoveUp(true)}
          onMouseUp={() => handleMoveUp(false)}
          onMouseLeave={() => handleMoveUp(false)}
          onTouchStart={(e) => { e.preventDefault(); handleMoveUp(true); }}
          onTouchEnd={(e) => { e.preventDefault(); handleMoveUp(false); }}
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.3)',
            background: 'linear-gradient(145deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '45px',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.5)',
            transition: 'all 0.15s ease',
            userSelect: 'none',
            fontWeight: 'bold'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          ⬆️
        </button>
        <button
          onMouseDown={() => handleMoveDown(true)}
          onMouseUp={() => handleMoveDown(false)}
          onMouseLeave={() => handleMoveDown(false)}
          onTouchStart={(e) => { e.preventDefault(); handleMoveDown(true); }}
          onTouchEnd={(e) => { e.preventDefault(); handleMoveDown(false); }}
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.3)',
            background: 'linear-gradient(145deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            fontSize: '45px',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(240, 147, 251, 0.5)',
            transition: 'all 0.15s ease',
            userSelect: 'none',
            fontWeight: 'bold'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          ⬇️
        </button>
      </div>
    </div>
  );
          }

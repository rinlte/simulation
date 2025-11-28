import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function AltitudeGame() {
  const mountRef = useRef(null);
  const [altitude, setAltitude] = useState(0);
  const [oxygenLevel, setOxygenLevel] = useState(100);
  const [temperature, setTemperature] = useState(25);
  const [joystickActive, setJoystickActive] = useState({ up: false, down: false });

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 100, 800);

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 20);
    camera.lookAt(0, 5, 0);

    // Renderer with realistic settings
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputEncoding = THREE.sRGBEncoding;
    mountRef.current.appendChild(renderer.domElement);

    // Realistic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.5);
    sunLight.position.set(100, 150, 100);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.far = 1000;
    sunLight.shadow.camera.left = -200;
    sunLight.shadow.camera.right = 200;
    sunLight.shadow.camera.top = 200;
    sunLight.shadow.camera.bottom = -200;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);

    // Hemisphere light for realistic sky
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x8b7355, 0.6);
    scene.add(hemiLight);

    // Realistic Ground with texture-like appearance
    const groundGeometry = new THREE.PlaneGeometry(500, 500, 100, 100);
    const vertices = groundGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      vertices[i + 2] = Math.random() * 1.5;
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

    // Realistic Mountain with detailed geometry
    const mountainGeometry = new THREE.ConeGeometry(40, 120, 32, 20);
    const mountainVertices = mountainGeometry.attributes.position.array;
    for (let i = 0; i < mountainVertices.length; i += 3) {
      mountainVertices[i] += (Math.random() - 0.5) * 3;
      mountainVertices[i + 1] += (Math.random() - 0.5) * 2;
      mountainVertices[i + 2] += (Math.random() - 0.5) * 3;
    }
    mountainGeometry.attributes.position.needsUpdate = true;
    mountainGeometry.computeVertexNormals();

    const mountainMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x6b5944,
      roughness: 0.9,
      metalness: 0.05,
      flatShading: false
    });
    const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
    mountain.position.set(0, 60, -80);
    mountain.castShadow = true;
    mountain.receiveShadow = true;
    scene.add(mountain);

    // Realistic Snow cap with rough texture
    const snowCapGeometry = new THREE.ConeGeometry(20, 40, 32, 10);
    const snowVertices = snowCapGeometry.attributes.position.array;
    for (let i = 0; i < snowVertices.length; i += 3) {
      snowVertices[i] += (Math.random() - 0.5) * 1.5;
      snowVertices[i + 2] += (Math.random() - 0.5) * 1.5;
    }
    snowCapGeometry.attributes.position.needsUpdate = true;
    snowCapGeometry.computeVertexNormals();

    const snowMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xfafafa,
      roughness: 0.4,
      metalness: 0.1,
      flatShading: false
    });
    const snowCap = new THREE.Mesh(snowCapGeometry, snowMaterial);
    snowCap.position.set(0, 100, -80);
    snowCap.castShadow = true;
    snowCap.receiveShadow = true;
    scene.add(snowCap);

    // Realistic Character (human-like)
    const characterGroup = new THREE.Group();
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    const skinMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf4c2a8,
      roughness: 0.7,
      metalness: 0.1
    });
    const head = new THREE.Mesh(headGeometry, skinMaterial);
    head.position.y = 2;
    head.castShadow = true;
    characterGroup.add(head);

    // Body (torso)
    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.6, 1.8, 32);
    const clothMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2c5f8d,
      roughness: 0.8,
      metalness: 0.0
    });
    const body = new THREE.Mesh(bodyGeometry, clothMaterial);
    body.position.y = 0.9;
    body.castShadow = true;
    characterGroup.add(body);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 16);
    const leftArm = new THREE.Mesh(armGeometry, clothMaterial);
    leftArm.position.set(-0.7, 0.9, 0);
    leftArm.rotation.z = 0.3;
    leftArm.castShadow = true;
    characterGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, clothMaterial);
    rightArm.position.set(0.7, 0.9, 0);
    rightArm.rotation.z = -0.3;
    rightArm.castShadow = true;
    characterGroup.add(rightArm);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.2, 0.18, 1.5, 16);
    const leftLeg = new THREE.Mesh(legGeometry, clothMaterial);
    leftLeg.position.set(-0.3, -0.75, 0);
    leftLeg.castShadow = true;
    characterGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, clothMaterial);
    rightLeg.position.set(0.3, -0.75, 0);
    rightLeg.castShadow = true;
    characterGroup.add(rightLeg);

    characterGroup.position.set(0, 0, 5);
    scene.add(characterGroup);

    // Realistic Clouds with volume
    const clouds = [];
    const cloudMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      roughness: 1,
      metalness: 0
    });

    for (let i = 0; i < 20; i++) {
      const cloudGroup = new THREE.Group();
      const numParts = 8 + Math.floor(Math.random() * 5);
      for (let j = 0; j < numParts; j++) {
        const cloudGeometry = new THREE.SphereGeometry(
          Math.random() * 4 + 3, 
          16, 
          16
        );
        const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloudPart.position.set(
          Math.random() * 12 - 6,
          Math.random() * 3 - 1,
          Math.random() * 12 - 6
        );
        cloudPart.scale.set(
          1 + Math.random() * 0.5,
          0.6 + Math.random() * 0.3,
          1 + Math.random() * 0.5
        );
        cloudGroup.add(cloudPart);
      }
      cloudGroup.position.set(
        Math.random() * 200 - 100,
        Math.random() * 80 + 30,
        Math.random() * 200 - 100
      );
      clouds.push(cloudGroup);
      scene.add(cloudGroup);
    }

    // Altitude markers (realistic poles)
    const markers = [];
    for (let i = 0; i <= 88; i += 10) {
      const markerGeometry = new THREE.CylinderGeometry(0.15, 0.15, 2.5, 16);
      const markerMaterial = new THREE.MeshStandardMaterial({ 
        color: i > 50 ? 0xcc0000 : 0x00aa00,
        roughness: 0.6,
        metalness: 0.3
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(-10, i + 1.25, 0);
      marker.castShadow = true;
      markers.push(marker);
      scene.add(marker);

      // Marker sign
      const signGeometry = new THREE.BoxGeometry(1.5, 0.6, 0.1);
      const signMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.5
      });
      const sign = new THREE.Mesh(signGeometry, signMaterial);
      sign.position.set(-10, i + 2.5, 0);
      sign.castShadow = true;
      scene.add(sign);
    }

    // Animation variables - NOW PERSISTENT
    let characterAltitude = 0;
    const maxAltitude = 88;
    const speed = 0.4;

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      // Update character position based on joystick - FIXED: Position stays!
      if (joystickActive.up && characterAltitude < maxAltitude) {
        characterAltitude += speed;
      } else if (joystickActive.down && characterAltitude > 0) {
        characterAltitude -= speed;
      }
      // NO RESET - Position maintains!

      characterAltitude = Math.max(0, Math.min(maxAltitude, characterAltitude));
      
      characterGroup.position.y = characterAltitude;
      camera.position.y = characterAltitude + 5;
      camera.lookAt(0, characterAltitude + 3, 0);

      // Update stats
      setAltitude(Math.round(characterAltitude * 100));
      const oxygenPercent = Math.max(30, 100 - (characterAltitude / maxAltitude) * 70);
      setOxygenLevel(Math.round(oxygenPercent));
      const temp = 25 - (characterAltitude / maxAltitude) * 50;
      setTemperature(Math.round(temp));

      // Animate clouds realistically
      clouds.forEach((cloud, index) => {
        cloud.position.x += 0.015 * (1 + index * 0.05);
        if (cloud.position.x > 150) cloud.position.x = -150;
        cloud.rotation.y += 0.0005;
      });

      // Subtle character animation
      head.rotation.y = Math.sin(Date.now() * 0.001) * 0.1;
      leftArm.rotation.z = 0.3 + Math.sin(Date.now() * 0.002) * 0.1;
      rightArm.rotation.z = -0.3 - Math.sin(Date.now() * 0.002) * 0.1;

      renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [joystickActive]);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <div ref={mountRef} />
      
      {/* Stats Panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
        padding: '25px',
        borderRadius: '15px',
        fontFamily: 'Arial, sans-serif',
        minWidth: '220px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h2 style={{ margin: '0 0 15px 0', fontSize: '24px', borderBottom: '2px solid #4CAF50', paddingBottom: '10px' }}>
          📊 Statistics
        </h2>
        <div style={{ fontSize: '18px', lineHeight: '2.2' }}>
          <div>
            <strong>🏔️ Altitude:</strong> {altitude}m
          </div>
          <div style={{ color: oxygenLevel < 60 ? '#ff4444' : '#4CAF50' }}>
            <strong>💨 Oxygen:</strong> {oxygenLevel}%
          </div>
          <div style={{ color: temperature < 0 ? '#00bfff' : '#ff8c00' }}>
            <strong>🌡️ Temp:</strong> {temperature}°C
          </div>
        </div>
        <div style={{ marginTop: '15px', fontSize: '12px', color: '#aaa', borderTop: '1px solid #444', paddingTop: '10px' }}>
          Max Height: 8,800m (Mt. Everest)
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
        padding: '20px',
        borderRadius: '12px',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '280px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '20px' }}>🎮 Controls</h3>
        <p style={{ margin: '5px 0', fontSize: '15px', lineHeight: '1.6' }}>
          Use joystick buttons to move up/down the mountain. Position is maintained!
        </p>
      </div>

      {/* Joystick Controls */}
      <div style={{
        position: 'absolute',
        bottom: '50px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        alignItems: 'center'
      }}>
        <button
          onMouseDown={() => setJoystickActive({ ...joystickActive, up: true })}
          onMouseUp={() => setJoystickActive({ ...joystickActive, up: false })}
          onMouseLeave={() => setJoystickActive({ ...joystickActive, up: false })}
          onTouchStart={() => setJoystickActive({ ...joystickActive, up: true })}
          onTouchEnd={() => setJoystickActive({ ...joystickActive, up: false })}
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            border: 'none',
            background: joystickActive.up 
              ? 'linear-gradient(145deg, #5a6fd8 0%, #6540a0 100%)' 
              : 'linear-gradient(145deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '40px',
            cursor: 'pointer',
            boxShadow: joystickActive.up 
              ? '0 2px 10px rgba(0,0,0,0.4)' 
              : '0 6px 20px rgba(0,0,0,0.4)',
            transition: 'all 0.1s',
            userSelect: 'none',
            transform: joystickActive.up ? 'scale(0.95)' : 'scale(1)'
          }}
        >
          ⬆️
        </button>
        <button
          onMouseDown={() => setJoystickActive({ ...joystickActive, down: true })}
          onMouseUp={() => setJoystickActive({ ...joystickActive, down: false })}
          onMouseLeave={() => setJoystickActive({ ...joystickActive, down: false })}
          onTouchStart={() => setJoystickActive({ ...joystickActive, down: true })}
          onTouchEnd={() => setJoystickActive({ ...joystickActive, down: false })}
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            border: 'none',
            background: joystickActive.down 
              ? 'linear-gradient(145deg, #e081e8 0%, #d4455a 100%)' 
              : 'linear-gradient(145deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            fontSize: '40px',
            cursor: 'pointer',
            boxShadow: joystickActive.down 
              ? '0 2px 10px rgba(0,0,0,0.4)' 
              : '0 6px 20px rgba(0,0,0,0.4)',
            transition: 'all 0.1s',
            userSelect: 'none',
            transform: joystickActive.down ? 'scale(0.95)' : 'scale(1)'
          }}
        >
          ⬇️
        </button>
      </div>
    </div>
  );
          }

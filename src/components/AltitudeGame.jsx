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
    scene.fog = new THREE.Fog(0x87ceeb, 50, 500);

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 5, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(50, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    scene.add(sunLight);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x228b22,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Mountain
    const mountainGeometry = new THREE.ConeGeometry(30, 100, 8);
    const mountainMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8b7355,
      roughness: 0.9,
      metalness: 0.1
    });
    const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
    mountain.position.set(0, 50, -50);
    mountain.castShadow = true;
    mountain.receiveShadow = true;
    scene.add(mountain);

    // Snow cap
    const snowCapGeometry = new THREE.ConeGeometry(15, 30, 8);
    const snowMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.1
    });
    const snowCap = new THREE.Mesh(snowCapGeometry, snowMaterial);
    snowCap.position.set(0, 85, -50);
    scene.add(snowCap);

    // Character (simple sphere with body)
    const characterGroup = new THREE.Group();
    
    const headGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const characterMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff6b6b,
      roughness: 0.5,
      metalness: 0.3
    });
    const head = new THREE.Mesh(headGeometry, characterMaterial);
    head.position.y = 1.5;
    head.castShadow = true;
    characterGroup.add(head);

    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1.5, 32);
    const body = new THREE.Mesh(bodyGeometry, characterMaterial);
    body.position.y = 0.5;
    body.castShadow = true;
    characterGroup.add(body);

    characterGroup.position.set(0, 0, 5);
    scene.add(characterGroup);

    // Clouds
    const clouds = [];
    const cloudMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      roughness: 1
    });

    for (let i = 0; i < 15; i++) {
      const cloudGroup = new THREE.Group();
      for (let j = 0; j < 5; j++) {
        const cloudGeometry = new THREE.SphereGeometry(Math.random() * 3 + 2, 16, 16);
        const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloudPart.position.set(
          Math.random() * 8 - 4,
          Math.random() * 2,
          Math.random() * 8 - 4
        );
        cloudGroup.add(cloudPart);
      }
      cloudGroup.position.set(
        Math.random() * 150 - 75,
        Math.random() * 60 + 20,
        Math.random() * 150 - 75
      );
      clouds.push(cloudGroup);
      scene.add(cloudGroup);
    }

    // Altitude markers
    const markers = [];
    for (let i = 0; i <= 88; i += 10) {
      const markerGeometry = new THREE.BoxGeometry(0.2, 2, 0.2);
      const markerMaterial = new THREE.MeshStandardMaterial({ 
        color: i > 50 ? 0xff0000 : 0x00ff00 
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(-8, i, 0);
      markers.push(marker);
      scene.add(marker);
    }

    // Animation variables
    let characterAltitude = 0;
    let velocity = 0;
    const maxAltitude = 88;
    const speed = 0.3;

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      // Update character position based on joystick
      if (joystickActive.up && characterAltitude < maxAltitude) {
        velocity = speed;
      } else if (joystickActive.down && characterAltitude > 0) {
        velocity = -speed;
      } else {
        velocity *= 0.9;
      }

      characterAltitude += velocity;
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

      // Animate clouds
      clouds.forEach((cloud, index) => {
        cloud.position.x += 0.02 * (1 + index * 0.1);
        if (cloud.position.x > 100) cloud.position.x = -100;
        cloud.rotation.y += 0.001;
      });

      // Character animation
      head.rotation.y += 0.02;
      body.rotation.y = Math.sin(Date.now() * 0.001) * 0.1;

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
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '20px',
        borderRadius: '15px',
        fontFamily: 'Arial, sans-serif',
        minWidth: '200px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}>
        <h2 style={{ margin: '0 0 15px 0', fontSize: '24px', borderBottom: '2px solid #4CAF50', paddingBottom: '10px' }}>
          📊 Statistics
        </h2>
        <div style={{ fontSize: '18px', lineHeight: '2' }}>
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
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '250px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>🎮 Controls</h3>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>Use joystick buttons below to move up/down</p>
      </div>

      {/* Joystick Controls */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignItems: 'center'
      }}>
        <button
          onMouseDown={() => setJoystickActive({ ...joystickActive, up: true })}
          onMouseUp={() => setJoystickActive({ ...joystickActive, up: false })}
          onTouchStart={() => setJoystickActive({ ...joystickActive, up: true })}
          onTouchEnd={() => setJoystickActive({ ...joystickActive, up: false })}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: 'none',
            background: 'linear-gradient(145deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '36px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            transition: 'all 0.1s',
            userSelect: 'none'
          }}
        >
          ⬆️
        </button>
        <button
          onMouseDown={() => setJoystickActive({ ...joystickActive, down: true })}
          onMouseUp={() => setJoystickActive({ ...joystickActive, down: false })}
          onTouchStart={() => setJoystickActive({ ...joystickActive, down: true })}
          onTouchEnd={() => setJoystickActive({ ...joystickActive, down: false })}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: 'none',
            background: 'linear-gradient(145deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            fontSize: '36px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            transition: 'all 0.1s',
            userSelect: 'none'
          }}
        >
          ⬇️
        </button>
      </div>
    </div>
  );
        }

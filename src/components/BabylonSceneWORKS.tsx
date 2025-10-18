// import { useEffect, useRef, useState, useMemo } from 'react';
// import { Engine, Scene, FreeCamera, Vector3, PhotoDome, Quaternion, Tools, TransformNode, MeshBuilder, StandardMaterial, Color3, Animation } from '@babylonjs/core';
// import panoramaImage from '../assets/panorama.jpg';
// import image1 from '../assets/placeholder.webp';
// import image2 from '../assets/placeholder.webp';
// import image3 from '../assets/placeholder.webp';

// interface BabylonSceneProps {
//   rotationTrigger: number;
//   direction: 'left' | 'right' | null;
//   permissionsGranted?: boolean;
//   onSceneLoaded?: () => void;
//   initialOrientation?: Quaternion | null;
// }

// interface PointOfInterest {
//   id: number;
//   title: string;
//   description: string;
//   imagePath: string;
//   position: Vector3;
// }

// const BabylonScene = ({ rotationTrigger: _rotationTrigger, direction: _direction, permissionsGranted = true, onSceneLoaded, initialOrientation = null }: BabylonSceneProps) => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const cameraRef = useRef<FreeCamera | null>(null);
//   const useGyroRef = useRef(true);
//   const [showModal, setShowModal] = useState(false);
//   const [isManualMode, setIsManualMode] = useState(false);
//   const [selectedPOI, setSelectedPOI] = useState<PointOfInterest | null>(null);
//   const [sceneLoaded, setSceneLoaded] = useState(false);

//   // Touch control refs
//   const isDraggingRef = useRef(false);
//   const previousTouchRef = useRef({ x: 0, y: 0 });

//   // Points of Interest data - memoized to prevent unnecessary re-renders
//   const pointsOfInterest: PointOfInterest[] = useMemo(() => [
//     {
//       id: 1,
//       title: "Point of Interest 1",
//       description: "This is the first point of interest. Add your description here.",
//       imagePath: image1,
//       position: new Vector3(0, 5, 60),
//     },
//     {
//       id: 2,
//       title: "Point of Interest 2",
//       description: "This is the second point of interest. Add your description here.",
//       imagePath: image2,
//       position: new Vector3(45, 0, 60),
//     },
//     {
//       id: 3,
//       title: "Point of Interest 3",
//       description: "This is the third point of interest. Add your description here.",
//       imagePath: image3,
//       position: new Vector3(-35, -5, 60),
//     },
//   ], []);

//   useEffect(() => {
//     if (!canvasRef.current) return;

//     const engine = new Engine(canvasRef.current, true);
//     const scene = new Scene(engine);

//     // Use FreeCamera with quaternion rotation
//     const camera = new FreeCamera('camera', new Vector3(0, 0, 0), scene);
//     // Set camera to look straight forward (not down at the ground)
//     // Using a quaternion that looks forward and level
//     camera.rotationQuaternion = new Quaternion();
//     // Apply a rotation to look forward instead of down
//     camera.rotationQuaternion = Quaternion.RotationYawPitchRoll(0, 0, 0);

//     cameraRef.current = camera;

//     // Quaternion averaging setup
//     const N = 100;
//     const oldCoordinates: number[][] = [];
//     const timestamps: number[] = [];
//     const noiseQuaternions: Quaternion[] = [];
    
//     for (let i = 0; i < N; i++) {
//       oldCoordinates[i] = [0, 0, 0, 0];
//       timestamps[i] = 0;
//       noiseQuaternions[i] = new Quaternion(0, 0, 0, 0);
//     }

//     let intervalTime = 600;

//     // Matrix math functions for quaternion averaging
//     const transpose = (matrix: number[][]) => {
//       return matrix[0].map((_, i) => matrix.map(row => row[i]));
//     };

//     const multiply = (a: number[][], b: number[][]) => {
//       const aNumRows = a.length;
//       const aNumCols = a[0].length;
//       const bNumCols = b[0].length;
//       const m: number[][] = new Array(aNumRows);
      
//       for (let r = 0; r < aNumRows; ++r) {
//         m[r] = new Array(bNumCols);
//         for (let c = 0; c < bNumCols; ++c) {
//           m[r][c] = 0;
//           for (let idx = 0; idx < aNumCols; ++idx) {
//             m[r][c] += a[r][idx] * b[idx][c];
//           }
//         }
//       }
//       return m;
//     };

//     const averageQuarts = (quartList: number[][]) => {
//       const Q = quartList;
//       let w = 1;
//       const Tau = 1.01;

//       for (let i = 0; i < Q[0].length; i++) {
//         Q[0][Q[0].length - i - 1] /= w;
//         Q[1][Q[0].length - i - 1] /= w;
//         Q[2][Q[0].length - i - 1] /= w;
//         Q[3][Q[0].length - i - 1] /= w;
//         w /= Tau;
//       }

//       const Qt = transpose(Q);
//       const QQt = multiply(Q, Qt);
      
//       // Power iteration
//       let vec = [1, 0, 0, 0];
//       for (let iter = 0; iter < 100; iter++) {
//         const newVec = [0, 0, 0, 0];
//         for (let i = 0; i < 4; i++) {
//           for (let j = 0; j < 4; j++) {
//             newVec[i] += QQt[i][j] * vec[j];
//           }
//         }
//         const norm = Math.sqrt(newVec.reduce((sum, val) => sum + val * val, 0));
//         vec = newVec.map(v => v / norm);
//       }

//       return new Quaternion(vec[0], vec[1], vec[2], vec[3]);
//     };

//     // Create pivot node like legacy code
//     const pivotIOS = new TransformNode("root", scene);
//     pivotIOS.position = new Vector3(0, 0, 0);
//     const axis = new Vector3(0, 1, 0);

//     // Create panorama dome
//     const dome = new PhotoDome(
//       'photoDome',
//       panoramaImage,
//       {
//         resolution: 32,
//         size: 200,
//       },
//       scene
//     );

//     // Set initial rotation EXACTLY like legacy code
//     dome.rotationQuaternion = null;
//     dome.rotation.y = Math.PI;
//     dome.parent = pivotIOS;

//     dome.onReady = () => {
//       // Apply initial rotation
//       pivotIOS.rotate(axis, Math.PI - 0.75, 1);

//       // Panorama is ready - scene loaded
//       setSceneLoaded(true);
//       if (onSceneLoaded) {
//         onSceneLoaded();
//       }
//       // Show POIs when scene is loaded
//       pointsOfInterest.forEach((poi) => {
//         const sphere = scene.getMeshByName(`poi_${poi.id}`);
//         if (sphere) {
//           sphere.isVisible = true;
//         }
//       });
//       // Notify parent that scene is loaded
//       setSceneLoaded(true);
//       if (onSceneLoaded) {
//         onSceneLoaded();
//       }
//     };

//     // Create Points of Interest (yellow pulsating dots)
//     pointsOfInterest.forEach((poi) => {
//       const sphere = MeshBuilder.CreateSphere(
//         `poi_${poi.id}`,
//         { diameter: 2, segments: 16 },
//         scene
//       );
//       sphere.position = poi.position;
//       sphere.isVisible = false; // Hide until scene loads

//       // Create dark blue material
//       const material = new StandardMaterial(`poi_mat_${poi.id}`, scene);
//       material.emissiveColor = new Color3(0, 0, 0.5); // Dark blue
//       material.diffuseColor = new Color3(0, 0, 0.5);
//       sphere.material = material;

//       // Add pulsating animation (slower blink)
//       const scaleAnimation = new Animation(
//         `poi_scale_${poi.id}`,
//         'scaling',
//         30,
//         Animation.ANIMATIONTYPE_VECTOR3,
//         Animation.ANIMATIONLOOPMODE_CYCLE
//       );

//       const keyFrames = [
//         { frame: 0, value: new Vector3(1, 1, 1) },
//         { frame: 30, value: new Vector3(1.5, 1.5, 1.5) },
//         { frame: 60, value: new Vector3(1, 1, 1) },
//       ];

//       scaleAnimation.setKeys(keyFrames);
//       sphere.animations = [scaleAnimation];
//       scene.beginAnimation(sphere, 0, 60, true);

//       // Make clickable
//       sphere.isPickable = true;
//       sphere.metadata = { poi };
//     });

//     // Handle clicks on POIs
//     scene.onPointerDown = (_evt, pickResult) => {
//       if (pickResult.hit && pickResult.pickedMesh?.metadata?.poi) {
//         const poi = pickResult.pickedMesh.metadata.poi;
//         // Use setTimeout to ensure the click event finishes before opening modal
//         setTimeout(() => {
//           setSelectedPOI(poi);
//         }, 0);
//       }
//     };

//     // Quaternion for screen orientation
//     let screenQuaternion = new Quaternion();
//     let constantTransform = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
//     let averagedQuaternion = new Quaternion(0, 0, 0, 0);

//     // Capture baseline orientation on first frame so panorama starts at fixed position
//     let baselineQuaternion: Quaternion | null = null;

//     // Handle device orientation with averaging
//     const handleOrientation = (event: DeviceOrientationEvent) => {
//       if (!useGyroRef.current || !cameraRef.current) return;

//       const alpha = event.alpha;
//       const beta = event.beta;
//       const gamma = event.gamma;
//       const timeStamp = event.timeStamp || Date.now();

//       if (alpha === null || beta === null || gamma === null) return;

//       // Shift arrays
//       for (let i = N - 1; i > 0; i--) {
//         oldCoordinates[i] = oldCoordinates[i - 1];
//         timestamps[i] = timestamps[i - 1];
//         noiseQuaternions[i] = noiseQuaternions[i - 1];
//       }

//       // Get screen orientation angle
//       const screenOrientationAngle = window.orientation !== undefined
//         ? +(window.orientation)
//         : 0;
//       const screenAngleRad = -Tools.ToRadians(screenOrientationAngle / 2);
//       screenQuaternion.copyFromFloats(
//         0,
//         Math.sin(screenAngleRad),
//         0,
//         Math.cos(screenAngleRad)
//       );

//       // Create quaternion from device orientation angles
//       const quaternionCamera = Quaternion.RotationYawPitchRoll(
//         Tools.ToRadians(alpha),
//         Tools.ToRadians(beta),
//         -Tools.ToRadians(gamma)
//       );

//       oldCoordinates[0] = [quaternionCamera.x, quaternionCamera.y, quaternionCamera.z, quaternionCamera.w];
//       timestamps[0] = timeStamp;

//       // Collect coordinates to average
//       const coordsToAverage: number[][] = [];
//       for (let i = 0; i < N; i++) {
//         if (Math.abs(timestamps[i] - timestamps[0]) < intervalTime) {
//           coordsToAverage.push(oldCoordinates[i]);
//         }
//       }

//       // Average the quaternions
//       if (coordsToAverage.length > 0) {
//         averagedQuaternion = averageQuarts(transpose(coordsToAverage));
//         noiseQuaternions[0] = averagedQuaternion;
//       }

//       // Calculate RMS for adaptive smoothing and stillness detection
//       const xNoise: number[] = [];
//       const yNoise: number[] = [];
//       const zNoise: number[] = [];
//       const wNoise: number[] = [];
//       let xMean = 0, yMean = 0, zMean = 0, wMean = 0;

//       for (let i = 1; i < N; i++) {
//         if (Math.abs(timestamps[i] - timestamps[0]) < 500) {
//           xNoise.push(noiseQuaternions[i].x);
//           xMean += noiseQuaternions[i].x;
//           yNoise.push(noiseQuaternions[i].y);
//           yMean += noiseQuaternions[i].y;
//           zNoise.push(noiseQuaternions[i].z);
//           zMean += noiseQuaternions[i].z;
//           wNoise.push(noiseQuaternions[i].w);
//           wMean += noiseQuaternions[i].w;
//         }
//       }

//       let speed = 0;
//       let RMS = 0;

//       if (xNoise.length > 0) {
//         xMean /= xNoise.length;
//         yMean /= yNoise.length;
//         zMean /= zNoise.length;
//         wMean /= wNoise.length;

//         const calculateRMS = (arr: number[]) => {
//           const squares = arr.map(val => val * val);
//           const sum = squares.reduce((acum, val) => acum + val, 0);
//           const mean = sum / arr.length;
//           return Math.sqrt(mean);
//         };

//         const xNoiseMean = xNoise.map(element => element - xMean);
//         const yNoiseMean = yNoise.map(element => element - yMean);
//         const zNoiseMean = zNoise.map(element => element - zMean);
//         const wNoiseMean = wNoise.map(element => element - wMean);

//         const RMSx = calculateRMS(xNoiseMean);
//         const RMSy = calculateRMS(yNoiseMean);
//         const RMSz = calculateRMS(zNoiseMean);
//         const RMSw = calculateRMS(wNoiseMean);

//         speed = Math.abs(xNoise[0] - xNoise[xNoise.length - 1]) +
//                      Math.abs(yNoise[0] - yNoise[yNoise.length - 1]) +
//                      Math.abs(zNoise[0] - zNoise[zNoise.length - 1]) +
//                      Math.abs(wNoise[0] - wNoise[wNoise.length - 1]);

//         RMS = 0.25 * (RMSx + RMSy + RMSz + RMSw);

//         // Adaptive interval adjustment
//         if (RMS > 0.0005 && speed < 0.02) {
//           intervalTime += 10;
//         } else if (speed < 0.02) {
//           intervalTime -= 2;
//         }
//         if (speed > 0.05) {
//           intervalTime -= 2;
//         }

//         intervalTime = Math.max(500, Math.min(2000, intervalTime));
//       }

//       // Apply transformations (no stillness detection to avoid glitching)
//       const finalQuaternion = averagedQuaternion.normalize();
//       finalQuaternion.multiplyInPlace(screenQuaternion);
//       finalQuaternion.multiplyInPlace(constantTransform);
//       finalQuaternion.z *= -1;
//       finalQuaternion.w *= -1;

//       // Capture baseline on first orientation event
//       // This ensures panorama starts at same position for all users regardless of compass direction
//       if (baselineQuaternion === null) {
//         baselineQuaternion = finalQuaternion.clone();
//         // Set camera to identity (looking straight at panorama starting point)
//         camera.rotationQuaternion = Quaternion.Identity();
//         return;
//       }

//       // Calculate delta rotation: how much has device rotated since baseline
//       const baselineInverse = baselineQuaternion.clone().invert();
//       const deltaRotation = finalQuaternion.multiply(baselineInverse);

//       // Apply only the delta rotation to camera
//       // This makes panorama start at fixed position, with only relative movements tracked
//       camera.rotationQuaternion = deltaRotation;
//     };

//     // Add event listeners - permissions already handled by parent component
//     // Use deviceorientation (relative gyroscope, NOT compass) so phone direction = panorama direction
//     if (typeof DeviceOrientationEvent !== 'undefined' && permissionsGranted) {
//       console.log('Using deviceorientation (relative gyroscope only - no compass)');
//       window.addEventListener('deviceorientation', handleOrientation, true);
//     }

//     // Render loop
//     engine.runRenderLoop(() => {
//       scene.render();
//     });

//     // Touch/Mouse controls for manual mode
//     const handlePointerDown = (event: PointerEvent) => {
//       if (!isManualMode || !canvasRef.current) return;
//       isDraggingRef.current = true;
//       previousTouchRef.current = { x: event.clientX, y: event.clientY };
//       canvasRef.current.setPointerCapture(event.pointerId);
//     };

//     const handlePointerMove = (event: PointerEvent) => {
//       if (!isDraggingRef.current || !isManualMode || !cameraRef.current) return;

//       const deltaX = event.clientX - previousTouchRef.current.x;
//       const deltaY = event.clientY - previousTouchRef.current.y;

//       previousTouchRef.current = { x: event.clientX, y: event.clientY };

//       // Apply rotation to camera - yaw (left/right) and pitch (up/down) only, no roll
//       const camera = cameraRef.current;
//       const sensitivity = 0.003;

//       if (camera.rotationQuaternion) {
//         // Left/right rotation around world up axis
//         const yawQuat = Quaternion.RotationAxis(Vector3.Up(), -deltaX * sensitivity);

//         // Up/down rotation around camera's local right axis
//         const currentRight = camera.getDirection(Vector3.Right());
//         const pitchQuat = Quaternion.RotationAxis(currentRight, -deltaY * sensitivity);

//         // Apply rotations
//         camera.rotationQuaternion = yawQuat.multiply(camera.rotationQuaternion);
//         camera.rotationQuaternion = pitchQuat.multiply(camera.rotationQuaternion);

//         // Normalize to prevent drift
//         camera.rotationQuaternion.normalize();
//       }
//     };

//     const handlePointerUp = (event: PointerEvent) => {
//       if (!canvasRef.current) return;
//       isDraggingRef.current = false;
//       canvasRef.current.releasePointerCapture(event.pointerId);
//     };

//     // Add pointer event listeners
//     if (canvasRef.current) {
//       canvasRef.current.addEventListener('pointerdown', handlePointerDown);
//       canvasRef.current.addEventListener('pointermove', handlePointerMove);
//       canvasRef.current.addEventListener('pointerup', handlePointerUp);
//       canvasRef.current.addEventListener('pointercancel', handlePointerUp);
//     }

//     // Handle resize
//     const handleResize = () => {
//       engine.resize();
//     };
//     window.addEventListener('resize', handleResize);

//     // Cleanup
//     return () => {
//       window.removeEventListener('resize', handleResize);
//       window.removeEventListener('deviceorientation', handleOrientation, true);
//       if (canvasRef.current) {
//         canvasRef.current.removeEventListener('pointerdown', handlePointerDown);
//         canvasRef.current.removeEventListener('pointermove', handlePointerMove);
//         canvasRef.current.removeEventListener('pointerup', handlePointerUp);
//         canvasRef.current.removeEventListener('pointercancel', handlePointerUp);
//       }
//       scene.dispose();
//       engine.dispose();
//     };
//   }, [permissionsGranted, isManualMode, initialOrientation, onSceneLoaded, pointsOfInterest]);

//   const handleToggleMode = () => {
//     if (isManualMode) {
//       // Re-enable gyroscope
//       setIsManualMode(false);
//       useGyroRef.current = true;
//       setShowModal(false);
//     } else {
//       // Show modal to confirm switch to manual
//       setShowModal(true);
//     }
//   };

//   const handleManualMode = () => {
//     setIsManualMode(true);
//     useGyroRef.current = false;
//     setShowModal(false);
//   };

//   return (
//     <div style={{ width: '100%', height: '100%', position: 'relative' }}>
//       <canvas
//         ref={canvasRef}
//         className="w-full h-full block m-0 p-0"
//         style={{ width: '100%', height: '100%', display: 'block', position: 'absolute', top: 0, left: 0 }}
//       />

//       {/* Toggle Button - only show when scene is loaded */}
//       {sceneLoaded && (
//         <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 9999, pointerEvents: 'auto' }}>
//           <button
//             onClick={handleToggleMode}
//             style={{
//               padding: '12px 20px',
//               backgroundColor: isManualMode ? '#4CAF50' : '#FF0000',
//               color: 'white',
//               border: '3px solid white',
//               borderRadius: '8px',
//               fontSize: '16px',
//               fontWeight: 'bold',
//               cursor: 'pointer',
//               boxShadow: '0 4px 12px rgba(0,0,0,0.8)',
//               pointerEvents: 'auto',
//             }}
//           >
//             {isManualMode ? 'Enable Gyro' : 'Control Mode'}
//           </button>
//         </div>
//       )}

//       {/* Control Mode Modal */}
//       {showModal && (
//         <div
//           style={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             backgroundColor: 'rgba(0, 0, 0, 0.7)',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             zIndex: 10000,
//             pointerEvents: 'auto',
//           }}
//         >
//           <div
//             style={{
//               backgroundColor: 'white',
//               borderRadius: '12px',
//               padding: '30px',
//               maxWidth: '400px',
//               width: '90%',
//               boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
//             }}
//           >
//             <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#333' }}>
//               Switch to Manual Control?
//             </h2>
//             <p style={{ margin: '0 0 30px 0', color: '#666', lineHeight: '1.5' }}>
//               This will disable gyroscope and allow you to look around by touching and dragging the screen.
//             </p>
//             <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
//               <button
//                 onClick={() => setShowModal(false)}
//                 style={{
//                   padding: '10px 24px',
//                   backgroundColor: '#f0f0f0',
//                   color: '#333',
//                   border: 'none',
//                   borderRadius: '6px',
//                   fontSize: '14px',
//                   fontWeight: '500',
//                   cursor: 'pointer',
//                 }}
//               >
//                 Go Back
//               </button>
//               <button
//                 onClick={handleManualMode}
//                 style={{
//                   padding: '10px 24px',
//                   backgroundColor: '#2196F3',
//                   color: 'white',
//                   border: 'none',
//                   borderRadius: '6px',
//                   fontSize: '14px',
//                   fontWeight: '500',
//                   cursor: 'pointer',
//                 }}
//               >
//                 Manual
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Point of Interest Modal */}
//       {selectedPOI && (
//         <div
//           style={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             backgroundColor: 'rgba(0, 0, 0, 0.8)',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             zIndex: 10001,
//             pointerEvents: 'auto',
//           }}
//           onClick={() => setSelectedPOI(null)}
//         >
//           <div
//             style={{
//               backgroundColor: 'white',
//               borderRadius: '16px',
//               padding: '0',
//               maxWidth: '500px',
//               width: '90%',
//               maxHeight: '80vh',
//               overflow: 'auto',
//               boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
//               position: 'relative',
//             }}
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Close button */}
//             <button
//               onClick={() => setSelectedPOI(null)}
//               style={{
//                 position: 'absolute',
//                 top: '15px',
//                 right: '15px',
//                 backgroundColor: 'rgba(0, 0, 0, 0.6)',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '50%',
//                 width: '35px',
//                 height: '35px',
//                 fontSize: '20px',
//                 cursor: 'pointer',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 zIndex: 1,
//               }}
//             >
//               ×
//             </button>

//             {/* Image */}
//             <img
//               src={selectedPOI.imagePath}
//               alt={selectedPOI.title}
//               style={{
//                 width: '100%',
//                 height: 'auto',
//                 maxHeight: '400px',
//                 objectFit: 'contain',
//                 borderTopLeftRadius: '16px',
//                 borderTopRightRadius: '16px',
//                 backgroundColor: '#f0f0f0',
//               }}
//               onError={(e) => {
//                 (e.target as HTMLImageElement).style.display = 'none';
//               }}
//             />

//             {/* Content */}
//             <div style={{ padding: '25px' }}>
//               <h2 style={{ margin: '0 0 15px 0', fontSize: '24px', color: '#333' }}>
//                 {selectedPOI.title}
//               </h2>
//               <p style={{ margin: '0', color: '#666', lineHeight: '1.6', fontSize: '16px' }}>
//                 {selectedPOI.description}
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BabylonScene;
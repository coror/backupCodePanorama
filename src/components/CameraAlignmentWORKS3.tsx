// import { useEffect, useRef, useState } from 'react';
// import { Quaternion, Tools } from '@babylonjs/core';

// interface CameraAlignmentProps {
//   onAlignmentConfirmed: (orientation: { quaternion: Quaternion; deviceOrientation: { alpha: number; beta: number; gamma: number } }) => void;
//   onSkip?: () => void;
// }

// const CameraAlignment = ({ onAlignmentConfirmed, onSkip }: CameraAlignmentProps) => {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const [stream, setStream] = useState<MediaStream | null>(null);
//   const [currentOrientation, setCurrentOrientation] = useState<{ alpha: number; beta: number; gamma: number } | null>(null);
//   const [cameraError, setCameraError] = useState<string | null>(null);

//   // Initialize camera
//   useEffect(() => {
//     const startCamera = async () => {
//       try {
//         // Request back camera with high resolution
//         const mediaStream = await navigator.mediaDevices.getUserMedia({
//           video: {
//             facingMode: 'environment', // Use back camera
//             width: { ideal: 1920 },
//             height: { ideal: 1080 }
//           },
//           audio: false
//         });

//         setStream(mediaStream);

//         if (videoRef.current) {
//           videoRef.current.srcObject = mediaStream;
//         }
//       } catch (error) {
//         console.error('Error accessing camera:', error);
//         setCameraError('Unable to access camera. Please grant camera permissions.');
//       }
//     };

//     startCamera();

//     return () => {
//       // Cleanup camera stream
//       if (stream) {
//         stream.getTracks().forEach(track => track.stop());
//       }
//     };
//   }, []);

//   // Track device orientation
//   useEffect(() => {
//     const handleOrientation = (event: DeviceOrientationEvent) => {
//       const alpha = event.alpha;
//       const beta = event.beta;
//       const gamma = event.gamma;

//       if (alpha !== null && beta !== null && gamma !== null) {
//         setCurrentOrientation({ alpha, beta, gamma });
//       }
//     };

//     // Listen for device orientation (relative gyroscope, not compass)
//     window.addEventListener('deviceorientation', handleOrientation, true);

//     return () => {
//       window.removeEventListener('deviceorientation', handleOrientation, true);
//     };
//   }, []);

//   const handleConfirm = () => {
//     if (!currentOrientation) {
//       alert('Waiting for device orientation data...');
//       return;
//     }

//     // Convert current orientation to quaternion
//     const { alpha, beta, gamma } = currentOrientation;

//     // Get screen orientation - use modern API for consistency across iOS/Android
//     let screenOrientationAngle = 0;
//     if (screen.orientation && screen.orientation.angle !== undefined) {
//       screenOrientationAngle = screen.orientation.angle;
//     } else if (window.orientation !== undefined) {
//       screenOrientationAngle = +(window.orientation);
//     }
//     const screenAngleRad = -Tools.ToRadians(screenOrientationAngle / 2);
//     const screenQuaternion = new Quaternion(
//       0,
//       Math.sin(screenAngleRad),
//       0,
//       Math.cos(screenAngleRad)
//     );

//     // Create quaternion from device orientation
//     const deviceQuaternion = Quaternion.RotationYawPitchRoll(
//       Tools.ToRadians(alpha),
//       Tools.ToRadians(beta),
//       -Tools.ToRadians(gamma)
//     );

//     // Apply transformations (same as in BabylonScene)
//     const constantTransform = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
//     const finalQuaternion = deviceQuaternion.normalize();
//     finalQuaternion.multiplyInPlace(screenQuaternion);
//     finalQuaternion.multiplyInPlace(constantTransform);
//     finalQuaternion.z *= -1;
//     finalQuaternion.w *= -1;

//     // Stop camera stream before transitioning
//     if (stream) {
//       stream.getTracks().forEach(track => track.stop());
//     }

//     // Pass orientation data to parent
//     onAlignmentConfirmed({
//       quaternion: finalQuaternion,
//       deviceOrientation: currentOrientation
//     });
//   };

//   const handleSkipAlignment = () => {
//     // Stop camera stream
//     if (stream) {
//       stream.getTracks().forEach(track => track.stop());
//     }

//     if (onSkip) {
//       onSkip();
//     }
//   };

//   return (
//     <div style={{
//       position: 'fixed',
//       inset: 0,
//       width: '100%',
//       height: '100%',
//       backgroundColor: '#000',
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       justifyContent: 'center'
//     }}>
//       {/* Camera Video */}
//       <video
//         ref={videoRef}
//         autoPlay
//         playsInline
//         muted
//         style={{
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           width: '100%',
//           height: '100%',
//           objectFit: 'cover',
//           zIndex: 1
//         }}
//       />

//       {/* Overlay Guide - Circle (will be replaced with building shape later) */}
//       <div style={{
//         position: 'absolute',
//         top: '50%',
//         left: '50%',
//         transform: 'translate(-50%, -50%)',
//         zIndex: 2,
//         pointerEvents: 'none'
//       }}>
//         <svg width="250" height="250" viewBox="0 0 250 250">
//           {/* Outer circle with dashed stroke */}
//           <circle
//             cx="125"
//             cy="125"
//             r="100"
//             fill="none"
//             stroke="rgba(255, 255, 255, 0.8)"
//             strokeWidth="3"
//             strokeDasharray="10 5"
//           />
//           {/* Inner circle */}
//           <circle
//             cx="125"
//             cy="125"
//             r="90"
//             fill="none"
//             stroke="rgba(255, 255, 255, 0.4)"
//             strokeWidth="2"
//           />
//           {/* Center crosshair */}
//           <line x1="125" y1="100" x2="125" y2="150" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="2" />
//           <line x1="100" y1="125" x2="150" y2="125" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="2" />
//           {/* Center dot */}
//           <circle
//             cx="125"
//             cy="125"
//             r="5"
//             fill="rgba(255, 255, 255, 0.9)"
//           />
//         </svg>
//       </div>

//       {/* Instruction Text */}
//       <div style={{
//         position: 'absolute',
//         top: '80px',
//         left: '50%',
//         transform: 'translateX(-50%)',
//         zIndex: 3,
//         backgroundColor: 'rgba(0, 0, 0, 0.7)',
//         padding: '15px 25px',
//         borderRadius: '12px',
//         maxWidth: '80%',
//         textAlign: 'center'
//       }}>
//         <p style={{
//           color: 'white',
//           fontSize: '16px',
//           fontWeight: '600',
//           margin: 0,
//           lineHeight: '1.4'
//         }}>
//           Align the circle with your landmark, then tap "Confirm"
//         </p>
//       </div>

//       {/* Error Message */}
//       {cameraError && (
//         <div style={{
//           position: 'absolute',
//           top: '50%',
//           left: '50%',
//           transform: 'translate(-50%, -50%)',
//           zIndex: 3,
//           backgroundColor: 'rgba(255, 0, 0, 0.9)',
//           padding: '20px 30px',
//           borderRadius: '12px',
//           maxWidth: '80%',
//           textAlign: 'center'
//         }}>
//           <p style={{
//             color: 'white',
//             fontSize: '16px',
//             margin: 0
//           }}>
//             {cameraError}
//           </p>
//         </div>
//       )}

//       {/* Control Buttons */}
//       <div style={{
//         position: 'absolute',
//         bottom: '50px',
//         left: '50%',
//         transform: 'translateX(-50%)',
//         zIndex: 3,
//         display: 'flex',
//         gap: '15px',
//         flexDirection: 'column',
//         alignItems: 'center'
//       }}>
//         {/* Confirm Button */}
//         <button
//           onClick={handleConfirm}
//           disabled={!currentOrientation || !!cameraError}
//           style={{
//             padding: '18px 50px',
//             backgroundColor: currentOrientation && !cameraError ? '#4CAF50' : '#666',
//             color: 'white',
//             border: '3px solid white',
//             borderRadius: '50px',
//             fontSize: '20px',
//             fontWeight: 'bold',
//             cursor: currentOrientation && !cameraError ? 'pointer' : 'not-allowed',
//             boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
//             minWidth: '200px',
//             transition: 'all 0.3s ease'
//           }}
//         >
//           Confirm Alignment
//         </button>

//         {/* Skip Button */}
//         {onSkip && (
//           <button
//             onClick={handleSkipAlignment}
//             style={{
//               padding: '12px 30px',
//               backgroundColor: 'transparent',
//               color: 'white',
//               border: '2px solid rgba(255, 255, 255, 0.6)',
//               borderRadius: '50px',
//               fontSize: '14px',
//               fontWeight: '500',
//               cursor: 'pointer',
//               boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
//               transition: 'all 0.3s ease'
//             }}
//           >
//             Skip Alignment
//           </button>
//         )}
//       </div>

//       {/* Orientation Debug Info (optional, can be removed in production) */}
//       {currentOrientation && (
//         <div style={{
//           position: 'absolute',
//           top: '150px',
//           left: '10px',
//           zIndex: 3,
//           backgroundColor: 'rgba(0, 0, 0, 0.6)',
//           padding: '10px',
//           borderRadius: '8px',
//           fontSize: '12px',
//           color: 'white',
//           fontFamily: 'monospace'
//         }}>
//           <div>α: {currentOrientation.alpha.toFixed(1)}°</div>
//           <div>β: {currentOrientation.beta.toFixed(1)}°</div>
//           <div>γ: {currentOrientation.gamma.toFixed(1)}°</div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CameraAlignment;

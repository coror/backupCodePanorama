// import { useState, useEffect, useCallback } from 'react';
// import BabylonScene from './components/BabylonScene';
// import CameraAlignment from './components/CameraAlignment';

// function App() {
//   const [rotationTrigger] = useState(0);
//   const [direction] = useState<'left' | 'right' | null>(null);
//   const [showPermissionButton, setShowPermissionButton] = useState(true);
//   const [isLoading, setIsLoading] = useState(true);
//   const [showCameraAlignment, setShowCameraAlignment] = useState(false);

//   useEffect(() => {
//     // Check if permission was previously granted
//     const permissionGranted = localStorage.getItem('gyroPermissionGranted');
//     if (permissionGranted === 'true') {
//       setShowPermissionButton(false);
//       setShowCameraAlignment(true); // Always show camera alignment, even if permission granted before
//     }
//   }, []);

//   const requestGyroPermission = async () => {
//     if (
//       typeof (DeviceOrientationEvent as any).requestPermission === 'function'
//     ) {
//       try {
//         const permission = await (
//           DeviceOrientationEvent as any
//         ).requestPermission();

//         // Check if DeviceMotionEvent also needs permission
//         if (
//           typeof (DeviceMotionEvent as any).requestPermission === 'function'
//         ) {
//           const permissionEvent = await (
//             DeviceMotionEvent as any
//           ).requestPermission();
//           if (permission === 'granted' && permissionEvent === 'granted') {
//             localStorage.setItem('gyroPermissionGranted', 'true');
//             setShowPermissionButton(false);
//             setShowCameraAlignment(true); // Show camera alignment
//           }
//         } else {
//           // No motion permission needed, just check orientation
//           if (permission === 'granted') {
//             localStorage.setItem('gyroPermissionGranted', 'true');
//             setShowPermissionButton(false);
//             setShowCameraAlignment(true); // Show camera alignment
//           }
//         }
//       } catch (error) {
//         console.log('Permission denied', error);
//       }
//     } else {
//       // Android and other devices don't need permission request
//       localStorage.setItem('gyroPermissionGranted', 'true');
//       setShowPermissionButton(false);
//       setShowCameraAlignment(true); // Show camera alignment
//     }
//   };

//   const handleAlignmentConfirmed = useCallback(() => {
//     // Don't use the orientation - just close alignment screen
//     // Camera alignment is only a visual guide, panorama starts at fixed position
//     setShowCameraAlignment(false);
//     // Loading will be handled by BabylonScene onSceneLoaded callback
//   }, []);

//   const handleSkipAlignment = useCallback(() => {
//     setShowCameraAlignment(false);
//     // Skip alignment, use default orientation (compass-based)
//   }, []);

//   const handleRequestCameraAlignment = useCallback(() => {
//     // Show camera alignment again when switching back from manual mode
//     setShowCameraAlignment(true);
//     setIsLoading(true); // Show loading while camera alignment is active
//   }, []);

//   return (
//     <div className='fixed inset-0 w-screen h-screen overflow-hidden m-0 p-0'>
//       {/* Gyroscope Permission Button (iOS) */}
//       {showPermissionButton && (
//         <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50'>
//           <button
//             onClick={requestGyroPermission}
//             style={{
//               padding: '12px 20px',
//               backgroundColor: '#4CAF50',
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
//             Start
//           </button>
//         </div>
//       )}

//       {/* Loading Indicator */}
//       {isLoading && !showPermissionButton && !showCameraAlignment && (
//         <div
//           style={{
//             position: 'absolute',
//             inset: 0,
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             justifyContent: 'center',
//             backgroundColor: 'rgba(0, 0, 0, 0.8)',
//             backdropFilter: 'blur(4px)',
//             zIndex: 50,
//           }}
//         >
//           {/* Spinner */}
//           <div style={{ position: 'relative', width: '64px', height: '64px', marginBottom: '16px' }}>
//             <div
//               style={{
//                 position: 'absolute',
//                 inset: 0,
//                 borderRadius: '50%',
//                 border: '4px solid #4b5563',
//               }}
//             ></div>
//             <div
//               style={{
//                 position: 'absolute',
//                 inset: 0,
//                 borderRadius: '50%',
//                 border: '4px solid #3b82f6',
//                 borderTopColor: 'transparent',
//                 animation: 'spin 1s linear infinite',
//               }}
//             ></div>
//           </div>

//           {/* Animated text */}
//           <div
//             style={{
//               color: 'white',
//               fontSize: '24px',
//               fontWeight: 600,
//               letterSpacing: '0.05em',
//               animation: 'pulse 2s ease-in-out infinite',
//             }}
//           >
//             Loading...
//           </div>
//         </div>
//       )}
//       <style>{`
//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
//         @keyframes pulse {
//           0%, 100% { opacity: 1; }
//           50% { opacity: 0.5; }
//         }
//       `}</style>


//       {/* Camera Alignment Screen */}
//       {showCameraAlignment && (
//         <CameraAlignment
//           onAlignmentConfirmed={handleAlignmentConfirmed}
//           onSkip={handleSkipAlignment}
//         />
//       )}

//       {/* Panorama Scene */}
//       {!showCameraAlignment && (
//         <BabylonScene
//           rotationTrigger={rotationTrigger}
//           direction={direction}
//           permissionsGranted={!showPermissionButton}
//           onSceneLoaded={() => setIsLoading(false)}
//           initialOrientation={null}
//           onRequestCameraAlignment={handleRequestCameraAlignment}
//         />
//       )}
//     </div>
//   );
// }

// export default App;

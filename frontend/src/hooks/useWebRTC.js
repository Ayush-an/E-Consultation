import { useRef, useState, useCallback, useEffect } from 'react';
import { io } from 'socket.io-client';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export function useWebRTC({ roomId, userId, role }) {
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionState, setConnectionState] = useState('new');
  const [messages, setMessages] = useState([
    { sender: 'system', text: 'Initializing secure connection...', timestamp: Date.now() }
  ]);
  const [remoteMicOn, setRemoteMicOn] = useState(true);
  const [remoteVideoOn, setRemoteVideoOn] = useState(true);

  // Initialize media
  const initMedia = useCallback(async () => {
    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      console.log('[WebRTC] HD Media stream obtained');
    } catch (err) {
      console.warn('[WebRTC] Primary media access failed, trying fallback:', err);
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        console.log('[WebRTC] Standard media stream obtained');
      } catch (e) {
        console.warn('[WebRTC] Video access failed, trying audio only:', e);
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log('[WebRTC] Audio-only stream obtained');
        } catch (fatal) {
          console.error('[WebRTC] No media access at all:', fatal);
        }
      }
    }

    if (stream) {
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    }
    return stream;
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback((targetSocketId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          roomId,
          candidate: event.candidate,
          to: targetSocketId
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('[WebRTC] Remote track received');
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setRemoteConnected(true);
    };

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', pc.connectionState);
      setConnectionState(pc.connectionState);
      if (pc.connectionState === 'connected') {
        setRemoteConnected(true);
        setMessages(prev => [...prev, { sender: 'system', text: 'Secure clinical connection established.', timestamp: Date.now() }]);
      }
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setRemoteConnected(false);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE state:', pc.iceConnectionState);
    };

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    peerRef.current = pc;
    return pc;
  }, [roomId]);

  // Initialize connection
  const initialize = useCallback(async () => {
    await initMedia();

    const socketUrl = window.location.hostname === 'localhost' 
      ? `http://${window.location.hostname}:5000` 
      : window.location.origin;

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      setIsConnected(true);
      socket.emit('join-room', { roomId, userId, role });
    });

    // When another user joins, we create offer
    socket.on('user-joined', async ({ socketId: remoteSocketId }) => {
      console.log('[Socket] User joined, creating offer...');
      const pc = createPeerConnection(remoteSocketId);
      
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { roomId, offer, to: remoteSocketId });
      } catch (err) {
        console.error('[WebRTC] Offer creation failed:', err);
      }
    });

    // When we already have participants
    socket.on('room-participants', async (participants) => {
      if (participants.length > 0) {
        console.log('[Socket] Existing participants found:', participants.length);
        // We wait for the existing user to send us an offer
      }
    });

    // Receive offer
    socket.on('offer', async ({ offer, from }) => {
      console.log('[Socket] Received offer from:', from);
      const pc = createPeerConnection(from);
      
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { roomId, answer, to: from });
      } catch (err) {
        console.error('[WebRTC] Answer creation failed:', err);
      }
    });

    // Receive answer
    socket.on('answer', async ({ answer }) => {
      console.log('[Socket] Received answer');
      try {
        if (peerRef.current && peerRef.current.signalingState !== 'stable') {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (err) {
        console.error('[WebRTC] Set remote description failed:', err);
      }
    });

    // ICE candidates
    socket.on('ice-candidate', async ({ candidate }) => {
      try {
        if (peerRef.current && candidate) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error('[WebRTC] Add ICE candidate failed:', err);
      }
    });

    // Chat messages
    socket.on('chat-message', ({ message, sender, senderName, timestamp }) => {
      setMessages(prev => [...prev, { sender, senderName, text: message, timestamp }]);
    });

    // Media toggle from remote
    socket.on('media-toggle', ({ type, enabled }) => {
      if (type === 'audio') setRemoteMicOn(enabled);
      if (type === 'video') setRemoteVideoOn(enabled);
    });

    // User disconnected
    socket.on('user-disconnected', () => {
      console.log('[Socket] Remote user disconnected');
      setRemoteConnected(false);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      setMessages(prev => [...prev, { sender: 'system', text: 'Remote participant disconnected.', timestamp: Date.now() }]);
    });

    // Call ended by other party
    socket.on('call-ended', () => {
      setRemoteConnected(false);
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      setMessages(prev => [...prev, { sender: 'system', text: 'Session ended by remote participant.', timestamp: Date.now() }]);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });
  }, [roomId, userId, role, initMedia, createPeerConnection]);

  // Toggle microphone
  const toggleMic = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicOn(audioTrack.enabled);
        socketRef.current?.emit('media-toggle', { roomId, type: 'audio', enabled: audioTrack.enabled });
      }
    }
  }, [roomId]);

  // Toggle camera
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoOn(videoTrack.enabled);
        socketRef.current?.emit('media-toggle', { roomId, type: 'video', enabled: videoTrack.enabled });
      }
    }
  }, [roomId]);

  // Screen sharing
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop screen share, restore camera
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
      }
      const videoTrack = localStreamRef.current?.getVideoTracks()[0];
      if (videoTrack && peerRef.current) {
        const sender = peerRef.current.getSenders().find(s => s.track?.kind === 'video');
        if (sender) await sender.replaceTrack(videoTrack);
      }
      setIsScreenSharing(false);
      socketRef.current?.emit('screen-share-stop', { roomId });
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];
        
        if (peerRef.current) {
          const sender = peerRef.current.getSenders().find(s => s.track?.kind === 'video');
          if (sender) await sender.replaceTrack(screenTrack);
        }

        // When user stops sharing via browser UI
        screenTrack.onended = () => {
          const videoTrack = localStreamRef.current?.getVideoTracks()[0];
          if (videoTrack && peerRef.current) {
            const sender = peerRef.current.getSenders().find(s => s.track?.kind === 'video');
            if (sender) sender.replaceTrack(videoTrack);
          }
          setIsScreenSharing(false);
          socketRef.current?.emit('screen-share-stop', { roomId });
        };

        setIsScreenSharing(true);
        socketRef.current?.emit('screen-share-start', { roomId });
      } catch (err) {
        console.error('[WebRTC] Screen share failed:', err);
      }
    }
  }, [isScreenSharing, roomId]);

  // Send chat message
  const sendMessage = useCallback((text, senderRole, senderName) => {
    if (!text.trim() || !socketRef.current) return;
    const timestamp = Date.now();
    socketRef.current.emit('chat-message', {
      roomId,
      message: text,
      sender: senderRole,
      senderName,
      timestamp
    });
    // Removed local state update to prevent doubling (server will broadcast it back)
  }, [roomId]);

  // End call
  const endCall = useCallback(() => {
    socketRef.current?.emit('end-call', { roomId });
    
    // Stop all tracks
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    
    // Close peer
    peerRef.current?.close();
    
    // Disconnect socket
    socketRef.current?.disconnect();
    
    setRemoteConnected(false);
    setIsConnected(false);
  }, [roomId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      peerRef.current?.close();
      socketRef.current?.disconnect();
    };
  }, []);

  return {
    localVideoRef,
    remoteVideoRef,
    isConnected,
    remoteConnected,
    micOn,
    videoOn,
    isScreenSharing,
    connectionState,
    messages,
    remoteMicOn,
    remoteVideoOn,
    initialize,
    toggleMic,
    toggleVideo,
    toggleScreenShare,
    sendMessage,
    endCall,
  };
}

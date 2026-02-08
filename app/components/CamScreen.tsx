'use client'
import React, { useRef, useState, useEffect } from 'react';

function CamScreen() {
        const videoRef = useRef<any>(null);
        const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

        const sendVideoData = (data: string) => {
            // socket.emit("videoData", data);
        };

        useEffect(() => {
            const enableVideoStream = async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: {facingMode: 'user'} }); // user(front) / environment(back)
                    setMediaStream(stream);
                } catch (error) {
                    console.log('Error accessing cam', error);
                }
            };

            enableVideoStream();
        }, []);

        useEffect(() => {
            if (videoRef.current && mediaStream) {
                videoRef.current.srcObject = mediaStream;
            }
        }, [videoRef, mediaStream]);

        useEffect(() => {
            return () => {
                if (mediaStream) {
                    mediaStream.getTracks().forEach((track) => {
                        track.stop();
                    });
                }
            };
        }, [mediaStream]);

        return (
            <div>
                <video style={{transform: "scaleX(-1)"}} ref={videoRef} autoPlay={true} />
            </div>
        )
    }

export default CamScreen;
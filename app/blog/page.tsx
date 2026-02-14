import { log } from "console";
import YoutubeMusicHandler from "../components/YoutubeMusicHandler"
import { useState } from 'react'
import Link from 'next/link'

type url = {
    _id: String;
    url: String;
};

export default async function Page() {

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/yt`, {
        cache: 'no-store', // Disable caching for fresh data (optional)
        method: 'GET',
    });
    const {data = [] } = await response.json();
    log(data)

    const link = "https://www.youtube.com/embed/" + data[Math.floor(Math.random()*data.length)].url + "&autoplay=1"

    const backgroundStyle = {
    backgroundImage: "url('IMG_1438-613x1024.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100vh',
    width: '100vw',
    };

    const backButtonStyle = {
        margin: '10px 10px',
    }

    return <div style={backgroundStyle}>
        <div style={{display: 'flex'}}>
            <Link style={backButtonStyle} href="/test">Back</Link>
            <Link style={backButtonStyle} href="/blog/123">123</Link>
        </div>
        <div style={{justifyContent:'center', alignItems:'center', height: '100vh', display: 'flex'}}>
            {/* {data.map(item => (
                <div key={item._id}>
                    <p>{item.url}</p>
                </div>
            ))} */}
            <div style={{display: 'block', width: '90vw', height: 'auto', borderRadius: '15px'}}>
                <YoutubeMusicHandler />
                <iframe width="100%" height="auto" src={link} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
            </div>
        </div>
    </div>
}
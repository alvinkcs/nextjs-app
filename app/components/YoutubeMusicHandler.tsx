'use client'

import { useState } from 'react'

function YoutubeMusicHandler() {

    const [newSong, setNewSong] = useState("")

    const handleInputChange = (event) => {
        const {name, value} = event.target;
        setNewSong(value);
    }

    const handleClick = async (event) => {
        event.preventDefault();

        if (!newSong.trim()) {
            alert('Please enter a song URL');
            return;
        }

        try {
            const response = await fetch('/api/yt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                        url: newSong.trim()
                })
            });

            if (response.ok) {
                alert('Song added successfully!');
                setNewSong(''); // Clear the input
                // Refresh the page to show updated data
                window.location.reload();
            } else {
                alert('Failed to add song');
            }
        } catch (error) {
            console.error('Error adding song:', error);
            alert('Error adding song');
        }
    }

    return <div style={{backgroundColor: 'black', opacity: '0.8', borderRadius: '15px'}}>
        <h3>Add New Youtube Video</h3>
        <form onSubmit={handleClick}>
            <input onChange={handleInputChange} className="input" type="text" name="value" id="" value={newSong} />
            <button style={{marginLeft:"10px",width:"100px",textAlign:"center"}}>Submit</button>
        </form>
    </div>
}

export default YoutubeMusicHandler
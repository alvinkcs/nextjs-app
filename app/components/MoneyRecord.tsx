'use client'

import { setServers } from "dns"
import { useState } from "react"

function MoneyRecord(props) {

    const [money, setMoney] = useState(props.value)
    const [description, setDescription] = useState("")
    const [records, setRecords] = useState(props.records)

    const handleMoneyChange = (e) => {
        const {name, value} = e.target;
        setMoney(value);
    }

    const handleDescriptionChange = (e) => {
        const {name, value} = e.target;
        setDescription(value);
    }

    const handleSubmit = (e) => {
        console.log(money);
        e.preventDefault();
    }

    async function handleData(event) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Add 1 since getMonth is 0-indexed
        const day = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${year}/${month}/${day}`;
        const response = await fetch('/api/money-record', {
            method: 'POST',
            body: JSON.stringify({
                date:formattedDate,
                value:money,
                description:description
            })
        });
        event.preventDefault();

        if (response.ok) {
            setMoney(0); // Clear the input
            setDescription("");
            // Refresh the page to show updated data
            window.location.reload();
        } else {
            alert('Failed to add data');
        }
    }
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // getMonth +1 as it starts with 0
    const sum = records.reduce((acc, curr) => {
        if (+curr.date.split('/')[0] === year && +curr.date.split('/')[1] === month+1) {
            return acc+ +curr.value;
        } else {
            return acc;
        }
    }, 0);

    async function handleDelete(event) {
        if (confirm('Are you sure to delete that item?')) {
            const {name} = event.target;
            const response = await fetch('/api/money-record', {
                method: 'DELETE',
                body: name
            });
            setRecords(prevRecords => prevRecords.filter(record => record._id != name))
            event.preventDefault();
        }
    }

    return (
    <div style={{width:'90vw', height:'auto', backgroundColor:'black', opacity: '0.8', borderRadius: '15px'}}>
        <h2>Money Record</h2>
        {records.slice(-5).map(record => ( // Limit to the last 5 items
            <div key={record._id} style={{display:'flex', margin: '10px 0', padding: '5px'}}>
                <h3 style={{width:'100%'}}>{record.date} ${record.value} {record.description}</h3>
                <button onClick={handleDelete} name={record._id} style={{marginLeft:'10px'}}>delete</button>
            </div> 
        ))}
        <h3>This month spent: {sum}</h3>
        <form style={{display:'flex', margin: '5px 0', padding: '5px'}}>
            <input id="valueInput" style={{width:'100%', marginRight: '5px'}} type="tel" onChange={handleMoneyChange} name="money" value={money}></input>
            <input id="descriptionInput" name="description" onChange={handleDescriptionChange} value={description}></input>
            <button style={{marginLeft:'10px'}} onClick={handleData}>Submit</button>
        </form>
    </div>
    )
}

export default MoneyRecord
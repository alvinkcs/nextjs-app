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
        const formattedDate = today.toLocaleDateString();
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
        const {name} = event.target;
        const response = await fetch('/api/money-record', {
            method: 'DELETE',
            body: name
        });
        setRecords(prevRecords => prevRecords.filter(record => record._id != name))
        event.preventDefault();
    }

    return (
    <div style={{width:'300px', height:'100hv', backgroundColor:'black'}}>
        <h1>Money Record</h1>
        {records.slice(0,5).map(record => ( // Limit to the first 5 items
            <div key={record._id} style={{display:'flex'}}>
                <h4 style={{width:'100%'}}>{record.date} ${record.value} {record.description}</h4>
                <button onClick={handleDelete} name={record._id} style={{marginLeft:'10px'}}>delete</button>
            </div> 
        ))}
        <h3>This month spent: {sum}</h3>
        <form style={{display:'flex'}}>
            <input id="valueInput" style={{width:'100%'}} onChange={handleMoneyChange} name="money" value={money}></input>
            <input id="descriptionInput" name="description" onChange={handleDescriptionChange} value={description}></input>
            <button style={{marginLeft:'10px'}} onClick={handleData}>Submit</button>
        </form>
    </div>
    )
}

export default MoneyRecord
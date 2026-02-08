'use client'

import { useState } from "react"

function TripCalculator() {
    const [money, setMoney] = useState(0)

    const [paymentHistory, setPaymentHistory] = useState([{
        payer:"kong",
        method:"pay to all",
        value:100
    }])

    const handleMoneyChange = (event) => {
        const {name, value} = event.target;
        setMoney(value);
    }

    const handleSubmit = (event) => {
        const newHistory = {
            payer:"raymond",
            method:"pay to all",
            value:money
        }
        setPaymentHistory((prevHistory) => {
            return [...prevHistory, newHistory]
        })
    }

    return (<div>
        <p>Hello, This is trip calculator app</p>
        <p>case1: A pays for all, case2: A B pay for all, case3: A only pay for B</p>
        <p>Payment history:</p>
        {paymentHistory.map(history => {
            return <p key={history.payer}>{history.payer} {history.method} by {history.value}</p>
        })}

        <input onChange={handleMoneyChange} type="text" name="money" value={money}/>
        <select name="user" id="user-select">
            <option value="user1">kong</option>
            <option value="user2">raymond</option>
            <option value="user3">ben</option>
        </select>
        <select name="method" id="method-select">
            {/* <option value="">--Please choose an option--</option> */}
            <option value="payForAll">Pay for all</option>
            <option value="onlyForOne">Pay for one</option>
        </select>
        <button onClick={handleSubmit}>Submit</button>
    </div>)
}

export default TripCalculator
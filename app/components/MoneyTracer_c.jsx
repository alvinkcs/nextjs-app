'use client'

import { useState } from "react"

function MoneyTracer_c(){
    const style = {
        // backgroundColor:"red",
        height:"300px",
        paddingTop:"30px",
        paddingLeft:"auto",
        paddingRight:"auto"
    }

    const [money, setMoney] = useState({
        netBalance : 10444
    })

    const [inputValue, setInputValue] = useState(0)
    
    const handleValueChange = (event) => {
        const {name, value} = event.target;
        setInputValue(value);
    }

    const handleSpent = (event) => {
        setMoney({
            netBalance:+money.netBalance-inputValue});
        event.preventDefault();
    }

    const handleGain = (event) => {
        setMoney({
            netBalance:+money.netBalance + +inputValue});
        event.preventDefault();
    }

    return (
        <div style={style}>
            <h1>This is Money Tracer</h1>
            <h1>Net balance: ${money.netBalance}</h1>
            <h1>What to spend: </h1>
            <form>
                <input onChange={handleValueChange} className="input" type="text" name="value" id="" value={inputValue} />
                <button onClick={handleSpent} className="button-27" style={{marginLeft:"10px",width:"100px",textAlign:"center"}}>Spent</button>
                <button onClick={handleGain} className="button-27" style={{marginLeft:"10px",width:"100px",textAlign:"center"}}>Gained</button>
            </form>
        </div>
    )
}

export default MoneyTracer_c
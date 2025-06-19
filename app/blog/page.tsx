import { log } from "console";
import MoneyTracer from "../components/MoneyTracer"

type url = {
    _id: String;
    url: String;
};

export default async function Page() {

    const newData = {
        url: 'TcLLpZBWsck?si=vqHE8ci_P-ZN6VC5'
    }

    const settings = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: newData})
    }

    // const res = await fetch('http://localhost:3000/api/test', {
    //     method: 'POST',
    //     body: JSON.stringify(newData)
    // })
    // const test = await res.json()
    // log(test)

    const response = await fetch('http://localhost:3000/api/test', {
        cache: 'no-store', // Disable caching for fresh data (optional)
        method: 'GET',
    });
    const {data = [] } = await response.json();
    log(data)

    const link = "https://www.youtube.com/embed/" + data[Math.floor(Math.random()*data.length)].url + "&autoplay=1"

    return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh'}}>
        <div style={{}}>
            {data.map(item => (
                <div key={item._id}>
                    <p>{item.url}</p>
                </div>
            ))}
            <MoneyTracer />

            <iframe width="560" height="315" src={link} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
            {/* <iframe width="560" height="315" src="https://www.youtube.com/embed/TcLLpZBWsck?si=vqHE8ci_P-ZN6VC5&autoplay=1" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe> */}
        </div>
    </div>
}
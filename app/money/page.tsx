import { log } from "console";
import MoneyRecord from "../components/MoneyRecord"

export default async function Page() {

    const response = await fetch('http://localhost:3000/api/money-record', {
        cache: 'no-store',
        method: 'GET',
    });
    const {data = []} = await response.json();
    log(data)

    const handleData = (componentData) => {
        log("Data from component: ", componentData);
    };

    const backgroundStyle = {
        backgroundImage: "url('IMG_1438-613x1024.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
        width: '100%',
    };

    return (
        <div style={backgroundStyle}>
            {/* <img 
                src="IMG_1438-613x1024.jpg"
                width='200px'
            /> */}
            <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', margin:'auto'}}>
                <MoneyRecord value="0" records={data} />
            </div>
        </div>
    )
} 


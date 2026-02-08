import { log } from "console";
import MoneyRecord from "../components/MoneyRecord"
import Link from 'next/link'

export default async function Page() {

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/money-record`, {
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

    const backButtonStyle = {
        margin: '10px 10px',
    }

    return (
        <div style={backgroundStyle}>
            {/* <img 
                src="IMG_1438-613x1024.jpg"
                width='200px'
            /> */}
            <div style={{height: '50px', display: 'flex'}}>
                <Link style={backButtonStyle} href="/">Back</Link>
            </div>
            <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', margin:'auto'}}>
                <MoneyRecord value="0" records={data} />
            </div>
        </div>
    )
} 


import KVCacheVisualization from "../components/KVCacheVisualization"
import TradeView from "../components/TradeView"

export default async function Page() {
    const response = await fetch('http://localhost:3000/api/yt', {
        cache: 'no-store', // Disable caching for fresh data
        method: 'GET',
    });
    const {data = {}} = await response.json();
    console.log(data)

    // Mock data structure based on backend KV cache format
    // In production, this should come from the API
    const mockKVCacheData = {
        "layer_0": [
            // K cache: [seq_len, head_dim]
            [
                [0.1, 0.2, 0.3, 0.4, 0.5],
                [0.2, 0.3, 0.4, 0.5, 0.6],
                [0.3, 0.4, 0.5, 0.6, 0.7],
                [0.4, 0.5, 0.6, 0.7, 0.8]
            ],
            // V cache: [seq_len, head_dim]
            [
                [0.5, 0.6, 0.7, 0.8, 0.9],
                [0.6, 0.7, 0.8, 0.9, 1.0],
                [0.7, 0.8, 0.9, 1.0, 1.1],
                [0.8, 0.9, 1.0, 1.1, 1.2]
            ]
        ]
    };

    // Sample trading data - OHLC (Open, High, Low, Close) with volume
    const tradingData = [
        { date: new Date('2024-01-01'), open: 150.00, high: 155.50, low: 148.20, close: 153.80, volume: 1250000 },
        { date: new Date('2024-01-02'), open: 153.80, high: 158.90, low: 152.10, close: 157.20, volume: 980000 },
        { date: new Date('2024-01-03'), open: 157.20, high: 160.80, low: 155.40, close: 159.60, volume: 1100000 },
        { date: new Date('2024-01-04'), open: 159.60, high: 162.30, low: 157.80, close: 161.50, volume: 950000 },
        { date: new Date('2024-01-05'), open: 161.50, high: 165.20, low: 160.10, close: 163.90, volume: 1200000 },
        { date: new Date('2024-01-06'), open: 163.90, high: 167.40, low: 162.50, close: 166.80, volume: 1050000 },
        { date: new Date('2024-01-07'), open: 166.80, high: 169.90, low: 164.20, close: 168.70, volume: 1150000 },
        { date: new Date('2024-01-08'), open: 168.70, high: 172.10, low: 167.30, close: 170.40, volume: 1300000 },
        { date: new Date('2024-01-09'), open: 170.40, high: 173.80, low: 168.90, close: 172.60, volume: 1180000 },
        { date: new Date('2024-01-10'), open: 172.60, high: 176.20, low: 171.10, close: 174.90, volume: 1250000 },
        { date: new Date('2024-01-11'), open: 174.90, high: 178.50, low: 173.40, close: 177.20, volume: 1120000 },
        { date: new Date('2024-01-12'), open: 177.20, high: 180.80, low: 175.70, close: 179.50, volume: 1280000 },
        { date: new Date('2024-01-13'), open: 179.50, high: 182.90, low: 178.10, close: 181.80, volume: 1220000 },
        { date: new Date('2024-01-14'), open: 181.80, high: 185.40, low: 180.30, close: 183.60, volume: 1350000 },
        { date: new Date('2024-01-15'), open: 183.60, high: 187.20, low: 182.10, close: 185.90, volume: 1180000 },
        { date: new Date('2024-01-16'), open: 185.90, high: 189.50, low: 184.40, close: 187.70, volume: 1420000 },
        { date: new Date('2024-01-17'), open: 187.70, high: 191.30, low: 186.20, close: 189.40, volume: 1380000 },
        { date: new Date('2024-01-18'), open: 189.40, high: 192.80, low: 187.90, close: 191.60, volume: 1290000 },
        { date: new Date('2024-01-19'), open: 191.60, high: 195.20, low: 190.10, close: 193.80, volume: 1450000 },
        { date: new Date('2024-01-20'), open: 193.80, high: 197.40, low: 192.30, close: 195.50, volume: 1320000 },
        { date: new Date('2024-01-21'), open: 195.50, high: 199.10, low: 194.00, close: 197.30, volume: 1480000 },
        { date: new Date('2024-01-22'), open: 197.30, high: 200.90, low: 195.80, close: 199.60, volume: 1390000 },
        { date: new Date('2024-01-23'), open: 199.60, high: 203.20, low: 198.10, close: 201.40, volume: 1520000 },
        { date: new Date('2024-01-24'), open: 201.40, high: 205.00, low: 199.90, close: 203.70, volume: 1460000 },
        { date: new Date('2024-01-25'), open: 203.70, high: 207.30, low: 202.20, close: 205.50, volume: 1580000 },
        { date: new Date('2024-01-26'), open: 205.50, high: 209.10, low: 204.00, close: 207.80, volume: 1490000 },
        { date: new Date('2024-01-27'), open: 207.80, high: 211.40, low: 206.30, close: 209.60, volume: 1610000 },
        { date: new Date('2024-01-28'), open: 209.60, high: 213.20, low: 208.10, close: 211.90, volume: 1530000 },
        { date: new Date('2024-01-29'), open: 211.90, high: 215.50, low: 210.40, close: 213.70, volume: 1670000 },
        { date: new Date('2024-01-30'), open: 213.70, high: 217.30, low: 212.20, close: 215.40, volume: 1590000 }
    ];

    const seqList = ['H', 'e', 'l', 'l', 'o'];

    // child {
    //     position: absolute;
    //     top: 50%;
    //     left: 50%;
    //     transform: translate(-50%, -50%);
    //     width: 200px;
    //     height: 100px;
    //     background-color: lightgreen;
    // }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            padding: '20px'
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                padding: '30px'
            }}>
                <h1 style={{
                    textAlign: 'center',
                    marginBottom: '30px',
                    color: '#333',
                    fontSize: '28px',
                    fontWeight: 'bold'
                }}>
                    Trading View Chart
                </h1>
            </div>
            <TradeView
                tradingData={data.tradingData || tradingData}
            />
        </div>
    )
}
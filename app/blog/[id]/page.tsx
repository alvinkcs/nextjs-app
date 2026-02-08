import CamScreen from "../../components/CamScreen"

export default async function Page({ params }: {
    params: { id: string}
}) {
    return (
        <div>
            <CamScreen />
            <h1>ID: {params.id}</h1>
        </div>
    )
}
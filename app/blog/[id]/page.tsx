export default async function Page({ params }: {
    params: { id: string}
}) {
    return <h1>ID: {params.id}</h1>
}
import Image from "next/image";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <h1 className="text-4xl font-bold">Iconify</h1>
            <Image
                src="/iconify.png"
                alt="Iconify logo"
                width={200}
                height={200}
                className="rounded-full"
            />
            <p className="text-center">
                Iconify is a tool to help you find the perfect icon for your project using the ai and edit it to your
                liking.
            </p>
        </main>
    );
}

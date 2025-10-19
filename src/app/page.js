import Camera from "./components/Camera";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <main className="bg-gray-950 min-h-screen py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <Navbar />
        <Camera />
        <Footer />
      </div>
    </main>
  );
}

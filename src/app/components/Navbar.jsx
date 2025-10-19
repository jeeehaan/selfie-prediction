function Navbar() {
  return (
    <header className="text-center">
      <h1
        className="text-4xl font-extrabold bg-gradient-to-r from-purple-300 via-red-400 to-pink-500 text-transparent bg-clip-text shadow-lg inline-block"
        style={{ filter: "drop-shadow(0 0 10px rgba(235, 70, 150, 0.7))" }}
      >
        CUYFACE | PREDICT YOUR FACE
      </h1>
      <p>Ramal berdasarkan foto selfie kalian</p>
    </header>
  );
}

export default Navbar;

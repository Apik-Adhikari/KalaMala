import Header from "./components/header/Header.jsx";
import "./index.css";

function App() {
  return (
    <div className="App min-h-screen bg-gray-100">
      <Header />
      <main className="p-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome to Kala Mala E-commerce
        </h1>
        <p className="mt-2 text-gray-600">
          This is a sample homepage. Start adding your components here.
        </p>
      </main>
    </div>
  );
}

export default App;
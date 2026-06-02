import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Overview from './pages/Overview';
import TheCanSat from './pages/TheCanSat';
import Technology from './pages/Technology';
import Sensors from './pages/Sensors';
import Team from './pages/Team';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Admin from './pages/Admin';

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/the-cansat" element={<TheCanSat />} />
            <Route path="/technology" element={<Technology />} />
            <Route path="/sensors" element={<Sensors />} />
            <Route path="/team" element={<Team />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;

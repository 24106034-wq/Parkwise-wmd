import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthScreen from "./components/AuthScreen.jsx";
import ParkingDashboard from "./components/ParkingDashboard.jsx";
import ParkingLayout from "./components/ParkingLayout.jsx";
import FindParkingPage from "./components/FindParkingPage.jsx";
import BookingsPage from "./components/BookingsPage.jsx";
import ActivityPage from "./components/ActivityPage.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { ParkingProvider } from "./context/ParkingContext.jsx";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <main className="app-loading"><span className="loading-mark">P</span><span>Loading Parkwise...</span></main>;
  }
  if (!user) return <AuthScreen />;
  return (
    <ParkingProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<ParkingLayout />}>
            <Route index element={<ParkingDashboard />} />
            <Route path="find-parking" element={<FindParkingPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ParkingProvider>
  );
}

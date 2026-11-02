import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext.jsx";

const ParkingContext = createContext(null);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function request(path, { userId, ...options } = {}) {
  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(userId ? { "X-Demo-User-Id": userId } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || `Backend request failed (${response.status})`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export function ParkingProvider({ children }) {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const [nextSlots, nextBookings] = await Promise.all([
        request("/slots"),
        request("/bookings/me", { userId: user.uid }),
      ]);
      setSlots(nextSlots);
      setBookings(nextBookings);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    setSlots([]);
    setBookings([]);
    if (!user) return undefined;
    refresh();
    const intervalId = window.setInterval(refresh, 2000);
    return () => window.clearInterval(intervalId);
  }, [user, refresh]);

  const bookSlot = useCallback(async (slotId) => {
    const booking = await request("/bookings", {
      userId: user.uid,
      method: "POST",
      body: JSON.stringify({ slotId }),
    });
    await refresh();
    return booking;
  }, [user, refresh]);

  const releaseBooking = useCallback(async (bookingId) => {
    await request(`/bookings/${encodeURIComponent(bookingId)}`, {
      userId: user.uid,
      method: "DELETE",
    });
    await refresh();
  }, [user, refresh]);

  const value = useMemo(() => ({
    slots,
    bookings,
    activeBookings: bookings.filter((booking) => booking.active),
    loading,
    error,
    setError,
    refresh,
    bookSlot,
    releaseBooking,
  }), [slots, bookings, loading, error, refresh, bookSlot, releaseBooking]);

  return <ParkingContext.Provider value={value}>{children}</ParkingContext.Provider>;
}

export function useParking() {
  const context = useContext(ParkingContext);
  if (!context) throw new Error("useParking must be used within ParkingProvider");
  return context;
}

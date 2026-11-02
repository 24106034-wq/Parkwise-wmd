import { useState } from "react";
import { CarFront, Clock3, MapPin, Ticket } from "lucide-react";
import { useParking } from "../context/ParkingContext.jsx";

export default function BookingsPage() {
  const { bookings, releaseBooking } = useParking();
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const active = bookings.filter((booking) => booking.active);
  const past = bookings.filter((booking) => !booking.active);

  async function release(id) {
    setBusyId(id);
    setError("");
    try {
      await releaseBooking(id);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyId("");
    }
  }

  return (
    <main className="inner-page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">YOUR PARKING</p>
          <h1>My bookings.</h1>
          <p className="welcome-subtitle">Manage the spots you have reserved.</p>
        </div>
        <span className="booking-summary"><Ticket size={17} /> {active.length} active</span>
      </section>
      {error && <div className="error-banner" role="alert">{error}</div>}
      <section className="panel booking-page-panel">
        <div className="panel-heading">
          <div><p className="eyebrow">CURRENT</p><h2>Active bookings</h2></div>
          <span className="count-badge">{active.length}</span>
        </div>
        {active.length === 0 ? (
          <div className="booking-empty page-empty">
            <span className="booking-empty-icon"><CarFront size={24} /></span>
            <strong>No active bookings</strong>
            <span>Find a spot to reserve your next parking space.</span>
          </div>
        ) : (
          <div className="booking-page-list">
            {active.map((booking) => (
              <article className="booking-page-item" key={booking.id}>
                <span className="booking-icon"><CarFront size={21} /></span>
                <div className="booking-info">
                  <strong>Slot {booking.slotLabel}</strong>
                  <span><MapPin size={13} /> Reserved parking space</span>
                </div>
                <span className="booking-date"><Clock3 size={14} /> {new Date(booking.createdAt).toLocaleString()}</span>
                <button className="release-button" disabled={busyId === booking.id} onClick={() => release(booking.id)}>
                  {busyId === booking.id ? "Releasing..." : "Release"}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="panel booking-page-panel past-bookings">
        <div className="panel-heading">
          <div><p className="eyebrow">HISTORY</p><h2>Previous bookings</h2></div>
          <span className="count-badge">{past.length}</span>
        </div>
        {past.length === 0 ? (
          <p className="muted-copy">Released bookings will appear here.</p>
        ) : (
          <div className="booking-page-list">
            {past.map((booking) => (
              <article className="booking-page-item past-item" key={booking.id}>
                <span className="booking-icon muted-booking-icon"><CarFront size={21} /></span>
                <div className="booking-info"><strong>Slot {booking.slotLabel}</strong><span>Released</span></div>
                <span className="booking-date"><Clock3 size={14} /> {new Date(booking.updatedAt).toLocaleString()}</span>
                <span className="released-label">Complete</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

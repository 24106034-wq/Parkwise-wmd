import { useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  CarFront,
  Check,
  Clock3,
  MapPin,
  ParkingCircle,
  Radio,
  RefreshCw,
} from "lucide-react";
import { useParking } from "../context/ParkingContext.jsx";
import SlotDetailsModal from "./SlotDetailsModal.jsx";

const statusNames = {
  AVAILABLE: "Available",
  OCCUPIED: "Occupied",
  RESERVED: "Reserved",
};

export default function ParkingDashboard() {
  const { slots, activeBookings: bookings, loading, error, setError, bookSlot: createBooking } = useParking();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [busy, setBusy] = useState(false);

  const counts = useMemo(
    () => slots.reduce(
      (result, slot) => {
        const status = String(slot.status || "").toUpperCase();
        if (status in result) result[status] += 1;
        return result;
      },
      { AVAILABLE: 0, OCCUPIED: 0, RESERVED: 0 },
    ),
    [slots],
  );

  async function bookSlot(slot) {
    setError("");
    setBusy(true);
    try {
      await createBooking(slot.id);
      setSelectedSlot(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="dashboard-page">
      <section className="welcome-row">
        <div>
          <p className="eyebrow">YOUR PARKING, SIMPLIFIED</p>
          <h1>Your parking, at a glance.</h1>
          <p className="welcome-subtitle">Find a spot and get on with your day.</p>
        </div>
        <div className="location-pill"><MapPin size={16} /> Downtown Parking Center <ArrowUpRight size={15} /></div>
      </section>

      <section className="stat-grid" aria-label="Parking availability">
        <article className="stat-card">
          <span className="stat-icon available-icon"><ParkingCircle size={20} /></span>
          <div><p>Available now</p><strong>{counts.AVAILABLE}</strong></div>
          <span className="stat-note">spots</span>
        </article>
        <article className="stat-card">
          <span className="stat-icon occupied-icon"><CarFront size={20} /></span>
          <div><p>Occupied</p><strong>{counts.OCCUPIED}</strong></div>
          <span className="stat-note">spots</span>
        </article>
        <article className="stat-card">
          <span className="stat-icon reserved-icon"><Clock3 size={20} /></span>
          <div><p>Reserved</p><strong>{counts.RESERVED}</strong></div>
          <span className="stat-note">spots</span>
        </article>
        <article className="stat-card availability-card">
          <span className="stat-icon activity-icon"><Activity size={20} /></span>
          <div><p>Live connection</p><strong className="connected-label">{error ? "Offline" : loading ? "Connecting" : "Connected"}</strong></div>
          <Radio className="connection-wave" size={19} />
        </article>
      </section>

      <section className="content-grid">
        <article className="panel map-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">LIVE FLOOR PLAN</p>
              <h2>Choose your spot</h2>
            </div>
            <span className="floor-tag">All floors <RefreshCw size={14} /></span>
          </div>
          <div className="map-legend" aria-label="Slot status legend">
            {Object.entries(statusNames).map(([status, label]) => (
              <span key={status}><i className={`legend-dot ${status.toLowerCase()}`} />{label}</span>
            ))}
          </div>
          {loading ? (
            <div className="empty-state"><RefreshCw className="spin" size={22} /> Loading live parking data...</div>
          ) : slots.length === 0 ? (
            <div className="empty-state"><ParkingCircle size={25} /> No parking slots configured yet.</div>
          ) : (
            <div className="parking-map">
              <div className="drive-lane"><span>DRIVE AISLE</span><span>↓</span><span>DRIVE AISLE</span></div>
              <div className="slot-grid">
                {slots.map((slot) => {
                  const status = String(slot.status || "UNKNOWN").toUpperCase();
                  const recognized = status in statusNames;
                  return (
                    <button
                      className={`slot-tile ${recognized ? status.toLowerCase() : "unknown"}`}
                      key={slot.id}
                      disabled={!recognized || status === "OCCUPIED"}
                      onClick={() => setSelectedSlot(slot)}
                      title={`${slot.label} · ${statusNames[status] || status}`}
                    >
                      <CarFront size={20} />
                      <strong>{slot.label}</strong>
                      <span>{statusNames[status] || status}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <p className="map-footnote"><Check size={15} /> Tap an available spot to see details and book.</p>
        </article>

        <aside className="panel bookings-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">YOUR ACTIVITY</p>
              <h2>Active bookings <span className="count-badge">{bookings.length}</span></h2>
            </div>
          </div>
          {loading ? (
            <div className="empty-state compact"><RefreshCw className="spin" size={20} /> Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="booking-empty">
              <span className="booking-empty-icon"><CarFront size={24} /></span>
              <strong>No active bookings</strong>
              <span>Book an available spot and it will show up here.</span>
            </div>
          ) : (
            <div className="booking-list">
              {bookings.map((booking) => (
                <article className="booking-item" key={booking.id}>
                  <span className="booking-icon"><CarFront size={20} /></span>
                  <div className="booking-info">
                    <strong>Slot {booking.slotLabel}</strong>
                    <span><span className="booking-dot" /> Confirmed</span>
                  </div>
                </article>
              ))}
            </div>
          )}
          <div className="booking-tip">
            <Clock3 size={16} />
            <span>Remember to release your spot when you leave.</span>
          </div>
        </aside>
      </section>

      <SlotDetailsModal
        slot={selectedSlot}
        busy={busy}
        onBook={bookSlot}
        onClose={() => setSelectedSlot(null)}
      />
    </main>
  );
}

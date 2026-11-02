import { Activity, CarFront, Clock3, Ticket } from "lucide-react";
import { useParking } from "../context/ParkingContext.jsx";

export default function ActivityPage() {
  const { bookings, loading } = useParking();
  const events = bookings.flatMap((booking) => [
    { id: `${booking.id}-booked`, time: booking.createdAt, text: `Reserved parking slot ${booking.slotLabel}`, kind: "reserved" },
    ...(!booking.active ? [{ id: `${booking.id}-released`, time: booking.updatedAt, text: `Released parking slot ${booking.slotLabel}`, kind: "released" }] : []),
  ]).sort((a, b) => b.time - a.time);

  return (
    <main className="inner-page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">RECENT EVENTS</p>
          <h1>Your activity.</h1>
          <p className="welcome-subtitle">A timeline of your parking reservations.</p>
        </div>
        <span className="booking-summary"><Activity size={17} /> {events.length} events</span>
      </section>
      <section className="panel activity-panel">
        {loading ? (
          <div className="empty-state"><span className="spin">↻</span> Loading activity...</div>
        ) : events.length === 0 ? (
          <div className="booking-empty page-empty">
            <span className="booking-empty-icon"><Ticket size={24} /></span>
            <strong>No activity yet</strong>
            <span>Your bookings and releases will show up here.</span>
          </div>
        ) : (
          <ol className="activity-timeline">
            {events.map((event) => (
              <li className="activity-event" key={event.id}>
                <span className={`activity-event-icon ${event.kind}`}><CarFront size={18} /></span>
                <div className="activity-event-copy"><strong>{event.text}</strong><span><Clock3 size={13} /> {new Date(event.time).toLocaleString()}</span></div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}

import { useMemo, useState } from "react";
import { CarFront, MapPin, Search } from "lucide-react";
import { useParking } from "../context/ParkingContext.jsx";
import SlotDetailsModal from "./SlotDetailsModal.jsx";

export default function FindParkingPage() {
  const { slots, loading, bookSlot } = useParking();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const filteredSlots = useMemo(() => {
    const term = search.trim().toLowerCase();
    return slots.filter((slot) => {
      const matchesSearch = !term || [slot.label, slot.zone, slot.floor].some((value) =>
        String(value).toLowerCase().includes(term),
      );
      return matchesSearch && (status === "ALL" || slot.status === status);
    });
  }, [slots, search, status]);

  async function book(slot) {
    setBusy(true);
    setError("");
    try {
      await bookSlot(slot.id);
      setSelectedSlot(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="inner-page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">PARKING DIRECTORY</p>
          <h1>Find your spot.</h1>
          <p className="welcome-subtitle">Browse live availability and reserve a space.</p>
        </div>
        <div className="location-pill"><MapPin size={16} /> Downtown Parking Center</div>
      </section>
      <section className="panel find-panel">
        <div className="filter-toolbar">
          <label className="search-field">
            <Search size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search slot, floor, or zone" />
          </label>
          <select aria-label="Filter by status" className="status-filter" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="ALL">All statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="RESERVED">Reserved</option>
          </select>
        </div>
        {error && <div className="form-error page-error" role="alert">{error}</div>}
        {loading ? (
          <div className="empty-state"><span className="spin">↻</span> Connecting to Kotlin API...</div>
        ) : filteredSlots.length === 0 ? (
          <div className="empty-state"><CarFront size={24} /> No spaces match those filters.</div>
        ) : (
          <div className="directory-grid">
            {filteredSlots.map((slot) => (
              <button
                className={`directory-slot ${slot.status.toLowerCase()}`}
                key={slot.id}
                onClick={() => setSelectedSlot(slot)}
              >
                <span className="directory-slot-icon"><CarFront size={21} /></span>
                <span className="directory-slot-title">Slot {slot.label}</span>
                <span className="directory-slot-location">{slot.zone} · {slot.floor}</span>
                <span className={`directory-status ${slot.status.toLowerCase()}`}>{slot.status.toLowerCase()}</span>
                <strong>${Number(slot.pricePerHour).toFixed(2)}<small> / hr</small></strong>
              </button>
            ))}
          </div>
        )}
      </section>
      <SlotDetailsModal slot={selectedSlot} busy={busy} onBook={book} onClose={() => setSelectedSlot(null)} />
    </main>
  );
}

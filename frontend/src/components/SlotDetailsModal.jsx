import { X } from "lucide-react";

export default function SlotDetailsModal({ slot, onClose, onBook, busy }) {
  if (!slot) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-labelledby="slot-modal-title"
        aria-modal="true"
        className="slot-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button aria-label="Close dialog" className="icon-button modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        <span className="eyebrow">PARKING SPACE</span>
        <h2 id="slot-modal-title">Slot {slot.label}</h2>
        <p className="modal-location">{slot.zone} zone · {slot.floor} floor</p>
        <div className="modal-details">
          <div><span>Current status</span><strong className={`status-text ${slot.status.toLowerCase()}`}>{slot.status}</strong></div>
          <div><span>Rate</span><strong>${Number(slot.pricePerHour).toFixed(2)} / hour</strong></div>
        </div>
        <button
          className="button button-primary modal-book"
          disabled={busy || slot.status !== "AVAILABLE"}
          onClick={() => onBook(slot)}
        >
          {busy ? "Booking..." : slot.status === "AVAILABLE" ? "Book this slot" : "Not available"}
        </button>
      </section>
    </div>
  );
}

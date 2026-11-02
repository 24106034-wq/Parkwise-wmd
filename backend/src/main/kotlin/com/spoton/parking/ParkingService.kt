package com.spoton.parking

import java.util.UUID

class ParkingException(val statusCode: Int, override val message: String) : RuntimeException(message)

class ParkingService {
    private val lock = Any()
    private val slots = linkedMapOf<String, SlotResponse>()
    private val bookings = linkedMapOf<String, BookingResponse>()

    init {
        repeat(16) { index ->
            val row = index / 4
            val column = index % 4 + 1
            val status = when {
                index % 7 == 0 -> "OCCUPIED"
                index % 5 == 0 -> "RESERVED"
                else -> "AVAILABLE"
            }
            val slot = SlotResponse(
                id = "slot-${index + 1}",
                label = "${('A'.code + row).toChar()}$column",
                floor = if (row < 2) "Ground" else "Level 1",
                zone = if (column < 3) "North" else "South",
                pricePerHour = 4.5,
                status = status,
                bookedBy = null,
                updatedAt = System.currentTimeMillis(),
            )
            slots[slot.id] = slot
        }
    }

    fun getSlots(): List<SlotResponse> = synchronized(lock) { slots.values.toList() }

    fun getBookingsForUser(userId: String): List<BookingResponse> =
        synchronized(lock) { bookings.values.filter { it.userId == userId } }

    fun createBooking(userId: String, slotId: String): BookingResponse = synchronized(lock) {
        val slot = slots[slotId] ?: throw ParkingException(404, "Parking slot not found")
        if (slot.status != "AVAILABLE") throw ParkingException(409, "Parking slot is not available")

        val now = System.currentTimeMillis()
        val booking = BookingResponse(
            id = UUID.randomUUID().toString(),
            userId = userId,
            slotId = slot.id,
            slotLabel = slot.label,
            active = true,
            createdAt = now,
            updatedAt = now,
        )
        slots[slotId] = slot.copy(status = "RESERVED", bookedBy = userId, updatedAt = now)
        bookings[booking.id] = booking
        booking
    }

    fun releaseBooking(userId: String, bookingId: String) = synchronized(lock) {
        val booking = bookings[bookingId] ?: throw ParkingException(404, "Booking not found")
        if (booking.userId != userId) throw ParkingException(403, "You cannot release this booking")
        if (!booking.active) throw ParkingException(409, "Booking is already inactive")

        val now = System.currentTimeMillis()
        bookings[bookingId] = booking.copy(active = false, updatedAt = now)
        val slot = slots[booking.slotId]
        if (slot?.bookedBy == userId) {
            slots[slot.id] = slot.copy(status = "AVAILABLE", bookedBy = null, updatedAt = now)
        }
    }

    fun updateSensorStatus(slotId: String, status: String) = synchronized(lock) {
        val slot = slots[slotId] ?: throw ParkingException(404, "Parking slot not found")
        if (slot.status == "RESERVED") {
            throw ParkingException(409, "A reserved slot cannot be changed by a sensor")
        }
        slots[slotId] = slot.copy(
            status = status,
            bookedBy = null,
            updatedAt = System.currentTimeMillis(),
        )
    }
}

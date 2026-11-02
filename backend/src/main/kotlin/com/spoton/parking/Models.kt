package com.spoton.parking

import kotlinx.serialization.Serializable

@Serializable
data class SlotResponse(
    val id: String,
    val label: String,
    val floor: String,
    val zone: String,
    val pricePerHour: Double,
    val status: String,
    val bookedBy: String?,
    val updatedAt: Long,
)

@Serializable
data class BookingResponse(
    val id: String,
    val userId: String,
    val slotId: String,
    val slotLabel: String,
    val active: Boolean,
    val createdAt: Long,
    val updatedAt: Long,
)

@Serializable
data class CreateBookingRequest(val slotId: String)

@Serializable
data class SensorStatusRequest(val status: String)

@Serializable
data class ErrorResponse(val error: String)

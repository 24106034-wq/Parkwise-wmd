package com.spoton.parking

import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.HttpMethod
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationCall
import io.ktor.server.application.call
import io.ktor.server.application.install
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.request.header
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.delete
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import kotlinx.serialization.json.Json
import java.security.MessageDigest

fun Application.module() {
    val parkingService = ParkingService()

    install(ContentNegotiation) {
        json(Json { ignoreUnknownKeys = true })
    }
    install(CORS) {
        allowHost("localhost:5173")
        allowHost("127.0.0.1:5173")
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Delete)
        allowHeader(HttpHeaders.Authorization)
        allowHeader(HttpHeaders.ContentType)
        allowHeader("X-IoT-Token")
        allowHeader("X-Demo-User-Id")
    }
    install(StatusPages) {
        exception<ParkingException> { call, cause ->
            call.respond(HttpStatusCode.fromValue(cause.statusCode), ErrorResponse(cause.message))
        }
    }

    routing {
        route("/api") {
            get("/health") {
                call.respond(mapOf("status" to "ok"))
            }

            get("/slots") {
                call.respond(parkingService.getSlots())
            }

            get("/bookings/me") {
                val userId = call.demoUserId() ?: return@get
                call.respond(parkingService.getBookingsForUser(userId))
            }

            post("/bookings") {
                val userId = call.demoUserId() ?: return@post
                val request = call.receive<CreateBookingRequest>()
                if (request.slotId.isBlank()) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("slotId is required"))
                    return@post
                }
                call.respond(HttpStatusCode.Created, parkingService.createBooking(userId, request.slotId))
            }

            delete("/bookings/{bookingId}") {
                val userId = call.demoUserId() ?: return@delete
                val bookingId = call.parameters["bookingId"]
                if (bookingId.isNullOrBlank()) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("bookingId is required"))
                    return@delete
                }
                parkingService.releaseBooking(userId, bookingId)
                call.respond(HttpStatusCode.NoContent)
            }

            post("/iot/slots/{slotId}/status") {
                val expectedToken = System.getenv("IOT_SHARED_TOKEN")
                if (expectedToken.isNullOrBlank()) {
                    call.respond(
                        HttpStatusCode.ServiceUnavailable,
                        ErrorResponse("IoT updates are not configured"),
                    )
                    return@post
                }
                val suppliedToken = call.request.header("X-IoT-Token")
                if (
                    suppliedToken == null ||
                    !MessageDigest.isEqual(
                        suppliedToken.toByteArray(Charsets.UTF_8),
                        expectedToken.toByteArray(Charsets.UTF_8),
                    )
                ) {
                    call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Invalid IoT token"))
                    return@post
                }

                val slotId = call.parameters["slotId"]
                if (slotId.isNullOrBlank()) {
                    call.respond(HttpStatusCode.BadRequest, ErrorResponse("slotId is required"))
                    return@post
                }
                val status = call.receive<SensorStatusRequest>().status.uppercase()
                if (status !in setOf("AVAILABLE", "OCCUPIED")) {
                    call.respond(
                        HttpStatusCode.BadRequest,
                        ErrorResponse("Sensor status must be AVAILABLE or OCCUPIED"),
                    )
                    return@post
                }
                parkingService.updateSensorStatus(slotId, status)
                call.respond(HttpStatusCode.OK, mapOf("status" to status))
            }
        }
    }
}

private suspend fun ApplicationCall.demoUserId(): String? {
    val userId = request.header("X-Demo-User-Id")
        ?.trim()
        ?.takeIf { it.isNotEmpty() && it.length <= 128 }
    if (userId == null) {
        respond(HttpStatusCode.BadRequest, ErrorResponse("X-Demo-User-Id header is required"))
        return null
    }
    return userId
}

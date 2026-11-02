# Smart Parking Slot Finder

The app runs locally with a React/Vite frontend and a Kotlin/Ktor REST API.
Parking slots and bookings are held in memory by the Kotlin server; restarting
the server resets the demo data. Firebase and Docker are not used.

## Run

Requirements: Node.js 20.19+ (or 22.12+) and JDK 21. Gradle is downloaded by
the included wrapper automatically.

From the project root, run one command:

```powershell
npm run dev
```

The script starts the Kotlin API at `http://localhost:8080`, then Vite at
`http://localhost:5173`. Open the Vite URL. Press **Ctrl+C** to stop both
services. On first run Gradle downloads its distribution/dependencies and npm
installs frontend packages if needed.

## Pages

- **Overview**: availability summary, live slot grid, and active bookings.
- **Find parking**: search/filter spaces and inspect rates and locations before
  booking.
- **My bookings**: release active reservations and review released bookings.
- **Activity**: reservation and release timeline.

Demo sign-in is local and is not real authentication. The API trusts a demo
user ID sent by the frontend and is intended for local development only. Do not
expose this server to the internet or use it for real booking/payment data.

## API

- `GET /api/health`
- `GET /api/slots`
- `GET /api/bookings/me` (requires `X-Demo-User-Id`)
- `POST /api/bookings` (requires `X-Demo-User-Id`, JSON `{"slotId":"slot-2"}`)
- `DELETE /api/bookings/{bookingId}` (requires `X-Demo-User-Id`)
- `POST /api/iot/slots/{slotId}/status` (requires `IOT_SHARED_TOKEN` and JSON
  `{"status":"OCCUPIED"}` or `{"status":"AVAILABLE"}`)

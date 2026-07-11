const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const { defineSecret } = require("firebase-functions/params");
const { google } = require("googleapis");

setGlobalOptions({
  maxInstances: 10,
});

const GOOGLE_CLIENT_EMAIL = defineSecret("GOOGLE_CLIENT_EMAIL");
const GOOGLE_PRIVATE_KEY = defineSecret("GOOGLE_PRIVATE_KEY");

exports.crearCitaGoogleCalendar = onDocumentCreated(
  {
    document: "usuarios/{uid}/citas/{citaId}",
    secrets: [
      GOOGLE_CLIENT_EMAIL,
      GOOGLE_PRIVATE_KEY
    ],
  },

  async (event) => {

    const cita = event.data.data();

    console.log("Nueva cita:", cita);

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_CLIENT_EMAIL.value(),
        private_key: GOOGLE_PRIVATE_KEY.value()
          .replace(/\\n/g, "\n"),
      },
      scopes: [
        "https://www.googleapis.com/auth/calendar",
      ],
    });

    const calendar = google.calendar({
      version: "v3",
      auth,
    });

    await calendar.events.insert({
      calendarId: "primary",

      requestBody: {
        summary: cita.servicio,

        description:
          "Cita creada desde PWA Contador",

        start: {
          dateTime: `${cita.fecha}T${cita.hora}:00`,
          timeZone: "America/Bogota",
        },

        end: {
          dateTime: `${cita.fecha}T${cita.hora}:30`,
          timeZone: "America/Bogota",
        },
      },
    });

    console.log("Evento creado en Google Calendar");
  }
);

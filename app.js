// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv/config");

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);
// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
app.use("/api", indexRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);
app.use("/api/applications", require("./routes/application.routes"));
app.use("/api/jobs", require("./routes/job.routes"));



// app._router.stack.forEach((middleware) => {
//   if (middleware.route) {
//     console.log(
//       `📌 Registered route: ${Object.keys(middleware.route.methods)
//         .join(", ")
//         .toUpperCase()} ${middleware.route.path}`
//     );
//   } else if (middleware.name === "router") {
//     middleware.handle.stack.forEach((nestedRoute) => {
//       if (nestedRoute.route) {
//         console.log(
//           `📌 Registered route: ${Object.keys(nestedRoute.route.methods)
//             .join(", ")
//             .toUpperCase()} ${nestedRoute.route.path}`
//         );
//       }
//     });
//   }
// });


// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;

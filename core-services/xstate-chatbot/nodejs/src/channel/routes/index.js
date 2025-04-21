const express = require("express"),
  router = express.Router(),
  config = require("../../env-variables"),
  sessionManager = require("../../session/session-manager"),
  channelProvider = require("../");
remindersService = require("../../machine/service/reminders-service");

router.post("/message", async (req, res) => {
  try {
    console.log("Request URL: " + req.originalUrl);
    // console.log('Request Body Object: ' + JSON.stringify(req.body));
    console.log("Request Body Object: " + req.body);
    let reformattedMessage = await channelProvider.processMessageFromUser(req);
    if (reformattedMessage != null) sessionManager.fromUser(reformattedMessage);
  } catch (e) {
    console.log(e);
  }
  res.end();
});

router.post("/status", async (req, res) => {
  try {
    let reformattedMessage = await channelProvider.processMessageFromUser(req);
    if (reformattedMessage != null) sessionManager.fromUser(reformattedMessage);
  } catch (e) {
    console.log(e);
  }
  res.end();
});

router.post("/reminder", async (req, res) => {
  await remindersService.triggerReminders();
  res.end();
});

router.get("/health", (req, res) => res.sendStatus(200));

module.exports = router;

const os = require("os");

function getLocalExternalIp() {
  try {
    const address = require("address");
    const ip = address.ip();
    if (ip) return ip;
  } catch (_e) {
    // fallback to os.networkInterfaces
  }

  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

module.exports = function (app) {
  app.get("/__local_ip", (req, res) => {
    res.json({ ip: getLocalExternalIp() });
  });
};

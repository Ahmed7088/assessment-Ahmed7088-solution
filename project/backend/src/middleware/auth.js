const { getSession } = require("../data/store");

function optionalAuth(req, _res, next) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ")
    ? header.slice(7)
    : (req.header("x-api-token") ?? null);
  const session = getSession(token);
  if (session) req.user = session.user;
  next();
}

function requireAuth(req, res, next) {
  optionalAuth(req, res, () => {
    if (!req.user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Provide Authorization: Bearer <token>",
      });
      return;
    }
    next();
  });
}

module.exports = { optionalAuth, requireAuth };

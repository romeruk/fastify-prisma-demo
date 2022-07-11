const jwt = require("@fastify/jwt");
const fp = require("fastify-plugin");

module.exports = fp(async function (fastify) {
  fastify.register(jwt, {
    secret: process.env.JWT_SECRET || "secret-jwt",
		sign: {
			iss: process.env.JWT_ISSUER || "fastify-api",
			expiresIn: process.env.JWT_EXPIRES_IN_SECRET || "1d"
		}
  });

  fastify.decorate("authenticate", async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
});

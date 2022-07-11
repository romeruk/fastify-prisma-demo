const { PrismaClient } = require("@prisma/client");
const fp = require("fastify-plugin");

module.exports = fp(async (fastify, options, next) => {
  if (fastify.prisma) {
    return next(new Error("fastify-prisma has been already deefined"));
  }

  const prisma = new PrismaClient({
		log: ['query']
	});

  await prisma.$connect();
  fastify.log.info({ actor: "PrismaClient" }, "connected");

  fastify
    .decorate("prisma", prisma)
    .addHook("onClose", async (fastify, done) => {
      await fastify.prisma.$disconnect();
      fastify.log.info({ actor: "PrismaClient" }, "disconnected");
      done();
    });

  next();
});
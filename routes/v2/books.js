module.exports = function (fastify, opts, done) {
  fastify.get("/book", async function (request, reply) {
    reply.send({ book: "Here route v2" });

    await reply;
  });

  done();
};

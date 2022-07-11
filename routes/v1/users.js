module.exports = function (fastify, opts, done) {
  const PasswordHasher = fastify.applicationServices.passwordHasher;
  const userService = fastify.applicationServices.userService;

  fastify.post(
    "/users/signup",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            userName: { type: "string", minLength: 5, maxLength: 15 },
            firstName: { type: "string" },
            lastName: { type: "string" },
            password: { type: "string", minLength: 5, maxLength: 15 },
            confirmPassword: { const: { $data: "1/password" } },
          },
          required: [
            "userName",
            "firstName",
            "lastName",
            "password",
            "confirmPassword",
          ],
        },
      },
    },
    async function (request, reply) {
      const { userName, firstName, lastName, password } = request.body;

      const { code, ...body } = await userService.signup({
        userName,
        firstName,
        lastName,
        password,
      });

      reply.code(code).send(body);
      await reply;
    }
  );

  fastify.post(
    "/users/signin",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            userName: { type: "string", minLength: 5, maxLength: 15 },
            password: { type: "string", minLength: 5, maxLength: 15 },
          },
          required: ["userName", "password"],
        },
      },
    },
    async function (request, reply) {
      const { userName, password } = request.body;
      const { code, ...body } = await userService.signin({
        userName,
        password,
      });
      reply.code(code).send(body);
      await reply;
    }
  );

  fastify.get(
    "/users/:userName",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            userName: { type: "string", minLength: 5, maxLength: 15 },
          },
          required: ["userName"],
        },
      },
      onRequest: [fastify.authenticate],
    },
    async function (request, reply) {
      const { userName } = request.params;
      const { code, ...body } = await userService.getSingleUser(userName);
      reply.code(code).send(body);
      await reply;
    }
  );

  fastify.delete(
    "/users/:userName",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            userName: { type: "string", minLength: 5, maxLength: 15 },
          },
          required: ["userName"],
        },
      },
      onRequest: [fastify.authenticate],
    },
    async function (request, reply) {
      const jwtUser = request.user;
      const { userName } = request.params;

      const { code, ...body } = await userService.deleteSingleUser(
        userName,
        jwtUser
      );
      reply.code(code).send(body);
      await reply;
    }
  );

  fastify.patch(
    "/users/:userName",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            userName: { type: "string" },
          },
          required: ["userName"],
        },
        body: {
          type: "object",
          properties: {
            firstName: { type: "string" },
            lastName: { type: "string" },
            password: { type: "string", minLength: 5, maxLength: 15 },
            confirmPassword: { const: { $data: "1/password" } },
          },
          required: ["firstName", "lastName"],
          anyOf: [
            {
              not: { required: ["password"] },
            },
            {
              required: ["confirmPassword"],
            },
          ],
        },
      },
      onRequest: [fastify.authenticate],
    },

    async function (request, reply) {
      const { userName } = request.params;
      const { firstName, lastName, password } = request.body;

      const { code, ...body } = await userService.patchSingleUser({
        userName,
        firstName,
        lastName,
        password,
      });

      reply.code(code).send(body);
      await reply;
    }
  );

  fastify.get(
    "/users",
    {
      schema: {
        query: {
          type: "object",
          properties: {
            userNames: { type: "string" },
            page: { type: "number", minimum: 1 },
            limit: { type: "number", minimum: 1, maximum: 20 },
          },
        },
      },
      onRequest: [fastify.authenticate],
    },

    async function (request, reply) {
      const { page = 1, limit = 10, userNames } = request.query;
      const { code, ...body } = await userService.getUsers({
        page,
        limit,
        userNames,
      });
      reply.code(code).send(body);
      await reply;
    }
  );

  fastify.post(
    "/users/:userName/favorite-book",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            userName: { type: "string" },
          },
        },
        body: {
          type: "object",
          properties: {
            createFavorites: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  bookIsbn: { type: "string" },
                },
              },
              minItems: 1,
            },
            deleteFavorites: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  bookIsbn: { type: "string" },
                },
              },
              minItems: 1,
            },
          },
          oneOf: [
            {
              required: ["createFavorites"],
            },
            {
              required: ["deleteFavorites"],
            },
          ],
        },
      },
      onRequest: [fastify.authenticate],
    },

    async function (request, reply) {
      const { userName } = request.params;
      const { createFavorites, deleteFavorites } = request.body;

      const { code, ...body } = await userService.createOrDeleteFavoriteBooks({
        userName,
        createFavorites,
        deleteFavorites,
      });
      reply.code(code).send(body);
      await reply;
    }
  );

  done();
};

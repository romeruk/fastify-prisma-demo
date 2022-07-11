module.exports = function (fastify, opts, done) {
  const bookService = fastify.applicationServices.bookService;

  fastify.post(
    "/books",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            isbn: { type: "string", minLength: 10, maxLength: 13 },
            title: { type: "string", minLength: 2 },
            year: { type: "number" },
            authors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  identityCode: { type: "string", minLength: 4 },
                },
              },
            },
          },
          required: ["isbn", "title", "year"],
        },
      },
      onRequest: [fastify.authenticate],
    },
    async function (request, reply) {
      const { isbn, title, year, authors } = request.body;

      const { code, ...body } = await bookService.createBook({
        isbn,
        title,
        year,
        authors,
      });

      reply.code(code).send(body);

      await reply;
    }
  );

  fastify.get(
    "/books/:isbn",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            isbn: { type: "string" },
          },
          required: ["isbn"],
        },
      },
      onRequest: [fastify.authenticate],
    },
    async function (request, reply) {
      const { isbn } = request.params;
      const { code, ...body } = await bookService.getSingleBook(isbn);

      reply.code(code).send(body);
      await reply;
    }
  );

  fastify.patch(
    "/books/:isbn",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            isbn: { type: "string" },
          },
          required: ["isbn"],
        },
        body: {
          type: "object",
          properties: {
            title: { type: "string", minLength: 2 },
            year: { type: "number" },
            authors: {
              type: "object",
              properties: {
                connect: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      identityCode: { type: "string", minLength: 4 },
                    },
                  },
                },
                delete: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      identityCode: { type: "string", minLength: 4 },
                    },
                  },
                },
              },
            },
          },
          required: ["title", "year"],
        },
      },
      onRequest: [fastify.authenticate],
    },
    async function (request, reply) {
      const { isbn } = request.params;
      const { title, year, authors } = request.body;

      const { code, ...body } = await bookService.updateSingleBook({
        isbn,
        title,
        year,
        authors,
      });

      reply.code(code).send(body);
      await reply;
    }
  );

  fastify.delete(
    "/books/:isbn",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            isbn: { type: "string", minLength: 10, maxLength: 13 },
          },
          required: ["isbn"],
        },
      },
      onRequest: [fastify.authenticate],
    },
    async function (request, reply) {
      const { isbn } = request.params;

      const { code, ...body } = await bookService.deleteSingleBook(isbn);

      reply.code(code).send(body);
      await reply;
    }
  );

  fastify.get(
    "/books",
    {
      schema: {
        query: {
          type: "object",
          properties: {
            authors: { type: "string" },
            title: { type: "string" },
            isbn: { type: "string" },
            sort: {
              enum: ["asc", "desc"],
            },
            orderBy: { type: "string" },
            limit: { type: "number", minimum: 1 },
            page: { type: "number", minimum: 1 },
          },
          if: {
            properties: {
              sort: { const: { $data: "1/sort" } },
            },
            required: ["sort"],
          },
          then: { required: ["orderBy"] },
        },
      },
      onRequest: [fastify.authenticate],
    },
    async function (request, reply) {
      const {
        limit = 20,
        page = 1,
        authors,
        orderBy,
        sort,
        title,
        isbn,
      } = request.query;

      const { code, ...body } = await bookService.getBooks({
        limit,
        page,
        authors,
        orderBy,
        sort,
        title,
        isbn,
      });

      reply.code(code).send(body);
      await reply;
    }
  );

  done();
};

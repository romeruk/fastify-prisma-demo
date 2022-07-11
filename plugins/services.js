const fp = require("fastify-plugin");
const PasswordHasher = require("../services/PasswordHasher");

const userRepository = require("../repositories/prisma/UserRepository");
const bookRepository = require("../repositories/prisma/BookRepository");
const UserService = require("../services/UserService");
const BookService = require("../services/BookService");

module.exports = fp((fastify, options, done) => {
  fastify.decorate("applicationServices", {
    passwordHasher: new PasswordHasher(),
    userService: new UserService({
      userRepository: new userRepository({
        prisma: fastify.prisma,
      }),
      passwordHasher: new PasswordHasher(),
      jwt: fastify.jwt,
    }),
    bookService: new BookService({
			bookRepository: new bookRepository({
        prisma: fastify.prisma,
      }),
    }),
  });

  done();
});

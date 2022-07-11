class UserService {
  constructor({ userRepository, passwordHasher, jwt }) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.jwt = jwt;
  }

  async signup({ userName, firstName, lastName, password }) {
    const user = await this.userRepository.findUser(userName, {
      user_name: true,
    });

    if (user) {
      return {
        succes: false,
        message: "User already exists",
        code: 400,
      };
    }

    const hashedPassword = await this.passwordHasher.hash(password);

    await this.userRepository.createUser({
      userName,
      firstName,
      lastName,
      hashedPassword,
    });

    return { code: 200, success: true, message: "You can login now" };
  }

  async signin({ userName, password }) {
    const invalidPassOrUserName = {
      succes: false,
      message: "Invalid username or password",
      code: 401,
    };

    const user = await this.userRepository.findUser({
      userName,
    });

    if (!user) {
      return invalidPassOrUserName;
    }

    const validPassword = await this.passwordHasher.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return invalidPassOrUserName;
    }

    if (user.status !== "ACTIVE") {
      return {
        succes: false,
        message: `You are not allowed to login, status ${user.status}`,
        code: 401,
      };
    }

    const token = this.jwt.sign({
      userName: user.user_name,
      firstName: user.first_name,
      lastName: user.last_name,
      status: user.status,
    });

    return {
      succes: true,
      token,
      code: 200,
    };
  }

  async getSingleUser(userName) {
    //TODO: How to execute this query in prisma orm ?

    // const result = await this.prisma.$queryRaw`
    // SELECT u.user_name, u.first_name, u.last_name, b.title, a.first_name as author_first_name, a.last_name as author_last_name FROM users u
    // left join favorite_books fb on u.user_name = fb.user_name
    // left join books b on fb.book_isbn = b.isbn
    // left join authors_on_books aob on b.isbn = aob.book_isbn
    // left join authors a on aob.author_identity_code = a.identity_code
    // where u.user_name = ${userName}
    // `;

    const user = await this.userRepository.findUser({
      userName,
      select: {
        first_name: true,
        last_name: true,
        status: true,
        created_at: true,
        updated_at: true,
        favorite_books: true, // can I join books if I don't have forein key in prisma ?
      },
    });

    // definitely worse idea to use one more query and then js loop to join data

    // const userFavoriteBooks = user.favorite_books.map((b) => b.book_isbn);

    // const books = await this.prisma.books.findMany({
    //   where: {
    //     isbn: { in: userFavoriteBooks },
    //   },
    //   include: {
    //     authors: {
    //       select: {
    //         author: true,
    //       },
    //     },
    //   },
    // });

    // let i = 0;

    // for (const fb of user.favorite_books) {
    //   const find = books.find((b) => b.isbn === fb.book_isbn);
    //   if (find) {
    //     user.favorite_books[i] = find;
    //   }
    //   i++;
    // }

    if (!user) {
      return {
        succes: false,
        message: `User ${userName} not found`,
        code: 404,
      };
    }

    return {
      succes: true,
      user,
      // result,
      code: 200,
    };
  }

  async deleteSingleUser(userName, jwtData) {
    const user = await this.userRepository.findUser({ userName });

    if (!user) {
      return {
        succes: false,
        message: `User ${userName} not found`,
        code: 404,
      };
    }

    if (jwtData.userName === user.user_name) {
      return {
        succes: false,
        message: `you cannot delete yourself`,
        code: 400,
      };
    }

    const updatedUser = await this.userRepository.updateUser({
      userName,
      data: { status: "DELETED" },
      select: {
        first_name: true,
        last_name: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    return {
      succes: true,
      message: `User ${userName} has been deleted`,
      user: updatedUser,
      code: 200,
    };
  }

  async patchSingleUser({ userName, firstName, lastName, password }) {
    const user = await this.userRepository.findUser({ userName });

    if (!user) {
      return {
        succes: false,
        message: `User ${userName} not found`,
        code: 404,
      };
    }

    const data = {
      first_name: firstName,
      last_name: lastName,
    };

    if (password) {
      password = await this.hashedPassword.hash(password);
      data.password = password;
    }

    const updatedUser = await this.userRepository.updateUser({
      userName,
      data,
      select: {
        user_name: true,
        first_name: true,
        last_name: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    return {
      succes: true,
      message: "User has been updated",
      user: updatedUser,
      code: 200,
    };
  }

  async getUsers({ page, limit, userNames }) {
    const skip = limit * (page - 1);
    const take = limit;

    const where = {};

    if (userNames) {
      const splitUserNames = userNames.split(",");
      where.user_name = { in: splitUserNames };
    }

    const totalDocuments = await this.userRepository.usersCount(where);

    const users = await this.userRepository.findUsers({
      skip,
      take,
      where,
    });

    return {
      succes: true,
      users,
      totalDocuments,
      totalPages: Math.ceil(totalDocuments / limit),
      limit,
      currentPage: page,
      code: 200,
    };
  }

  async createOrDeleteFavoriteBooks({
    userName,
    createFavorites,
    deleteFavorites,
  }) {
    const user = await this.userRepository.findUser({ userName });

    if (!user) {
      return {
        succes: false,
        message: `User ${userName} not found`,
        code: 404,
      };
    }

    const data = {
      favorite_books: {},
    };

    if (createFavorites?.length) {
      data.favorite_books.create = createFavorites.map((book) => {
        return {
          book_isbn: book.bookIsbn,
        };
      });
    }

    if (deleteFavorites?.length) {
      data.favorite_books.deleteMany = deleteFavorites.map((book) => {
        return {
          book_isbn: book.bookIsbn,
        };
      });
    }

    const updatedUser = await this.userRepository.updateUser({
      userName,
      data,
      select: {
        user_name: true,
        first_name: true,
        last_name: true,
        status: true,
        created_at: true,
        updated_at: true,
        favorite_books: true,
      },
    });

    return {
      success: true,
      user: updatedUser,
      code: 200,
    };
  }
}

module.exports = UserService;

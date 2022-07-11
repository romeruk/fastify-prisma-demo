class UserRepository {
  constructor({ prisma }) {
    this.prisma = prisma;
  }

  async findUser({ userName, select, include }) {
    const findUnique = {
      where: {
        user_name: userName,
      },
    };

    if (select) {
      findUnique.select = select;
    }

    if (include) {
      findUnique.include = include;
    }

    if (!select && !include) {
      findUnique.select = {
        user_name: true,
      };
    }

    const user = await this.prisma.users.findUnique(findUnique);

    return user;
  }

  async createUser({ userName, firstName, lastName, hashedPassword }) {
    await this.prisma.users.create({
      data: {
        user_name: userName,
        first_name: firstName,
        last_name: lastName,
        password: hashedPassword,
      },
    });
  }

  async updateUser({ userName, data, select, include }) {
    const update = {
      where: { user_name: userName },
      data,
    };

    if (select) {
      update.select = select;
    }

    if (include) {
      update.include = include;
    }

    if (!select && !include) {
      update.select = {
        first_name: true,
        last_name: true,
        status: true,
        created_at: true,
        updated_at: true,
      };
    }

    const user = await this.prisma.users.update(update);

    return user;
  }

  async usersCount(where) {
    const count = await this.prisma.users.count({
      where,
    });

    return count;
  }

  async findUsers({ skip, take, where, select, include }) {
    const findMany = {
      skip,
      take,
      where,
    };

    if (select) {
      findMany.select = select;
    }

    if (include) {
      findMany.include = include;
    }

    if (!select && !include) {
      findMany.select = {
        first_name: true,
        last_name: true,
        status: true,
        created_at: true,
        updated_at: true,
      };
    }

    const users = await this.prisma.users.findMany(findMany);

    return users;
  }
}

module.exports = UserRepository;

import { DataTypes, Sequelize, Model, Optional } from "sequelize";

interface UserAttributes {
  id: string;
  username: string;
  password: string;
  email: string;
  phone?: string;
  role: string;
  created_at?: Date;
  updated_at?: Date;
}

interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    "id" | "phone" | "created_at" | "updated_at"
  > {}

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: string;
  public username!: string;
  public password!: string;
  public email!: string;
  public phone?: string;
  public role!: string;
  public created_at?: Date;
  public updated_at?: Date;
}

export const UserFactory = (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: "Users",
    }
  );

  return User;
};

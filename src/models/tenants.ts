import { DataTypes, Sequelize, Model } from "sequelize";

interface TenantsAttributes {
  id: string;
  user_id: string;
  first_name: string;
  last_name?: string;
  landlord_id: string;
  phone: string;
  email?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class Tenants
  extends Model<TenantsAttributes>
  implements TenantsAttributes
{
  public id!: string;
  public user_id!: string;
  public first_name!: string;
  public last_name?: string;
  public landlord_id!: string;
  public phone!: string;
  public email?: string;
  public created_at!: Date;
  public updated_at?: Date;
}

export const TenantsFactory = (sequelize: Sequelize) => {
  Tenants.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      first_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING(255),
      },
      landlord_id: {
        type: DataTypes.UUID,
        references: {
          model: "customers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      phone: {
        type: DataTypes.STRING(50),
      },
      email: {
        type: DataTypes.STRING(50),
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
      tableName: "tenants",
    }
  );

  return Tenants;
};

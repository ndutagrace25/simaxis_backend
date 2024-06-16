import { Model, DataTypes, Sequelize } from "sequelize";

interface CustomerAttributes {
  id: string;
  user_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  national_id: number;
  location?: string;
  lat?: number;
  long?: number;
  plot_number?: string;
  is_active?: boolean;
  is_verified?: boolean;
  is_synced_to_stron?: boolean;
  customer_number?: number;
  building_name?: string;
  created_at?: Date;
  updated_at?: Date;
  User?: { dataValues?: { phone: string; email: string } };
}

export class Customer
  extends Model<CustomerAttributes>
  implements CustomerAttributes
{
  public id!: string;
  public user_id!: string;
  public first_name!: string;
  public middle_name?: string;
  public last_name!: string;
  public national_id!: number;
  public location?: string;
  public lat?: number;
  public long?: number;
  public plot_number?: string;
  public is_active?: boolean;
  public is_verified?: boolean;
  public is_synced_to_stron?: boolean;
  public customer_number!: number;
  public building_name?: string;
  public created_at?: Date;
  public updated_at?: Date;
}

export const CustomerFactory = (sequelize: Sequelize) => {
  Customer.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      first_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      middle_name: {
        type: DataTypes.STRING(50),
      },
      last_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      national_id: {
        type: DataTypes.INTEGER,
      },
      location: {
        type: DataTypes.STRING(50),
      },
      building_name: {
        type: DataTypes.STRING(50),
      },
      lat: {
        type: DataTypes.FLOAT,
      },
      long: {
        type: DataTypes.FLOAT,
      },
      plot_number: {
        type: DataTypes.STRING,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
      },
      is_synced_to_stron: {
        type: DataTypes.BOOLEAN,
      },
      customer_number: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique: true,
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
      tableName: "customers",
      hooks: {
        beforeCreate: (customer) => {
          customer.customer_number = Math.floor(Math.random() * 1000000);
        },
      },
    }
  );

  return Customer;
};

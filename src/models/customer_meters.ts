import { Model, DataTypes, Sequelize } from "sequelize";

interface CustomerMeterAttributes {
  id: string;
  customer_id: string;
  meter_id: string;
  is_synced_to_stron?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class CustomerMeter
  extends Model<CustomerMeterAttributes>
  implements CustomerMeterAttributes
{
  public id!: string;
  public customer_id!: string;
  public meter_id!: string;
  public is_synced_to_stron?: boolean;
  public created_at?: Date;
  public updated_at?: Date;
}

export const CustomerMeterFactory = (sequelize: Sequelize) => {
  CustomerMeter.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      customer_id: {
        type: DataTypes.UUID,
        references: {
          model: "customers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      meter_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
          model: "meters",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      is_synced_to_stron: {
        type: DataTypes.BOOLEAN,
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
      tableName: "customer_meters",
    }
  );

  return CustomerMeter;
};

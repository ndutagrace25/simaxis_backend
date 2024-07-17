import { Model, DataTypes, Sequelize } from "sequelize";

export interface PaymentAttributes {
  id: string;
  customer_id: string;
  meter_id: string;
  payment_date?: Date;
  amount: number;
  payment_method?: string;
  payment_code?: string;
  created_at?: Date;
  updated_at?: Date;
  phone_number?: string;
  meter_number?: string;
  generated_manually?: string;
}

export class Payments
  extends Model<PaymentAttributes>
  implements PaymentAttributes
{
  public id!: string;
  public customer_id!: string;
  public meter_id!: string;
  public payment_date?: Date;
  public amount!: number;
  public payment_method?: string;
  public payment_code?: string;
  public meter_number?: string;
  public phone_number?: string;
  public generated_manually?: string;
  public created_at?: Date;
  public updated_at?: Date;
}

export const PaymentFactory = (sequelize: Sequelize) => {
  Payments.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      customer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "customers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      meter_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "meters",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      payment_date: {
        type: DataTypes.DATE,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      payment_method: {
        type: DataTypes.STRING,
      },
      phone_number: {
        type: DataTypes.STRING,
      },
      generated_manually: {
        type: DataTypes.BOOLEAN,
      },
      meter_number: {
        type: DataTypes.STRING,
      },
      payment_code: {
        type: DataTypes.STRING,
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
      tableName: "payments",
    }
  );

  return Payments;
};

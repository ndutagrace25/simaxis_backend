import { Model, DataTypes, Sequelize } from "sequelize";

export interface EsperanzaPaymentAttributes {
  id?: string;
  payment_date: Date;
  amount: number;
  payment_mode: string;
  reference?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export class EsperanzaPayment
  extends Model<EsperanzaPaymentAttributes>
  implements EsperanzaPaymentAttributes
{
  public id!: string;
  public payment_date!: Date;
  public amount!: number;
  public payment_mode!: string;
  public reference?: string;
  public created_at?: Date;
  public created_by?: string;
  public updated_at?: Date;
  public updated_by?: string;
}

export const EsperanzaPaymentFactory = (sequelize: Sequelize) => {
  EsperanzaPayment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      payment_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      payment_mode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      reference: {
        type: DataTypes.STRING,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      created_by: {
        type: DataTypes.UUID,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_by: {
        type: DataTypes.UUID,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: "esperanza_payments",
    }
  );

  return EsperanzaPayment;
};

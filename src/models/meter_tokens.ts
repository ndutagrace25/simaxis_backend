import { Model, DataTypes, Sequelize } from "sequelize";

interface MeterTokensAttributes {
  id: string;
  token: string;
  meter_id: string;
  issue_date?: Date;
  amount: number;
  token_type?: string;
  created_at?: Date;
  updated_at?: Date;
  total_units?: number;
  generated_manually?: string;
}

export class MeterToken
  extends Model<MeterTokensAttributes>
  implements MeterTokensAttributes
{
  public id!: string;
  public token!: string;
  public meter_id!: string;
  public issue_date?: Date;
  public amount!: number;
  public token_type?: string;
  public total_units?: number;
  public generated_manually?: string;
  public created_at?: Date;
  public updated_at?: Date;
}

export const MeterTokenFactory = (sequelize: Sequelize) => {
  MeterToken.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      token: {
        type: DataTypes.UUID,
        allowNull: false,
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
      issue_date: {
        type: DataTypes.DATE,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      total_units: {
        type: DataTypes.FLOAT,
      },
      token_type: {
        type: DataTypes.STRING,
      },
      generated_manually: {
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
      tableName: "meter_tokens",
    }
  );

  return MeterToken;
};

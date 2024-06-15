import { DataTypes, Sequelize, Model } from "sequelize";

interface MeterTypesttributes {
  id: string;
  name: string;
  description?: string;
  type?: number;
  created_at?: Date;
  updated_at?: Date;
}

export class MeterTypes
  extends Model<MeterTypesttributes>
  implements MeterTypesttributes
{
  public id!: string;
  public name!: string;
  public description?: string;
  public type?: number;
  public created_at!: Date;
  public updated_at?: Date;
}

export const MeterTypesFactory = (sequelize: Sequelize) => {
  MeterTypes.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.STRING(255),
      },
      type: {
        type: DataTypes.INTEGER,
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
      tableName: "meter_types",
    }
  );

  return MeterTypes;
};

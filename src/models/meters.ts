import { Model, DataTypes, Sequelize } from "sequelize";

interface MeterAttributes {
  id: string;
  meter_type_id: string;
  serial_number: number;
  county_number: number;
  is_synced_to_stron?: boolean;
  tamper_value?: string;
  credit_value?: string;
  created_at?: Date;
  updated_at?: Date;
  MeterType?: { dataValues: { name: string; type: number } };
}

export class Meter extends Model<MeterAttributes> implements MeterAttributes {
  public id!: string;
  public meter_type_id!: string;
  public serial_number!: number;
  public county_number!: number;
  public is_synced_to_stron?: boolean;
  public tamper_value?: string;
  public credit_value?: string;
  public created_at?: Date;
  public updated_at?: Date;
}

export const MeterFactory = (sequelize: Sequelize) => {
  Meter.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      meter_type_id: {
        type: DataTypes.UUID,
        references: {
          model: "meter_types",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      serial_number: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
      },
      county_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      tamper_value: {
        type: DataTypes.STRING(150),
      },
      credit_value: {
        type: DataTypes.STRING(150),
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
      tableName: "meters",
    }
  );

  return Meter;
};

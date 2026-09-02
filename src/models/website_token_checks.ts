import { Model, DataTypes, Sequelize } from "sequelize";

interface WebsiteTokenCheckAttributes {
  id?: string;
  meter_number: string;
  created_at?: Date;
}

export class WebsiteTokenCheck
  extends Model<WebsiteTokenCheckAttributes>
  implements WebsiteTokenCheckAttributes
{
  public id!: string;
  public meter_number!: string;
  public created_at?: Date;
}

export const WebsiteTokenCheckFactory = (sequelize: Sequelize) => {
  WebsiteTokenCheck.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      meter_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: "website_token_checks",
    }
  );

  return WebsiteTokenCheck;
};

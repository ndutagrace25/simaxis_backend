import { Tenant } from "../models";

const getAllTenants = async () => {
  const tenants = await Tenant.findAll({
    attributes: [
      "id",
      "first_name",
      "last_name",
      "email",
      "phone",
      "created_at",
      "updated_at",
    ],
  });
  return tenants;
};

const create = async (tenantDetails: {
  id: string;
  user_id: string;
  first_name: string;
  email: string;
  phone: string;
  landlord_id: string;
}) => {
  const tenant = await Tenant.create(tenantDetails);

  return tenant;
};

export = {
  getAllTenants,
  create,
};

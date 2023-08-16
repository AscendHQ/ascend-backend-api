import { UpdateQuery } from "mongoose";
import { IOrganization } from "../../interface";
import OrganizationModel from "../../models/organization";

export const CreateOrganization = async (
  payload: UpdateQuery<IOrganization>
) => {
  const organization = await OrganizationModel.create(payload);

  return organization;
};

import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/responseHandler";
import {
  AddStaff,
  DeleteStaffById,
  GetAllStaff,
  GetStaffById,
  UpdateStaffById,
} from "../services/staff.services";
import { AccountExists, CreateAccount } from "../services/auth.services";
import {
  CreatePermission,
  UpdatePermission,
  UpdatePermissionById,
} from "../services/permission.services";
import { ICustomInterface } from "../interface";

export const getAllStaff = async (req: Request, res: Response) => {
  try {
    const { limit = 10, page = 1, staff_org_id, staff_email } = req.query;

    const query: ICustomInterface = {};

    const options: ICustomInterface = {
      limit: Number(limit),
      page: Number(page),
    };

    if (staff_email) {
      query["bio_data.email"] = {
        $regex: new RegExp(staff_email as string, "i"),
      };
    }

    if (staff_org_id) {
      query.staff_org_id = staff_org_id;
    }

    const response = await GetAllStaff(query, options);

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const addStaff = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const {
      staff_org_id,
      address,
      next_of_kin,
      picture,
      bio_data,
      password,
      official_information,
      permissions,
    } = req.body;

    // check if having access

    let new_account, permission;

    if (bio_data.email) {
      bio_data.email = bio_data.email.toLowerCase();

      if (await AccountExists(bio_data.email)) {
        return errorResponse(res, 409, "Conflicting data");
      }

      permission = await CreatePermission({
        ...permissions,
        organization: account.organization_id,
      });

      new_account = await CreateAccount({
        first_name: bio_data.first_name,
        last_name: bio_data.last_name,
        email: bio_data.email,
        password,
        organization: account.organization_id,
        permission: permission._id,
      });

      // send verification email to the staff
    }

    const response = await AddStaff({
      staff_org_id,
      address,
      next_of_kin,
      picture,
      bio_data,
      official_information,
      permissions: permission!._id,
      account: new_account ? new_account._id : null,
      organization: account.organization_id,
    });

    await UpdatePermissionById(permission!._id, { staff: response._id });

    return successResponse(res, 201, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getStaffById = async (req: Request, res: Response) => {
  try {
    const { staff_id } = req.params;

    //check if having access

    const response = await GetStaffById(staff_id);
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateStaffById = async (req: Request, res: Response) => {
  try {
    const { staff_id } = req.params;
    const {
      address,
      next_of_kin,
      picture,
      bio_data,
      password,
      official_information,
      permissions,
    } = req.body;

    // check if having access

    if (permissions) {
      await UpdatePermission(staff_id, { ...permissions });
    }

    const response = await UpdateStaffById(staff_id, {
      address,
      next_of_kin,
      picture,
      bio_data,
      password,
      official_information,
    });

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteStaffById = async (req: Request, res: Response) => {
  try {
    const { staff_id } = req.params;

    // check if having access

    const response = await DeleteStaffById(staff_id);
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

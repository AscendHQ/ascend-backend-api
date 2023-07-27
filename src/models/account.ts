import { model, Schema } from "mongoose";
import { IAccount, IAccountDocument } from "../interface";

const accountSchemaFields: Record<keyof IAccount, any> = {
  first_name: { type: String },
  last_name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  organization: {
    type: Schema.Types.ObjectId,
    ref: "organization",
    required: true,
  },
};

const accountSchema = new Schema(accountSchemaFields, {
  timestamps: true,
});

const AccountModel = model<IAccountDocument>("account", accountSchema);
export default AccountModel;

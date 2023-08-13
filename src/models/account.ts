import { model, Schema } from "mongoose";
import { ESystemAccessLevel, IAccount, IAccountDocument } from "../interface";

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
  access_level: { type: Number, default: ESystemAccessLevel.NORMAL_USER },
  is_email_verified: { type: Boolean, default: false },
  is_verified: { type: Boolean, default: false },
  verification_token: { type: String },
  token_validity: { type: Date },
  last_login: { type: Date },
};

const accountSchema = new Schema(accountSchemaFields, {
  timestamps: true,
});

const AccountModel = model<IAccountDocument>("account", accountSchema);
export default AccountModel;

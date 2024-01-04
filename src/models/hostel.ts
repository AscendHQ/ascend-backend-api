import { model, Schema } from "mongoose";
import {
  EClassTerm,
  EGender,
  EHostelAmenities,
  EHostelRoomType,
  ERoomNamingConvention,
  IHostels,
  IHostelsDocument,
} from "../interface";

const hostelSchemaFields: Record<keyof IHostels, any> = {
  organization: {
    type: Schema.Types.ObjectId,
    ref: "organization",
    required: true,
  },
  name: { type: String, required: true },
  capacity: { type: Number, default: 0 },
  gender_type: {
    type: String,
    enum: EGender,
    required: true,
    default: EGender.FEMALE,
  },
  room_type: {
    type: String,
    enum: EHostelRoomType,
    default: EHostelRoomType.DOUBLE,
  },
  available_amenities: [
    {
      item: {
        type: String,
        enum: EHostelAmenities,
        default: EHostelAmenities.BEDS,
      },
      is_available: { type: Boolean, default: true },
    },
  ],
  staff_name: { type: String },
  staff_contact_number: { type: String },
  other_notes: { type: String },
  students: [{ type: Schema.Types.ObjectId, ref: "student" }],
  room_naming_convention: {
    type: String,
    enum: ERoomNamingConvention,
    default: ERoomNamingConvention.NUMBER,
  },
  room_fee: { type: Number, default: 0 },
  room_fee_payment_period: {
    type: String,
    enum: EClassTerm,
  },
  is_active: { type: Boolean, default: true },
};

const hostelSchema = new Schema(hostelSchemaFields, {
  timestamps: true,
});

const HostelModel = model<IHostelsDocument>("hostel", hostelSchema);
export default HostelModel;

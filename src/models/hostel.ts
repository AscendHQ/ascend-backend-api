import { model, Schema } from "mongoose";
import {
  EGender,
  EHostelAmenities,
  EHostelRoomType,
  ERoomFeePaymentPeriod,
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
  students: [{ type: Schema.Types.ObjectId, ref: "student" }],
  staff: [{ type: Schema.Types.ObjectId, ref: "staff" }],
  capacity: { type: Number, default: 0 },
  number_of_students: { type: Number, default: 0 },
  gender: {
    type: String,
    enum: EGender,
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
  other_notes: { type: String },
  room_naming_convention: {
    type: String,
    enum: ERoomNamingConvention,
    default: ERoomNamingConvention.NUMBER,
  },
  room_fee: { type: Number, default: 0 },
  room_fee_payment_period: {
    type: String,
    enum: ERoomFeePaymentPeriod,
    default: ERoomFeePaymentPeriod.TERM,
  },
  is_active: { type: Boolean, default: false },
};

const hostelSchema = new Schema(hostelSchemaFields, {
  timestamps: true,
});

const HostelModel = model<IHostelsDocument>("hostel", hostelSchema);
export default HostelModel;

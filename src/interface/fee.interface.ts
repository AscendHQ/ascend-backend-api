import { Document } from "mongoose";

export enum EInvoiceStatus {
  UNPAID = "unpaid",
  PARTIAL = "partial",
  PAID = "paid",
}

export enum EPaymentMethod {
  CASH = "cash",
  BANK_TRANSFER = "bank_transfer",
  POS = "pos",
  ONLINE = "online",
  OTHER = "other",
}

export interface IFeeItem {
  label: string;
  amount: number;
}

export interface IFeeStructure {
  organization: string;
  name: string;
  class: string;
  session: string;
  term: string;
  items: IFeeItem[];
  total_amount: number;
  due_date: Date;
  is_active: boolean;
  created_by?: string;
}

export interface IFeeStructureDocument extends IFeeStructure, Document {}

export interface IInvoice {
  organization: string;
  fee_structure: string;
  student: string;
  class: string;
  session: string;
  term: string;
  invoice_number: string;
  items: IFeeItem[];
  total_amount: number;
  amount_paid: number;
  status: EInvoiceStatus;
  due_date: Date;
}

export interface IInvoiceDocument extends IInvoice, Document {}

export interface IPayment {
  organization: string;
  invoice: string;
  student: string;
  amount: number;
  method: EPaymentMethod;
  reference: string;
  receipt_number: string;
  note?: string;
  paid_at: Date;
  recorded_by?: string;
  provider?: string;
  channel?: string;
}

export interface IPaymentDocument extends IPayment, Document {}

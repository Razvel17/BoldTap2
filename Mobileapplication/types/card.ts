export type BarcodeType = "QR" | "CODE128" | "CODE39" | "EAN13";

export interface Card {
  id: string;
  name: string;
  issuer: string;
  barcodeValue: string;
  barcodeType: BarcodeType;
  color: string;
  createdAt: number;
}

export interface CardFormData {
  name: string;
  issuer: string;
  barcodeValue: string;
  barcodeType: BarcodeType;
  color: string;
}

export interface DeviceDetails {
  id: string;
  device: string;
  provider: string;
  model: string;
  type: string;
  os?: string | null;
  specifications?: string;
  ram?: string | null;
  availability: string;
  productId: string;
  price: number;
  dateOfPurchase: Date;
  comments?: string;
  accessoryType?: string;
  deviceNumber: string;
}

export interface IUpdateDeviceDetails {
  device: string | null;
  provider: string | null;
  model: string | null;
  type: string | null;
  os?: string | null;
  specifications?: string | null;
  ram?: string | null;
  availability: string | null;
  productId: string | null;
  price: number | null;
  dateOfPurchase: Date | null;
  comments?: string | null;
  accessoryType?: string | null;
  deviceNumber: string | null;
}

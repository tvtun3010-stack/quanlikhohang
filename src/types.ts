/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  maHang: string; // SKU
  tenHang: string;
  loai: string;
  donVi: string;
  giaNhap: number;
  giaXuat: number;
  soLuongTon: number;
  dinhMuc: number; // Ngưỡng cảnh báo
}

export interface Transaction {
  maPhieu: string;
  loaiPhieu: 'NHAP' | 'XUAT';
  ngayTao: string;
  maHang: string;
  soLuong: number;
  donGia: number;
  tongTien: number;
  lyDo?: string;
}

export type View = 'DASHBOARD' | 'PRODUCTS' | 'INVENTORY_IN' | 'INVENTORY_OUT' | 'HISTORY';

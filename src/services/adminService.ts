import API from "./api";

export interface AdminOrder {
  id: number;
  userEmail: string;
  totalAmount: number;
  status: string;
  orderDate: string;
  items: AdminOrderItem[];
}

export interface AdminOrderItem {
  id: number;
  productName: string;
  price: number;
  quantity: number;
}

export const getAllOrdersAPI = async (): Promise<AdminOrder[]> => {
  const res = await API.get("/orders/admin/allOrders");
  return res.data.data;
};

export const updateOrderStatusAPI = async (id: number, status: string): Promise<AdminOrder> => {
  const res = await API.put(`/orders/admin/${id}/status`, status, {
    headers: { "Content-Type": "text/plain" }
  });
  return res.data.data;
};

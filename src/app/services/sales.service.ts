import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

export interface SaleItemPayload {
  product_id: number;
  quantity: number;
}

export interface SaleDetail {
  product: string;
  quantity: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  total: number;
  created_at: string;
  details: SaleDetail[];
}

export interface CreateSaleResponse {
  message: string;
  sale_id: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {

  urlBase = environment.apiUrl;
  http = inject(HttpClient);

  listarProductos(){
    return this.http.get<Product[]>(`${this.urlBase}/products`);
  }

  listar(){
    return this.http.get<Sale[]>(`${this.urlBase}/sales`);
  }

  crear(datos: { user_id: number; items: SaleItemPayload[] }) {
    return this.http.post<CreateSaleResponse>(`${this.urlBase}/sales`, datos);
  }

  eliminar(id: number) {
    return this.http.delete<{ message: string }>(`${this.urlBase}/sales/${id}`);
  }
}

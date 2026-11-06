import { Component, OnInit, inject } from '@angular/core';
import { Swetalert2Service } from 'src/app/core/servicios/swetalert2.service';
import { Product, Sale, SalesService } from 'src/app/services/sales.service';

interface CaritoCompra {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
}

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.scss']
})
export class VentasComponent implements OnInit {

  private salesService = inject(SalesService);
  private alert = inject(Swetalert2Service);

  productos: Product[] = [];
  ventas: Sale[] = [];
  carrito: CaritoCompra[] = [];

  cargandoProductos = false;
  cargandoVentas = false;
  guardandoVenta = false;

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarVentas();
  }

  // para cargar llños productos
  cargarProductos(): void {
    this.cargandoProductos = true;
    this.salesService.listarProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.cargandoProductos = false;
      },
      error: () => {
        this.cargandoProductos = false;
        this.alert.toastError('No se pudieron cargar los productos.');
      }
    });
  }

  // Cargar ventas
  cargarVentas(): void {
    this.cargandoVentas = true;
    this.salesService.listar().subscribe({
      next: (ventas) => {
        this.ventas = ventas;
        this.cargandoVentas = false;
      },
      error: () => {
        this.cargandoVentas = false;
        this.alert.toastError('No se pudieron cargar las ventas.');
      }
    });
  }

  get total(){
    return this.carrito.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }

  // Cantidad actual de un producto dentro del carrito
  cantidadEnCarrito(productId: number): number {
    return this.carrito.find(item => item.product_id === productId)?.quantity ?? 0;
  }

  // Stock que queda visible en la card
  stockDisponible(producto: Product): number {
    return producto.stock - this.cantidadEnCarrito(producto.id);
  }

  // Boton mas para el card
  incrementar(producto: Product){
    const existente = this.carrito.find(item => item.product_id === producto.id);
    const cantidadActual = existente ? existente.quantity : 0;

    if (cantidadActual + 1 > producto.stock) {
      this.alert.warning(`Solo hay ${producto.stock} unidades disponibles de ${producto.name}.`);
      return;
    }

    if (existente) {
      existente.quantity += 1;
    } else {
      this.carrito.push({
        product_id: producto.id,
        name: producto.name,
        price: Number(producto.price),
        quantity: 1,
      });
    }
  }

  // Botón menos del card
  decrementar(producto: Product){
    const existente = this.carrito.find(item => item.product_id === producto.id);
    if (!existente) return;

    if (existente.quantity <= 1) {
      this.quitarDelCarrito(producto.id);
    } else {
      existente.quantity -= 1;
    }
  }

  // Anotar directo el numero
  actualizarCantidad(producto: Product, valor: string){
    let cantidad = Math.floor(Number(valor));

    if (!cantidad || cantidad <= 0) {
      this.quitarDelCarrito(producto.id);
      return;
    }

    if (cantidad > producto.stock) {
      this.alert.warning(`Solo hay ${producto.stock} unidades disponibles de ${producto.name}.`);
      cantidad = producto.stock;
    }

    const existente = this.carrito.find(item => item.product_id === producto.id);

    if (existente) {
      existente.quantity = cantidad;
    } else {
      this.carrito.push({
        product_id: producto.id,
        name: producto.name,
        price: Number(producto.price),
        quantity: cantidad,
      });
    }
  }

  quitarDelCarrito(productId: number){
    this.carrito = this.carrito.filter(item => item.product_id !== productId);
  }

  async registrarVenta(){
    if (this.carrito.length === 0) {
      this.alert.warning('Agrega al menos un producto a la venta.');
      return;
    }

    const confirmado = await this.alert.confirmRegistrarVenta(this.total, this.carrito.length);
    if (!confirmado) return;

    this.guardandoVenta = true;
    this.alert.loading('Registrando venta...');

    this.salesService.crear({
      user_id: 1,
      items: this.carrito.map(item => ({ product_id: item.product_id, quantity: item.quantity })),
    }).subscribe({
      next: (res) => {
        this.guardandoVenta = false;
        this.alert.close();
        this.alert.success(`${res.message}. Total: Bs ${res.total}`);
        this.carrito = [];
        this.cargarProductos();
        this.cargarVentas();
      },
      error: (err) => {
        this.guardandoVenta = false;
        this.alert.close();

        if (err.status === 422 && err.error?.errors) {
          this.alert.validationErrors(err.error.errors);
        } else {
          this.alert.error(err.error?.message ?? 'Ocurrió un error al registrar la venta.');
        }
      }
    });
  }
  // Veliminar venta
  async eliminarVenta(venta: Sale) {
    const confirmado = await this.alert.confirmDelete(`Se eliminará la venta #${venta.id}.`);
    if (!confirmado) return;

    this.salesService.eliminar(venta.id).subscribe({
      next: (res) => {
        this.alert.toastSuccess(res.message);
        this.cargarVentas();
      },
      error: (err) => {
        this.alert.error(err.error?.message ?? 'No se pudo eliminar la venta.');
      }
    });
  }
}

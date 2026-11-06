import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class Swetalert2Service {

  // venta creada correctamente
  success(mensaje: string, title: string = '¡Listo!') {
    return Swal.fire({
      icon: 'success',
      title,
      text: mensaje,
      confirmButtonColor: '#0d6efd',
      timer: 2500,
      timerProgressBar: true,
    });
  }

  // stock insuficiente, producto no existe, venta no existe
  error(mensaje: string, title: string = 'Error') {
    return Swal.fire({
      icon: 'error',
      title,
      text: mensaje,
      confirmButtonColor: '#dc3545',
    });
  }

  warning(mensaje: string, title: string = 'Atención') {
    return Swal.fire({
      icon: 'warning',
      title,
      text: mensaje,
      confirmButtonColor: '#ffc107',
    });
  }

  // Confirmación antes de Eliminar
  async confirmDelete(mensaje: string = 'Esta acción no se puede revertir.', title: string = '¿Eliminar venta?'): Promise<boolean> {
    const result = await Swal.fire({
      icon: 'warning',
      title,
      text: mensaje,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
    });
    return result.isConfirmed;
  }

  // Confirmación antes de registrar la venta
  async confirmRegistrarVenta(total: number, cantidadProductos: number): Promise<boolean> {
    const result = await Swal.fire({
      icon: 'question',
      title: '¿Confirmar venta?',
      html: `Estás a punto de registrar <b>${cantidadProductos}</b> producto(s) por un total de <b>Bs ${total.toFixed(2)}</b>.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, registrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
    });
    return result.isConfirmed;
  }

  // mostrar los mensajes
  validationErrors(errors: Record<string, string[]>, title: string = 'Revisa los datos') {
    const items = Object.values(errors).flat();
    return Swal.fire({
      icon: 'error',
      title,
      html: `<ul style="text-align:left; margin:0; padding-left:1.2rem;">${items.map(e => `<li>${e}</li>`).join('')}</ul>`,
      confirmButtonColor: '#dc3545',
    });
  }

  // Que se realiozo correctamente
  toastSuccess(mensaje: string) {
    return Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    }).fire({ icon: 'success', title: mensaje });
  }

  // que ocurrio un error
  toastError(mensaje: string) {
    return Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    }).fire({ icon: 'error', title: mensaje });
  }

  // Para peticiones que tardan (crear venta); cerrar con close()
  loading(mensaje: string = 'Procesando...') {
    Swal.fire({
      title: mensaje,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });
  }

  close() {
    Swal.close();
  }
}

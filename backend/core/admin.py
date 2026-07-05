from django.contrib import admin

from .models import (
    Cita, CategoriaProducto, Cliente, Consulta, DetalleFactura,
    Factura, Mascota, Producto, Receta, Vacuna, Veterinario,
)

admin.site.register(Veterinario)
admin.site.register(Cliente)
admin.site.register(Mascota)
admin.site.register(CategoriaProducto)
admin.site.register(Producto)
admin.site.register(Cita)
admin.site.register(Consulta)
admin.site.register(Receta)
admin.site.register(Vacuna)
admin.site.register(Factura)
admin.site.register(DetalleFactura)

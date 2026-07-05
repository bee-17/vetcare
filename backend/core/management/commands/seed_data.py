from datetime import date, timedelta

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from core.models import (
    Cita, CategoriaProducto, Cliente, Consulta, Factura, DetalleFactura,
    Mascota, Producto, Vacuna, Veterinario,
)


class Command(BaseCommand):
    help = 'Crea datos de ejemplo para VetCare (usuario admin, doctores, productos, etc.)'

    def handle(self, *args, **options):
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@vetcare.com', 'admin1234')
            self.stdout.write(self.style.SUCCESS('Usuario admin creado -> usuario: admin / clave: admin1234'))
        else:
            self.stdout.write('El usuario admin ya existe.')

        v1, _ = Veterinario.objects.get_or_create(
            nombres='Lucía', apellidos='Fernández', especialidad='Medicina General',
            defaults={'telefono': '999111222', 'email': 'lucia.fernandez@vetcare.com'}
        )
        v2, _ = Veterinario.objects.get_or_create(
            nombres='Marco', apellidos='Ruiz', especialidad='Cirugía',
            defaults={'telefono': '999333444', 'email': 'marco.ruiz@vetcare.com'}
        )

        cat_pet, _ = CategoriaProducto.objects.get_or_create(nombre='Alimentos', tipo='petshop')
        cat_acc, _ = CategoriaProducto.objects.get_or_create(nombre='Accesorios', tipo='petshop')
        cat_antib, _ = CategoriaProducto.objects.get_or_create(nombre='Antibióticos', tipo='medicamento')
        cat_vacunas, _ = CategoriaProducto.objects.get_or_create(nombre='Vacunas', tipo='medicamento')

        Producto.objects.get_or_create(
            nombre='Alimento Perro Adulto 15kg', categoria=cat_pet, tipo='petshop',
            defaults={'precio': 180.00, 'stock': 25, 'descripcion': 'Alimento balanceado premium'}
        )
        Producto.objects.get_or_create(
            nombre='Correa retráctil', categoria=cat_acc, tipo='petshop',
            defaults={'precio': 45.00, 'stock': 15, 'descripcion': 'Correa retráctil 5m'}
        )
        Producto.objects.get_or_create(
            nombre='Amoxicilina 250mg', categoria=cat_antib, tipo='medicamento',
            defaults={'precio': 25.00, 'stock': 40, 'fecha_vencimiento': date.today() + timedelta(days=200)}
        )
        Producto.objects.get_or_create(
            nombre='Vacuna Antirrábica', categoria=cat_vacunas, tipo='medicamento',
            defaults={'precio': 60.00, 'stock': 30, 'fecha_vencimiento': date.today() + timedelta(days=15)}
        )

        cliente, _ = Cliente.objects.get_or_create(
            num_documento='45678912', defaults={
                'nombres': 'Diro', 'apellidos': 'Carrasco', 'tipo_documento': 'DNI',
                'telefono': '987654321', 'email': 'diro@example.com', 'direccion': 'Lima, Perú',
            }
        )

        mascota, _ = Mascota.objects.get_or_create(
            nombre='Rocky', cliente=cliente, defaults={
                'especie': 'Perro', 'raza': 'Labrador', 'sexo': 'M',
                'fecha_nacimiento': date(2021, 5, 10),
            }
        )

        Cita.objects.get_or_create(
            mascota=mascota, veterinario=v1, fecha=date.today(), hora='10:00',
            defaults={'motivo': 'Control anual', 'estado': 'pendiente'}
        )

        consulta, _ = Consulta.objects.get_or_create(
            mascota=mascota, veterinario=v1, diagnostico='Otitis leve',
            defaults={'tratamiento': 'Limpieza y antibiótico', 'motivo_consulta': 'Rascado de oreja'}
        )

        Vacuna.objects.get_or_create(
            mascota=mascota, veterinario=v2, nombre_vacuna='Antirrábica',
            fecha_aplicacion=date.today() - timedelta(days=350),
            defaults={'fecha_proxima': date.today() + timedelta(days=15)}
        )

        factura, creada = Factura.objects.get_or_create(
            cliente=cliente, serie='B001', numero='000001',
            defaults={'tipo_documento': 'boleta', 'subtotal': 100, 'igv': 18, 'total': 118, 'estado': 'pagada'}
        )
        if creada:
            DetalleFactura.objects.create(
                factura=factura, descripcion='Consulta veterinaria', cantidad=1,
                precio_unitario=100, subtotal=100
            )

        self.stdout.write(self.style.SUCCESS('Datos de ejemplo creados correctamente.'))

from django.db import models


class Veterinario(models.Model):
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    especialidad = models.CharField(max_length=100, blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'veterinarios'
        ordering = ['apellidos', 'nombres']

    def __str__(self):
        return f"Dr(a). {self.nombres} {self.apellidos}"


class Cliente(models.Model):
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    tipo_documento = models.CharField(max_length=10, default='DNI')
    num_documento = models.CharField(max_length=20, unique=True)
    telefono = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    direccion = models.CharField(max_length=200, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'clientes'
        ordering = ['apellidos', 'nombres']

    def __str__(self):
        return f"{self.nombres} {self.apellidos}"


class Mascota(models.Model):
    SEXO_CHOICES = [('M', 'Macho'), ('H', 'Hembra')]

    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='mascotas')
    nombre = models.CharField(max_length=100)
    especie = models.CharField(max_length=50)
    raza = models.CharField(max_length=100, blank=True)
    sexo = models.CharField(max_length=1, choices=SEXO_CHOICES, default='M')
    fecha_nacimiento = models.DateField(null=True, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'mascotas'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class CategoriaProducto(models.Model):
    TIPO_CHOICES = [('petshop', 'Petshop'), ('medicamento', 'Medicamento')]

    nombre = models.CharField(max_length=100)
    tipo = models.CharField(max_length=15, choices=TIPO_CHOICES)
    descripcion = models.CharField(max_length=200, blank=True)

    class Meta:
        db_table = 'categorias_producto'
        ordering = ['tipo', 'nombre']

    def __str__(self):
        return f"{self.nombre} ({self.tipo})"


class Producto(models.Model):
    TIPO_CHOICES = [('petshop', 'Petshop'), ('medicamento', 'Medicamento')]

    categoria = models.ForeignKey(CategoriaProducto, on_delete=models.PROTECT, related_name='productos')
    nombre = models.CharField(max_length=150)
    tipo = models.CharField(max_length=15, choices=TIPO_CHOICES)
    descripcion = models.CharField(max_length=250, blank=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    stock_minimo = models.IntegerField(default=5)
    fecha_vencimiento = models.DateField(null=True, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'productos'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Cita(models.Model):
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('confirmada', 'Confirmada'),
        ('atendida', 'Atendida'),
        ('cancelada', 'Cancelada'),
    ]

    mascota = models.ForeignKey(Mascota, on_delete=models.CASCADE, related_name='citas')
    veterinario = models.ForeignKey(Veterinario, on_delete=models.PROTECT, related_name='citas')
    fecha = models.DateField()
    hora = models.TimeField()
    motivo = models.CharField(max_length=200, blank=True)
    estado = models.CharField(max_length=15, choices=ESTADO_CHOICES, default='pendiente')
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'citas'
        ordering = ['-fecha', '-hora']

    def __str__(self):
        return f"Cita {self.mascota.nombre} - {self.fecha}"


class Consulta(models.Model):
    cita = models.ForeignKey(Cita, on_delete=models.SET_NULL, null=True, blank=True, related_name='consultas')
    mascota = models.ForeignKey(Mascota, on_delete=models.CASCADE, related_name='consultas')
    veterinario = models.ForeignKey(Veterinario, on_delete=models.PROTECT, related_name='consultas')
    fecha = models.DateField(auto_now_add=True)
    motivo_consulta = models.CharField(max_length=200, blank=True)
    diagnostico = models.CharField(max_length=250)
    tratamiento = models.TextField(blank=True)
    observaciones = models.TextField(blank=True)

    class Meta:
        db_table = 'consultas'
        ordering = ['-fecha']

    def __str__(self):
        return f"Consulta {self.mascota.nombre} - {self.fecha}"


class Receta(models.Model):
    consulta = models.ForeignKey(Consulta, on_delete=models.CASCADE, related_name='recetas')
    medicamento = models.ForeignKey(Producto, on_delete=models.PROTECT, related_name='recetas')
    dosis = models.CharField(max_length=100)
    frecuencia = models.CharField(max_length=100)
    duracion = models.CharField(max_length=100)
    indicaciones = models.TextField(blank=True)

    class Meta:
        db_table = 'recetas'

    def __str__(self):
        return f"Receta #{self.id}"


class Vacuna(models.Model):
    mascota = models.ForeignKey(Mascota, on_delete=models.CASCADE, related_name='vacunas')
    veterinario = models.ForeignKey(Veterinario, on_delete=models.PROTECT, related_name='vacunas')
    nombre_vacuna = models.CharField(max_length=150)
    fecha_aplicacion = models.DateField()
    fecha_proxima = models.DateField(null=True, blank=True)
    observaciones = models.CharField(max_length=200, blank=True)

    class Meta:
        db_table = 'vacunas'
        ordering = ['-fecha_aplicacion']

    def __str__(self):
        return f"{self.nombre_vacuna} - {self.mascota.nombre}"


class Factura(models.Model):
    TIPO_DOC_CHOICES = [('factura', 'Factura'), ('boleta', 'Boleta')]
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('pagada', 'Pagada'),
        ('anulada', 'Anulada'),
    ]

    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, related_name='facturas')
    tipo_documento = models.CharField(max_length=10, choices=TIPO_DOC_CHOICES, default='boleta')
    serie = models.CharField(max_length=10, default='F001')
    numero = models.CharField(max_length=20)
    fecha_emision = models.DateField(auto_now_add=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    igv = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    estado = models.CharField(max_length=15, choices=ESTADO_CHOICES, default='pendiente')

    class Meta:
        db_table = 'facturas'
        ordering = ['-fecha_emision']
        unique_together = ('serie', 'numero')

    def __str__(self):
        return f"{self.tipo_documento.upper()} {self.serie}-{self.numero}"


class DetalleFactura(models.Model):
    factura = models.ForeignKey(Factura, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(Producto, on_delete=models.SET_NULL, null=True, blank=True, related_name='detalles_factura')
    descripcion = models.CharField(max_length=200)
    cantidad = models.IntegerField(default=1)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'detalle_facturas'

    def __str__(self):
        return f"Detalle #{self.id} de Factura #{self.factura_id}"

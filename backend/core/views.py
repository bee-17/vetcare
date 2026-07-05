from datetime import date

from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import (
    Cita, CategoriaProducto, Cliente, Consulta, DetalleFactura,
    Factura, Mascota, Producto, Receta, Vacuna, Veterinario,
)
from .serializers import (
    CitaSerializer, CategoriaProductoSerializer, ClienteSerializer,
    ConsultaSerializer, DetalleFacturaSerializer, FacturaSerializer,
    MascotaSerializer, ProductoSerializer, RecetaSerializer,
    VacunaSerializer, VeterinarioSerializer,
)


class LoginView(TokenObtainPairView):
    """Login del panel de administración. Devuelve access + refresh token."""
    permission_classes = [permissions.AllowAny]


# ---------------------------------------------------------------------------
# CRUD genéricos (Registrar / Actualizar / Eliminar / Listar / Detalle)
# ---------------------------------------------------------------------------
class VeterinarioListCreate(generics.ListCreateAPIView):
    queryset = Veterinario.objects.all()
    serializer_class = VeterinarioSerializer


class VeterinarioDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Veterinario.objects.all()
    serializer_class = VeterinarioSerializer


class ClienteListCreate(generics.ListCreateAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer


class ClienteDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer


class MascotaListCreate(generics.ListCreateAPIView):
    queryset = Mascota.objects.select_related('cliente').all()
    serializer_class = MascotaSerializer


class MascotaDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Mascota.objects.all()
    serializer_class = MascotaSerializer


class CategoriaProductoListCreate(generics.ListCreateAPIView):
    queryset = CategoriaProducto.objects.all()
    serializer_class = CategoriaProductoSerializer


class CategoriaProductoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = CategoriaProducto.objects.all()
    serializer_class = CategoriaProductoSerializer


class ProductoListCreate(generics.ListCreateAPIView):
    serializer_class = ProductoSerializer

    def get_queryset(self):
        qs = Producto.objects.select_related('categoria').all()
        tipo = self.request.query_params.get('tipo')
        if tipo:
            qs = qs.filter(tipo=tipo)
        return qs


class ProductoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer


class CitaListCreate(generics.ListCreateAPIView):
    queryset = Cita.objects.select_related('mascota', 'veterinario').all()
    serializer_class = CitaSerializer


class CitaDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cita.objects.all()
    serializer_class = CitaSerializer


class ConsultaListCreate(generics.ListCreateAPIView):
    queryset = Consulta.objects.select_related('mascota', 'veterinario').all()
    serializer_class = ConsultaSerializer


class ConsultaDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Consulta.objects.all()
    serializer_class = ConsultaSerializer


class RecetaListCreate(generics.ListCreateAPIView):
    queryset = Receta.objects.select_related('medicamento').all()
    serializer_class = RecetaSerializer


class RecetaDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Receta.objects.all()
    serializer_class = RecetaSerializer


class VacunaListCreate(generics.ListCreateAPIView):
    queryset = Vacuna.objects.select_related('mascota').all()
    serializer_class = VacunaSerializer


class VacunaDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Vacuna.objects.all()
    serializer_class = VacunaSerializer


class FacturaListCreate(generics.ListCreateAPIView):
    queryset = Factura.objects.select_related('cliente').all()
    serializer_class = FacturaSerializer


class FacturaDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Factura.objects.all()
    serializer_class = FacturaSerializer


@api_view(['PATCH'])
def actualizar_estado_factura(request, pk):
    """Actualiza el estado de una factura: pendiente -> pagada, o anulada."""
    try:
        factura = Factura.objects.get(pk=pk)
    except Factura.DoesNotExist:
        return Response({'detail': 'Factura no encontrada'}, status=status.HTTP_404_NOT_FOUND)

    nuevo_estado = request.data.get('estado')
    if nuevo_estado not in dict(Factura.ESTADO_CHOICES):
        return Response({'detail': 'Estado inválido'}, status=status.HTTP_400_BAD_REQUEST)

    factura.estado = nuevo_estado
    factura.save()
    return Response(FacturaSerializer(factura).data)


@api_view(['PATCH'])
def actualizar_estado_cita(request, pk):
    try:
        cita = Cita.objects.get(pk=pk)
    except Cita.DoesNotExist:
        return Response({'detail': 'Cita no encontrada'}, status=status.HTTP_404_NOT_FOUND)

    nuevo_estado = request.data.get('estado')
    if nuevo_estado not in dict(Cita.ESTADO_CHOICES):
        return Response({'detail': 'Estado inválido'}, status=status.HTTP_400_BAD_REQUEST)

    cita.estado = nuevo_estado
    cita.save()
    return Response(CitaSerializer(cita).data)


# ---------------------------------------------------------------------------
# MÓDULO 1: Reportes de Facturación
# ---------------------------------------------------------------------------
@api_view(['GET'])
def reporte_facturas_dia(request):
    hoy = request.query_params.get('fecha', str(date.today()))
    facturas = Factura.objects.filter(fecha_emision=hoy).select_related('cliente')
    return Response(FacturaSerializer(facturas, many=True).data)


@api_view(['GET'])
def reporte_ingresos_mes(request):
    datos = (
        Factura.objects.filter(estado='pagada')
        .annotate(mes=TruncMonth('fecha_emision'))
        .values('mes')
        .annotate(total_ingresos=Sum('total'), cantidad_facturas=Count('id'))
        .order_by('-mes')
    )
    return Response(list(datos))


@api_view(['GET'])
def reporte_facturas_por_cliente(request, cliente_id):
    facturas = Factura.objects.filter(cliente_id=cliente_id).select_related('cliente')
    return Response(FacturaSerializer(facturas, many=True).data)


@api_view(['GET'])
def reporte_facturas_anuladas(request):
    facturas = Factura.objects.filter(estado='anulada').select_related('cliente')
    return Response(FacturaSerializer(facturas, many=True).data)


# ---------------------------------------------------------------------------
# MÓDULO 2: Reportes de Historial Clínico
# ---------------------------------------------------------------------------
@api_view(['GET'])
def reporte_consultas_por_mascota(request, mascota_id):
    consultas = Consulta.objects.filter(mascota_id=mascota_id).select_related('mascota', 'veterinario')
    return Response(ConsultaSerializer(consultas, many=True).data)


@api_view(['GET'])
def reporte_vacunas_proximas_vencer(request):
    dias = int(request.query_params.get('dias', 30))
    limite = date.today()
    from datetime import timedelta
    limite_fin = limite + timedelta(days=dias)
    vacunas = Vacuna.objects.filter(
        fecha_proxima__gte=limite, fecha_proxima__lte=limite_fin
    ).select_related('mascota')
    return Response(VacunaSerializer(vacunas, many=True).data)


@api_view(['GET'])
def reporte_diagnosticos_frecuentes(request):
    datos = (
        Consulta.objects.values('diagnostico')
        .annotate(veces=Count('id'))
        .order_by('-veces')[:20]
    )
    return Response(list(datos))


@api_view(['GET'])
def reporte_consultas_por_veterinario(request, veterinario_id):
    consultas = Consulta.objects.filter(veterinario_id=veterinario_id).select_related('mascota', 'veterinario')
    return Response(ConsultaSerializer(consultas, many=True).data)


# ---------------------------------------------------------------------------
# MÓDULO 3: Reportes de Citas
# ---------------------------------------------------------------------------
@api_view(['GET'])
def reporte_citas_dia(request):
    hoy = request.query_params.get('fecha', str(date.today()))
    citas = Cita.objects.filter(fecha=hoy).select_related('mascota', 'veterinario')
    return Response(CitaSerializer(citas, many=True).data)


@api_view(['GET'])
def reporte_citas_por_veterinario(request, veterinario_id):
    citas = Cita.objects.filter(veterinario_id=veterinario_id).select_related('mascota', 'veterinario')
    return Response(CitaSerializer(citas, many=True).data)


@api_view(['GET'])
def reporte_citas_canceladas(request):
    citas = Cita.objects.filter(estado='cancelada').select_related('mascota', 'veterinario')
    return Response(CitaSerializer(citas, many=True).data)


@api_view(['GET'])
def reporte_citas_pendientes_por_mascota(request, mascota_id):
    citas = Cita.objects.filter(mascota_id=mascota_id, estado='pendiente').select_related('mascota', 'veterinario')
    return Response(CitaSerializer(citas, many=True).data)


# ---------------------------------------------------------------------------
# MÓDULO 4: Doctores - consultas / resumen
# ---------------------------------------------------------------------------
@api_view(['GET'])
def doctores_resumen(request):
    """Resumen por doctor: cantidad de citas y consultas atendidas."""
    datos = Veterinario.objects.annotate(
        total_citas=Count('citas', distinct=True),
        total_consultas=Count('consultas', distinct=True),
    ).values('id', 'nombres', 'apellidos', 'especialidad', 'activo', 'total_citas', 'total_consultas')
    return Response(list(datos))


@api_view(['GET'])
def doctores_citas_hoy(request):
    hoy = str(date.today())
    datos = (
        Cita.objects.filter(fecha=hoy)
        .values('veterinario__id', 'veterinario__nombres', 'veterinario__apellidos')
        .annotate(total=Count('id'))
        .order_by('-total')
    )
    return Response(list(datos))


@api_view(['GET'])
def dashboard_resumen(request):
    """Datos generales para el dashboard del admin."""
    hoy = date.today()
    return Response({
        'citas_hoy': Cita.objects.filter(fecha=hoy).count(),
        'facturas_hoy': Factura.objects.filter(fecha_emision=hoy).count(),
        'ingresos_mes': Factura.objects.filter(
            estado='pagada', fecha_emision__year=hoy.year, fecha_emision__month=hoy.month
        ).aggregate(total=Sum('total'))['total'] or 0,
        'productos_bajo_stock': Producto.objects.filter(stock__lte=5).count(),
        'total_mascotas': Mascota.objects.count(),
        'total_clientes': Cliente.objects.count(),
    })

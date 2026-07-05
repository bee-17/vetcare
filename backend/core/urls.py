from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    # Auth
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Doctores
    path('veterinarios/', views.VeterinarioListCreate.as_view()),
    path('veterinarios/<int:pk>/', views.VeterinarioDetail.as_view()),
    path('veterinarios/resumen/', views.doctores_resumen),
    path('veterinarios/citas-hoy/', views.doctores_citas_hoy),

    # Clientes y mascotas
    path('clientes/', views.ClienteListCreate.as_view()),
    path('clientes/<int:pk>/', views.ClienteDetail.as_view()),
    path('mascotas/', views.MascotaListCreate.as_view()),
    path('mascotas/<int:pk>/', views.MascotaDetail.as_view()),

    # Inventario (petshop + medicamentos)
    path('categorias/', views.CategoriaProductoListCreate.as_view()),
    path('categorias/<int:pk>/', views.CategoriaProductoDetail.as_view()),
    path('productos/', views.ProductoListCreate.as_view()),
    path('productos/<int:pk>/', views.ProductoDetail.as_view()),

    # Módulo 3: Citas
    path('citas/', views.CitaListCreate.as_view()),
    path('citas/<int:pk>/', views.CitaDetail.as_view()),
    path('citas/<int:pk>/estado/', views.actualizar_estado_cita),
    path('reportes/citas/dia/', views.reporte_citas_dia),
    path('reportes/citas/por-veterinario/<int:veterinario_id>/', views.reporte_citas_por_veterinario),
    path('reportes/citas/canceladas/', views.reporte_citas_canceladas),
    path('reportes/citas/pendientes-por-mascota/<int:mascota_id>/', views.reporte_citas_pendientes_por_mascota),

    # Módulo 2: Historial clínico
    path('consultas/', views.ConsultaListCreate.as_view()),
    path('consultas/<int:pk>/', views.ConsultaDetail.as_view()),
    path('recetas/', views.RecetaListCreate.as_view()),
    path('recetas/<int:pk>/', views.RecetaDetail.as_view()),
    path('vacunas/', views.VacunaListCreate.as_view()),
    path('vacunas/<int:pk>/', views.VacunaDetail.as_view()),
    path('reportes/consultas/por-mascota/<int:mascota_id>/', views.reporte_consultas_por_mascota),
    path('reportes/vacunas/proximas-vencer/', views.reporte_vacunas_proximas_vencer),
    path('reportes/consultas/diagnosticos-frecuentes/', views.reporte_diagnosticos_frecuentes),
    path('reportes/consultas/por-veterinario/<int:veterinario_id>/', views.reporte_consultas_por_veterinario),

    # Módulo 1: Facturación
    path('facturas/', views.FacturaListCreate.as_view()),
    path('facturas/<int:pk>/', views.FacturaDetail.as_view()),
    path('facturas/<int:pk>/estado/', views.actualizar_estado_factura),
    path('reportes/facturas/dia/', views.reporte_facturas_dia),
    path('reportes/facturas/ingresos-mes/', views.reporte_ingresos_mes),
    path('reportes/facturas/por-cliente/<int:cliente_id>/', views.reporte_facturas_por_cliente),
    path('reportes/facturas/anuladas/', views.reporte_facturas_anuladas),

    # Dashboard
    path('dashboard/resumen/', views.dashboard_resumen),
]

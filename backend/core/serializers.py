from rest_framework import serializers

from .models import (
    Cita, CategoriaProducto, Cliente, Consulta, DetalleFactura,
    Factura, Mascota, Producto, Receta, Vacuna, Veterinario,
)


class VeterinarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Veterinario
        fields = '__all__'


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'


class MascotaSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source='cliente.__str__', read_only=True)

    class Meta:
        model = Mascota
        fields = '__all__'


class CategoriaProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriaProducto
        fields = '__all__'


class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)

    class Meta:
        model = Producto
        fields = '__all__'


class CitaSerializer(serializers.ModelSerializer):
    mascota_nombre = serializers.CharField(source='mascota.nombre', read_only=True)
    veterinario_nombre = serializers.CharField(source='veterinario.__str__', read_only=True)

    class Meta:
        model = Cita
        fields = '__all__'


class ConsultaSerializer(serializers.ModelSerializer):
    mascota_nombre = serializers.CharField(source='mascota.nombre', read_only=True)
    veterinario_nombre = serializers.CharField(source='veterinario.__str__', read_only=True)

    class Meta:
        model = Consulta
        fields = '__all__'


class RecetaSerializer(serializers.ModelSerializer):
    medicamento_nombre = serializers.CharField(source='medicamento.nombre', read_only=True)

    class Meta:
        model = Receta
        fields = '__all__'


class VacunaSerializer(serializers.ModelSerializer):
    mascota_nombre = serializers.CharField(source='mascota.nombre', read_only=True)

    class Meta:
        model = Vacuna
        fields = '__all__'


class DetalleFacturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleFactura
        fields = '__all__'


class FacturaSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source='cliente.__str__', read_only=True)
    detalles = DetalleFacturaSerializer(many=True, required=False)

    class Meta:
        model = Factura
        fields = '__all__'

    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles', [])
        factura = Factura.objects.create(**validated_data)
        for detalle in detalles_data:
            DetalleFactura.objects.create(factura=factura, **detalle)
        return factura

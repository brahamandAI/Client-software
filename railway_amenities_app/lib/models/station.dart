class Station {
  final String id;
  final String name;
  final String code;
  final String region;
  final String address;
  final double geoLat;
  final double geoLng;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Station({
    required this.id,
    required this.name,
    required this.code,
    required this.region,
    required this.address,
    required this.geoLat,
    required this.geoLng,
    this.createdAt,
    this.updatedAt,
  });

  factory Station.fromJson(Map<String, dynamic> json) {
    return Station(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      code: json['code'] ?? '',
      region: json['region'] ?? '',
      address: json['address'] ?? '',
      geoLat: (json['geoLat'] ?? 0.0).toDouble(),
      geoLng: (json['geoLng'] ?? 0.0).toDouble(),
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'code': code,
      'region': region,
      'address': address,
      'geoLat': geoLat,
      'geoLng': geoLng,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  Station copyWith({
    String? id,
    String? name,
    String? code,
    String? region,
    String? address,
    double? geoLat,
    double? geoLng,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Station(
      id: id ?? this.id,
      name: name ?? this.name,
      code: code ?? this.code,
      region: region ?? this.region,
      address: address ?? this.address,
      geoLat: geoLat ?? this.geoLat,
      geoLng: geoLng ?? this.geoLng,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  String toString() {
    return 'Station(id: $id, name: $name, code: $code, region: $region)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Station && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}

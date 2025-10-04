class Inspection {
  final String id;
  final String stationId;
  final String? stationAmenityId;
  final String inspectedById;
  final String status;
  final String notes;
  final List<String> photos;
  final DateTime inspectedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  // Additional fields for display
  final String? stationName;
  final String? inspectedByName;
  final String? amenityName;

  Inspection({
    required this.id,
    required this.stationId,
    this.stationAmenityId,
    required this.inspectedById,
    required this.status,
    required this.notes,
    required this.photos,
    required this.inspectedAt,
    required this.createdAt,
    required this.updatedAt,
    this.stationName,
    this.inspectedByName,
    this.amenityName,
  });

  factory Inspection.fromJson(Map<String, dynamic> json) {
    return Inspection(
      id: json['_id'] ?? json['id'] ?? '',
      stationId: json['stationId']?['_id'] ?? json['stationId'] ?? '',
      stationAmenityId: json['stationAmenityId']?['_id'] ?? json['stationAmenityId'],
      inspectedById: json['inspectedById']?['_id'] ?? json['inspectedById'] ?? '',
      status: json['status'] ?? 'pending',
      notes: json['notes'] ?? '',
      photos: List<String>.from(json['photos'] ?? []),
      inspectedAt: DateTime.parse(json['inspectedAt'] ?? DateTime.now().toIso8601String()),
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
      stationName: json['stationId']?['name'] ?? json['stationName'],
      inspectedByName: json['inspectedById']?['name'] ?? json['inspectedByName'],
      amenityName: json['stationAmenityId']?['name'] ?? json['amenityName'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'stationId': stationId,
      'stationAmenityId': stationAmenityId,
      'inspectedById': inspectedById,
      'status': status,
      'notes': notes,
      'photos': photos,
      'inspectedAt': inspectedAt.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  bool get isPending => status == 'pending';
  bool get isCompleted => status == 'completed';
  bool get isFailed => status == 'failed';

  bool get hasPhotos => photos.isNotEmpty;

  Inspection copyWith({
    String? id,
    String? stationId,
    String? stationAmenityId,
    String? inspectedById,
    String? status,
    String? notes,
    List<String>? photos,
    DateTime? inspectedAt,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? stationName,
    String? inspectedByName,
    String? amenityName,
  }) {
    return Inspection(
      id: id ?? this.id,
      stationId: stationId ?? this.stationId,
      stationAmenityId: stationAmenityId ?? this.stationAmenityId,
      inspectedById: inspectedById ?? this.inspectedById,
      status: status ?? this.status,
      notes: notes ?? this.notes,
      photos: photos ?? this.photos,
      inspectedAt: inspectedAt ?? this.inspectedAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      stationName: stationName ?? this.stationName,
      inspectedByName: inspectedByName ?? this.inspectedByName,
      amenityName: amenityName ?? this.amenityName,
    );
  }

  @override
  String toString() {
    return 'Inspection(id: $id, stationId: $stationId, status: $status, notes: $notes)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Inspection && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}

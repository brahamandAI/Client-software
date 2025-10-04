class Issue {
  final String id;
  final String stationId;
  final String? stationAmenityId;
  final String reportedById;
  final String? assignedToId;
  final String priority;
  final String status;
  final String description;
  final List<String> photos;
  final DateTime reportedAt;
  final DateTime? acknowledgedAt;
  final DateTime? assignedAt;
  final DateTime? resolvedAt;
  final DateTime? closedAt;
  final String? notes;
  final DateTime createdAt;
  final DateTime updatedAt;

  // Additional fields for display
  final String? stationName;
  final String? reportedByName;
  final String? assignedToName;

  Issue({
    required this.id,
    required this.stationId,
    this.stationAmenityId,
    required this.reportedById,
    this.assignedToId,
    required this.priority,
    required this.status,
    required this.description,
    required this.photos,
    required this.reportedAt,
    this.acknowledgedAt,
    this.assignedAt,
    this.resolvedAt,
    this.closedAt,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
    this.stationName,
    this.reportedByName,
    this.assignedToName,
  });

  factory Issue.fromJson(Map<String, dynamic> json) {
    return Issue(
      id: json['_id'] ?? json['id'] ?? '',
      stationId: json['stationId']?['_id'] ?? json['stationId'] ?? '',
      stationAmenityId: json['stationAmenityId']?['_id'] ?? json['stationAmenityId'],
      reportedById: json['reportedById']?['_id'] ?? json['reportedById'] ?? '',
      assignedToId: json['assignedToId']?['_id'] ?? json['assignedToId'],
      priority: json['priority'] ?? 'medium',
      status: json['status'] ?? 'reported',
      description: json['description'] ?? '',
      photos: List<String>.from(json['photos'] ?? []),
      reportedAt: DateTime.parse(json['reportedAt'] ?? DateTime.now().toIso8601String()),
      acknowledgedAt: json['acknowledgedAt'] != null 
          ? DateTime.parse(json['acknowledgedAt']) 
          : null,
      assignedAt: json['assignedAt'] != null 
          ? DateTime.parse(json['assignedAt']) 
          : null,
      resolvedAt: json['resolvedAt'] != null 
          ? DateTime.parse(json['resolvedAt']) 
          : null,
      closedAt: json['closedAt'] != null 
          ? DateTime.parse(json['closedAt']) 
          : null,
      notes: json['notes'],
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
      stationName: json['stationId']?['name'] ?? json['stationName'],
      reportedByName: json['reportedById']?['name'] ?? json['reportedByName'],
      assignedToName: json['assignedToId']?['name'] ?? json['assignedToName'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'stationId': stationId,
      'stationAmenityId': stationAmenityId,
      'reportedById': reportedById,
      'assignedToId': assignedToId,
      'priority': priority,
      'status': status,
      'description': description,
      'photos': photos,
      'reportedAt': reportedAt.toIso8601String(),
      'acknowledgedAt': acknowledgedAt?.toIso8601String(),
      'assignedAt': assignedAt?.toIso8601String(),
      'resolvedAt': resolvedAt?.toIso8601String(),
      'closedAt': closedAt?.toIso8601String(),
      'notes': notes,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  bool get isHighPriority => priority == 'high';
  bool get isMediumPriority => priority == 'medium';
  bool get isLowPriority => priority == 'low';

  bool get isReported => status == 'reported';
  bool get isAcknowledged => status == 'acknowledged';
  bool get isAssigned => status == 'assigned';
  bool get isResolved => status == 'resolved';
  bool get isClosed => status == 'closed';

  bool get isOpen => !isResolved && !isClosed;

  Issue copyWith({
    String? id,
    String? stationId,
    String? stationAmenityId,
    String? reportedById,
    String? assignedToId,
    String? priority,
    String? status,
    String? description,
    List<String>? photos,
    DateTime? reportedAt,
    DateTime? acknowledgedAt,
    DateTime? assignedAt,
    DateTime? resolvedAt,
    DateTime? closedAt,
    String? notes,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? stationName,
    String? reportedByName,
    String? assignedToName,
  }) {
    return Issue(
      id: id ?? this.id,
      stationId: stationId ?? this.stationId,
      stationAmenityId: stationAmenityId ?? this.stationAmenityId,
      reportedById: reportedById ?? this.reportedById,
      assignedToId: assignedToId ?? this.assignedToId,
      priority: priority ?? this.priority,
      status: status ?? this.status,
      description: description ?? this.description,
      photos: photos ?? this.photos,
      reportedAt: reportedAt ?? this.reportedAt,
      acknowledgedAt: acknowledgedAt ?? this.acknowledgedAt,
      assignedAt: assignedAt ?? this.assignedAt,
      resolvedAt: resolvedAt ?? this.resolvedAt,
      closedAt: closedAt ?? this.closedAt,
      notes: notes ?? this.notes,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      stationName: stationName ?? this.stationName,
      reportedByName: reportedByName ?? this.reportedByName,
      assignedToName: assignedToName ?? this.assignedToName,
    );
  }

  @override
  String toString() {
    return 'Issue(id: $id, stationId: $stationId, priority: $priority, status: $status, description: $description)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Issue && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}

class User {
  final String id;
  final String name;
  final String email;
  final String role;
  final String? stationId;
  final DateTime createdAt;
  final DateTime updatedAt;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.stationId,
    required this.createdAt,
    required this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    // Handle stationId which can be a String or an Object
    String? stationId;
    if (json['stationId'] != null) {
      if (json['stationId'] is String) {
        stationId = json['stationId'];
      } else if (json['stationId'] is Map) {
        stationId = json['stationId']['_id'] ?? json['stationId']['id'];
      }
    }
    
    return User(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      role: json['role']?.toString() ?? '',
      stationId: stationId,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
      'stationId': stationId,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  bool get isSuperAdmin => role == 'SuperAdmin';
  bool get isStationManager => role == 'StationManager';
  bool get isStaff => role == 'Staff';
  bool get isPublic => role == 'Public';

  User copyWith({
    String? id,
    String? name,
    String? email,
    String? role,
    String? stationId,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      role: role ?? this.role,
      stationId: stationId ?? this.stationId,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  String toString() {
    return 'User(id: $id, name: $name, email: $email, role: $role, stationId: $stationId)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is User && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}

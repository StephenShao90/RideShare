class User {
  final int id;
  final String name;
  final String email;
  final DateTime? createdAt;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json["id"],
      name: json["name"],
      email: json["email"],
      createdAt: json["created_at"] == null
          ? null
          : DateTime.parse(json["created_at"]),
    );
  }
}
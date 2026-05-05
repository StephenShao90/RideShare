class Ride {
  final int id;
  final int? driverId;
  final String origin;
  final String destination;
  final DateTime rideDate;
  final int? availableSeats;
  final double? price;
  final String? status;
  final String? driverName;
  final String? requestStatus;

  Ride({
    required this.id,
    this.driverId,
    required this.origin,
    required this.destination,
    required this.rideDate,
    this.availableSeats,
    this.price,
    this.status,
    this.driverName,
    this.requestStatus,
  });

  factory Ride.fromJson(Map<String, dynamic> json) {
    return Ride(
      id: json["id"] ?? json["ride_id"],
      driverId: json["driver_id"],
      origin: json["origin"],
      destination: json["destination"],
      rideDate: DateTime.parse(json["ride_date"]),
      availableSeats: json["available_seats"],
      price: json["price"] == null
          ? null
          : double.parse(json["price"].toString()),
      status: json["status"],
      driverName: json["driver_name"],
      requestStatus: json["request_status"],
    );
  }
}
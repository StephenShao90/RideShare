class RideRequest {
  final int requestId;
  final int rideId;
  final String origin;
  final String destination;
  final DateTime rideDate;
  final int? availableSeats;
  final double? price;
  final String requestStatus;
  final String? riderName;
  final String? riderEmail;
  final String? driverName;

  RideRequest({
    required this.requestId,
    required this.rideId,
    required this.origin,
    required this.destination,
    required this.rideDate,
    this.availableSeats,
    this.price,
    required this.requestStatus,
    this.riderName,
    this.riderEmail,
    this.driverName,
  });

  factory RideRequest.fromJson(Map<String, dynamic> json) {
    return RideRequest(
      requestId: json["request_id"],
      rideId: json["ride_id"],
      origin: json["origin"],
      destination: json["destination"],
      rideDate: DateTime.parse(json["ride_date"]),
      availableSeats: json["available_seats"],
      price: json["price"] == null
          ? null
          : double.parse(json["price"].toString()),
      requestStatus: json["request_status"],
      riderName: json["rider_name"],
      riderEmail: json["rider_email"],
      driverName: json["driver_name"],
    );
  }
}
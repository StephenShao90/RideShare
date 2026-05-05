import '../core/api_client.dart';
import '../core/constants.dart';
import '../models/ride.dart';

class RideService {
  final ApiClient _apiClient = ApiClient();

  Future<List<Ride>> searchRides({
    String origin = "",
    String destination = "",
    String date = "",
  }) async {
    final uri = Uri.parse("${AppConstants.apiBaseUrl}/rides/search").replace(
      queryParameters: {
        "origin": origin,
        "destination": destination,
        "date": date,
      },
    );

    final data = await _apiClient.get(uri.toString());

    return List<Ride>.from(
      data.map((json) => Ride.fromJson(json)),
    );
  }

  Future<void> createRide({
    required String origin,
    required String destination,
    required DateTime rideDate,
    required int availableSeats,
    required double price,
  }) async {
    await _apiClient.post(
      "${AppConstants.apiBaseUrl}/rides",
      {
        "origin": origin,
        "destination": destination,
        "ride_date": rideDate.toIso8601String(),
        "available_seats": availableSeats,
        "price": price,
      },
    );
  }

  Future<List<Ride>> getMyPostedRides() async {
    final data = await _apiClient.get(
      "${AppConstants.apiBaseUrl}/rides/mine/posted",
    );

    return List<Ride>.from(
      data.map((json) => Ride.fromJson(json)),
    );
  }

  Future<List<Ride>> getMyRequestedRides() async {
    final data = await _apiClient.get(
      "${AppConstants.apiBaseUrl}/rides/mine/requested",
    );

    return List<Ride>.from(
      data.map((json) => Ride.fromJson(json)),
    );
  }
}
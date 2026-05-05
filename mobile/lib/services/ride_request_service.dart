import '../core/api_client.dart';
import '../core/constants.dart';
import '../models/ride_request.dart';

class RideRequestService {
  final ApiClient _apiClient = ApiClient();

  Future<void> requestRide(int rideId) async {
    await _apiClient.post(
      "${AppConstants.apiBaseUrl}/ride-requests",
      {
        "ride_id": rideId,
      },
    );
  }

  Future<List<RideRequest>> getDriverRideRequests() async {
    final data = await _apiClient.get(
      "${AppConstants.apiBaseUrl}/ride-requests/driver",
    );

    return List<RideRequest>.from(
      data.map((json) => RideRequest.fromJson(json)),
    );
  }

  Future<void> approveRequest(int requestId) async {
    await _apiClient.patch(
      "${AppConstants.apiBaseUrl}/ride-requests/$requestId/approve",
    );
  }

  Future<void> rejectRequest(int requestId) async {
    await _apiClient.patch(
      "${AppConstants.apiBaseUrl}/ride-requests/$requestId/reject",
    );
  }
}
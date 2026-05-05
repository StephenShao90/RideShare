import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/ride_request.dart';
import '../services/ride_request_service.dart';

class DriverRequestsScreen extends StatefulWidget {
  const DriverRequestsScreen({super.key});

  @override
  State<DriverRequestsScreen> createState() => _DriverRequestsScreenState();
}

class _DriverRequestsScreenState extends State<DriverRequestsScreen> {
  final RideRequestService _rideRequestService = RideRequestService();

  List<RideRequest> _requests = [];
  bool _loading = true;
  String _error = "";

  @override
  void initState() {
    super.initState();
    _loadRequests();
  }

  Future<void> _loadRequests() async {
    setState(() {
      _loading = true;
      _error = "";
    });

    try {
      final requests = await _rideRequestService.getDriverRideRequests();

      setState(() {
        _requests = requests;
      });
    } catch (error) {
      setState(() {
        _error = error.toString().replaceFirst("Exception: ", "");
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  Future<void> _approve(int requestId) async {
    await _rideRequestService.approveRequest(requestId);
    await _loadRequests();
  }

  Future<void> _reject(int requestId) async {
    await _rideRequestService.rejectRequest(requestId);
    await _loadRequests();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Incoming Requests"),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _error.isNotEmpty
                ? Center(child: Text(_error))
                : ListView.builder(
                    itemCount: _requests.length,
                    itemBuilder: (context, index) {
                      final request = _requests[index];
                      final date = DateFormat("MMM d, yyyy • h:mm a")
                          .format(request.rideDate);

                      return Card(
                        margin: const EdgeInsets.only(bottom: 14),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "${request.origin} → ${request.destination}",
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(date),
                              Text("Rider: ${request.riderName ?? "Unknown"}"),
                              Text("Email: ${request.riderEmail ?? "N/A"}"),
                              Text("Status: ${request.requestStatus}"),

                              if (request.requestStatus == "pending") ...[
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    Expanded(
                                      child: ElevatedButton(
                                        onPressed: () =>
                                            _approve(request.requestId),
                                        child: const Text("Approve"),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: OutlinedButton(
                                        onPressed: () =>
                                            _reject(request.requestId),
                                        child: const Text("Reject"),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ],
                          ),
                        ),
                      );
                    },
                  ),
      ),
    );
  }
}
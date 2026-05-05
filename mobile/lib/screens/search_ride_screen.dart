import 'package:flutter/material.dart';
import '../models/ride.dart';
import '../services/ride_request_service.dart';
import '../services/ride_service.dart';
import '../widgets/ride_card.dart';

class SearchRidesScreen extends StatefulWidget {
  const SearchRidesScreen({super.key});

  @override
  State<SearchRidesScreen> createState() => _SearchRidesScreenState();
}

class _SearchRidesScreenState extends State<SearchRidesScreen> {
  final RideService _rideService = RideService();
  final RideRequestService _rideRequestService = RideRequestService();

  final TextEditingController _originController = TextEditingController();
  final TextEditingController _destinationController = TextEditingController();

  List<Ride> _rides = [];
  bool _loading = false;
  String _error = "";

  @override
  void initState() {
    super.initState();
    _searchRides();
  }

  Future<void> _searchRides() async {
    setState(() {
      _loading = true;
      _error = "";
    });

    try {
      final rides = await _rideService.searchRides(
        origin: _originController.text.trim(),
        destination: _destinationController.text.trim(),
      );

      setState(() {
        _rides = rides;
      });
    } catch (error) {
      setState(() {
        _error = error.toString().replaceFirst("Exception: ", "");
      });
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  Future<void> _requestRide(int rideId) async {
    try {
      await _rideRequestService.requestRide(rideId);

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Ride request sent")),
      );
    } catch (error) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error.toString().replaceFirst("Exception: ", "")),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Search Rides"),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _originController,
              decoration: const InputDecoration(
                labelText: "Origin",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),

            TextField(
              controller: _destinationController,
              decoration: const InputDecoration(
                labelText: "Destination",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _loading ? null : _searchRides,
                child: const Text("Search"),
              ),
            ),

            if (_error.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(
                _error,
                style: const TextStyle(color: Colors.red),
              ),
            ],

            const SizedBox(height: 16),

            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : ListView.builder(
                      itemCount: _rides.length,
                      itemBuilder: (context, index) {
                        final ride = _rides[index];

                        return RideCard(
                          ride: ride,
                          onRequestRide: () => _requestRide(ride.id),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
import 'package:flutter/material.dart';
import '../models/ride.dart';
import '../services/ride_service.dart';
import '../widgets/ride_card.dart';

class MyRequestedRidesScreen extends StatefulWidget {
  const MyRequestedRidesScreen({super.key});

  @override
  State<MyRequestedRidesScreen> createState() => _MyRequestedRidesScreenState();
}

class _MyRequestedRidesScreenState extends State<MyRequestedRidesScreen> {
  final RideService _rideService = RideService();

  List<Ride> _rides = [];
  bool _loading = true;
  String _error = "";

  @override
  void initState() {
    super.initState();
    _loadRequestedRides();
  }

  Future<void> _loadRequestedRides() async {
    try {
      final rides = await _rideService.getMyRequestedRides();

      setState(() {
        _rides = rides;
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("My Requested Rides"),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _error.isNotEmpty
                ? Center(child: Text(_error))
                : ListView.builder(
                    itemCount: _rides.length,
                    itemBuilder: (context, index) {
                      return RideCard(ride: _rides[index]);
                    },
                  ),
      ),
    );
  }
}
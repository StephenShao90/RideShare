import 'package:flutter/material.dart';
import '../models/ride.dart';
import '../services/ride_service.dart';
import '../widgets/ride_card.dart';

class MyPostedRidesScreen extends StatefulWidget {
  const MyPostedRidesScreen({super.key});

  @override
  State<MyPostedRidesScreen> createState() => _MyPostedRidesScreenState();
}

class _MyPostedRidesScreenState extends State<MyPostedRidesScreen> {
  final RideService _rideService = RideService();

  List<Ride> _rides = [];
  bool _loading = true;
  String _error = "";

  @override
  void initState() {
    super.initState();
    _loadPostedRides();
  }

  Future<void> _loadPostedRides() async {
    try {
      final rides = await _rideService.getMyPostedRides();

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
        title: const Text("My Posted Rides"),
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
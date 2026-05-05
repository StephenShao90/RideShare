import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/ride.dart';

class RideCard extends StatelessWidget {
  final Ride ride;
  final VoidCallback? onRequestRide;

  const RideCard({
    super.key,
    required this.ride,
    this.onRequestRide,
  });

  @override
  Widget build(BuildContext context) {
    final formattedDate = DateFormat("MMM d, yyyy • h:mm a").format(
      ride.rideDate,
    );

    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "${ride.origin} → ${ride.destination}",
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 8),
            Text(formattedDate),

            if (ride.availableSeats != null) ...[
              const SizedBox(height: 6),
              Text("Seats available: ${ride.availableSeats}"),
            ],

            if (ride.price != null)
              Text("Price: \$${ride.price!.toStringAsFixed(2)}"),

            if (ride.status != null) Text("Status: ${ride.status}"),

            if (ride.driverName != null) Text("Driver: ${ride.driverName}"),

            if (ride.requestStatus != null)
              Text("Request status: ${ride.requestStatus}"),

            if (onRequestRide != null) ...[
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: onRequestRide,
                  child: const Text("Request Ride"),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
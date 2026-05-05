import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../widgets/primary_button.dart';
import 'create_ride_screen.dart';
import 'driver_requests_screen.dart';
import 'login_screen.dart';
import 'my_posted_rides_screen.dart';
import 'my_requested_rides_screen.dart';
import 'search_rides_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  Future<void> _logout(BuildContext context) async {
    final authService = AuthService();
    await authService.logout();

    if (!context.mounted) return;

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  void _goTo(BuildContext context, Widget screen) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => screen),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("RideShare"),
        actions: [
          IconButton(
            onPressed: () => _logout(context),
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const Align(
              alignment: Alignment.centerLeft,
              child: Text(
                "Dashboard",
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 24),

            PrimaryButton(
              label: "Search Rides",
              icon: Icons.search,
              onPressed: () => _goTo(context, const SearchRidesScreen()),
            ),
            const SizedBox(height: 12),

            PrimaryButton(
              label: "Create Ride",
              icon: Icons.add,
              onPressed: () => _goTo(context, const CreateRideScreen()),
            ),
            const SizedBox(height: 12),

            PrimaryButton(
              label: "My Posted Rides",
              icon: Icons.directions_car,
              onPressed: () => _goTo(context, const MyPostedRidesScreen()),
            ),
            const SizedBox(height: 12),

            PrimaryButton(
              label: "My Requested Rides",
              icon: Icons.receipt_long,
              onPressed: () => _goTo(context, const MyRequestedRidesScreen()),
            ),
            const SizedBox(height: 12),

            PrimaryButton(
              label: "Incoming Requests",
              icon: Icons.notifications,
              onPressed: () => _goTo(context, const DriverRequestsScreen()),
            ),
          ],
        ),
      ),
    );
  }
}
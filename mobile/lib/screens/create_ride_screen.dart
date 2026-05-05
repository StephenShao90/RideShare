import 'package:flutter/material.dart';
import '../services/ride_service.dart';
import '../widgets/primary_button.dart';

class CreateRideScreen extends StatefulWidget {
  const CreateRideScreen({super.key});

  @override
  State<CreateRideScreen> createState() => _CreateRideScreenState();
}

class _CreateRideScreenState extends State<CreateRideScreen> {
  final RideService _rideService = RideService();

  final TextEditingController _originController = TextEditingController();
  final TextEditingController _destinationController = TextEditingController();
  final TextEditingController _seatsController = TextEditingController();
  final TextEditingController _priceController = TextEditingController();

  DateTime? _selectedDateTime;
  bool _loading = false;
  String _error = "";

  Future<void> _pickDateTime() async {
    final selectedDate = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );

    if (selectedDate == null || !mounted) return;

    final selectedTime = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
    );

    if (selectedTime == null) return;

    setState(() {
      _selectedDateTime = DateTime(
        selectedDate.year,
        selectedDate.month,
        selectedDate.day,
        selectedTime.hour,
        selectedTime.minute,
      );
    });
  }

  Future<void> _createRide() async {
    if (_selectedDateTime == null) {
      setState(() {
        _error = "Please select a ride date and time.";
      });
      return;
    }

    setState(() {
      _loading = true;
      _error = "";
    });

    try {
      await _rideService.createRide(
        origin: _originController.text.trim(),
        destination: _destinationController.text.trim(),
        rideDate: _selectedDateTime!,
        availableSeats: int.parse(_seatsController.text),
        price: double.parse(_priceController.text),
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Ride created")),
      );

      Navigator.pop(context);
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

  @override
  Widget build(BuildContext context) {
    final dateText = _selectedDateTime == null
        ? "Select date and time"
        : _selectedDateTime.toString();

    return Scaffold(
      appBar: AppBar(
        title: const Text("Create Ride"),
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

            TextField(
              controller: _seatsController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: "Available Seats",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),

            TextField(
              controller: _priceController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: "Price",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),

            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: _pickDateTime,
                child: Text(dateText),
              ),
            ),

            if (_error.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(
                _error,
                style: const TextStyle(color: Colors.red),
              ),
            ],

            const SizedBox(height: 20),

            PrimaryButton(
              label: "Create Ride",
              loading: _loading,
              onPressed: _createRide,
            ),
          ],
        ),
      ),
    );
  }
}
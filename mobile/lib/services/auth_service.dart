import 'package:shared_preferences/shared_preferences.dart';
import '../core/api_client.dart';
import '../core/constants.dart';

class AuthService {
  final ApiClient _apiClient = ApiClient();

  Future<void> login({
    required String email,
    required String password,
  }) async {
    final data = await _apiClient.post(
      "${AppConstants.apiBaseUrl}/auth/login",
      {
        "email": email,
        "password": password,
      },
    );

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString("token", data["token"]);
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final data = await _apiClient.post(
      "${AppConstants.apiBaseUrl}/auth/register",
      {
        "name": name,
        "email": email,
        "password": password,
      },
    );

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString("token", data["token"]);
  }

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString("token") != null;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove("token");
  }
}
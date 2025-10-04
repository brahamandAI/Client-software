import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import 'api_service.dart';

class AuthService extends ChangeNotifier {
  final SharedPreferences _prefs;
  final ApiService _apiService = ApiService();

  User? _currentUser;
  bool _isLoading = false;
  String? _error;

  AuthService(this._prefs) {
    _apiService.initialize(_prefs);
    _loadUserFromStorage();
  }

  User? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _currentUser != null;

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String? error) {
    _error = error;
    notifyListeners();
  }

  Future<void> _loadUserFromStorage() async {
    try {
      _setLoading(true);
      final token = _prefs.getString('auth_token');
      if (token != null) {
        _currentUser = await _apiService.getCurrentUser();
        notifyListeners();
      }
    } catch (e) {
      _setError('Failed to load user: $e');
      await logout();
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> login(String email, String password) async {
    try {
      _setLoading(true);
      _setError(null);

      _currentUser = await _apiService.login(email, password);
      notifyListeners();
      return true;
    } catch (e) {
      _setError('Login failed: $e');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> signup(String name, String email, String password, String role, {String? stationId}) async {
    try {
      _setLoading(true);
      _setError(null);

      _currentUser = await _apiService.signup(name, email, password, role, stationId: stationId);
      notifyListeners();
      return true;
    } catch (e) {
      _setError('Signup failed: $e');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> logout() async {
    try {
      await _apiService.logout();
      _currentUser = null;
      _setError(null);
      notifyListeners();
    } catch (e) {
      _setError('Logout failed: $e');
    }
  }

  void clearError() {
    _setError(null);
  }

  // Helper methods for role checking
  bool get isSuperAdmin => _currentUser?.isSuperAdmin ?? false;
  bool get isStationManager => _currentUser?.isStationManager ?? false;
  bool get isStaff => _currentUser?.isStaff ?? false;
  bool get isPublic => _currentUser?.isPublic ?? false;

  String get userRole => _currentUser?.role ?? '';
  String get userName => _currentUser?.name ?? '';
  String get userEmail => _currentUser?.email ?? '';
  String? get userStationId => _currentUser?.stationId;
}

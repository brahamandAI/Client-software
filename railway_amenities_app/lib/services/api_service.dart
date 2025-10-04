import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../models/station.dart';
import '../models/issue.dart';
import '../models/inspection.dart';
import '../utils/constants.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  late SharedPreferences _prefs;
  String? _authToken;

  void initialize(SharedPreferences prefs) {
    _prefs = prefs;
    _authToken = _prefs.getString('auth_token');
  }

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_authToken != null) 'Authorization': 'Bearer $_authToken',
  };

  Future<void> _saveToken(String token) async {
    _authToken = token;
    await _prefs.setString('auth_token', token);
  }

  Future<void> _clearToken() async {
    _authToken = null;
    await _prefs.remove('auth_token');
  }

  // Auth endpoints
  Future<User> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}${ApiConstants.loginEndpoint}'),
        headers: _headers,
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final user = User.fromJson(data['user']);
        await _saveToken(data['token']);
        return user;
      } else {
        throw Exception('Login failed: ${response.body}');
      }
    } catch (e) {
      throw Exception('Login error: $e');
    }
  }

  Future<User> signup(String name, String email, String password, String role, {String? stationId}) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}${ApiConstants.signupEndpoint}'),
        headers: _headers,
        body: jsonEncode({
          'name': name,
          'email': email,
          'password': password,
          'role': role,
          'stationId': stationId,
        }),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        final user = User.fromJson(data['user']);
        await _saveToken(data['token']);
        return user;
      } else {
        throw Exception('Signup failed: ${response.body}');
      }
    } catch (e) {
      throw Exception('Signup error: $e');
    }
  }

  Future<User> getCurrentUser() async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}${ApiConstants.meEndpoint}'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return User.fromJson(data);
      } else {
        throw Exception('Failed to get user: ${response.body}');
      }
    } catch (e) {
      throw Exception('Get user error: $e');
    }
  }

  Future<void> logout() async {
    await _clearToken();
  }

  // Station endpoints
  Future<List<Station>> getStations({String? region}) async {
    try {
      String url = '${ApiConstants.baseUrl}${ApiConstants.stationsEndpoint}';
      if (region != null) {
        url += '?region=$region';
      }

      final response = await http.get(
        Uri.parse(url),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Station.fromJson(json)).toList();
      } else {
        throw Exception('Failed to get stations: ${response.body}');
      }
    } catch (e) {
      throw Exception('Get stations error: $e');
    }
  }

  Future<Station> createStation(Station station) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}${ApiConstants.stationsEndpoint}'),
        headers: _headers,
        body: jsonEncode(station.toJson()),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return Station.fromJson(data);
      } else {
        throw Exception('Failed to create station: ${response.body}');
      }
    } catch (e) {
      throw Exception('Create station error: $e');
    }
  }

  // Issue endpoints
  Future<List<Issue>> getIssues({String? status, String? priority, String? stationId}) async {
    try {
      String url = '${ApiConstants.baseUrl}${ApiConstants.issuesEndpoint}';
      List<String> params = [];
      
      if (status != null) params.add('status=$status');
      if (priority != null) params.add('priority=$priority');
      if (stationId != null) params.add('stationId=$stationId');
      
      if (params.isNotEmpty) {
        url += '?${params.join('&')}';
      }

      final response = await http.get(
        Uri.parse(url),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Issue.fromJson(json)).toList();
      } else {
        throw Exception('Failed to get issues: ${response.body}');
      }
    } catch (e) {
      throw Exception('Get issues error: $e');
    }
  }

  Future<Issue> createIssue(Issue issue) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}${ApiConstants.issuesEndpoint}'),
        headers: _headers,
        body: jsonEncode(issue.toJson()),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return Issue.fromJson(data);
      } else {
        throw Exception('Failed to create issue: ${response.body}');
      }
    } catch (e) {
      throw Exception('Create issue error: $e');
    }
  }

  Future<Issue> updateIssueStatus(String issueId, String status) async {
    try {
      final response = await http.patch(
        Uri.parse('${ApiConstants.baseUrl}${ApiConstants.issuesEndpoint}/$issueId/status'),
        headers: _headers,
        body: jsonEncode({'status': status}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return Issue.fromJson(data);
      } else {
        throw Exception('Failed to update issue: ${response.body}');
      }
    } catch (e) {
      throw Exception('Update issue error: $e');
    }
  }

  // Inspection endpoints
  Future<List<Inspection>> getInspections({String? stationId, String? status}) async {
    try {
      String url = '${ApiConstants.baseUrl}${ApiConstants.inspectionsEndpoint}';
      List<String> params = [];
      
      if (stationId != null) params.add('stationId=$stationId');
      if (status != null) params.add('status=$status');
      
      if (params.isNotEmpty) {
        url += '?${params.join('&')}';
      }

      final response = await http.get(
        Uri.parse(url),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Inspection.fromJson(json)).toList();
      } else {
        throw Exception('Failed to get inspections: ${response.body}');
      }
    } catch (e) {
      throw Exception('Get inspections error: $e');
    }
  }

  Future<Inspection> createInspection(Inspection inspection) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}${ApiConstants.inspectionsEndpoint}'),
        headers: _headers,
        body: jsonEncode(inspection.toJson()),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return Inspection.fromJson(data);
      } else {
        throw Exception('Failed to create inspection: ${response.body}');
      }
    } catch (e) {
      throw Exception('Create inspection error: $e');
    }
  }

  // File upload
  Future<String> uploadImage(File imageFile) async {
    try {
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('${ApiConstants.baseUrl}${ApiConstants.uploadEndpoint}'),
      );

      request.headers.addAll(_headers);
      request.files.add(await http.MultipartFile.fromPath('file', imageFile.path));

      var response = await request.send();

      if (response.statusCode == 200) {
        final responseData = await response.stream.bytesToString();
        final data = jsonDecode(responseData);
        return data['url'] ?? data['path'];
      } else {
        throw Exception('Failed to upload image: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Upload image error: $e');
    }
  }

  // Reports
  Future<Map<String, dynamic>> getMisReport({String period = 'daily'}) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}${ApiConstants.reportsEndpoint}/mis?period=$period'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to get MIS report: ${response.body}');
      }
    } catch (e) {
      throw Exception('Get MIS report error: $e');
    }
  }

  // Users
  Future<List<User>> getUsers() async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}${ApiConstants.usersEndpoint}'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => User.fromJson(json)).toList();
      } else {
        throw Exception('Failed to get users: ${response.body}');
      }
    } catch (e) {
      throw Exception('Get users error: $e');
    }
  }
}

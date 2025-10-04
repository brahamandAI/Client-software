import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFFFF6B35);
  static const Color secondary = Color(0xFFD32F2F);
  static const Color accent = Color(0xFF1976D2);
  static const Color background = Color(0xFFF5F5F5);
  static const Color surface = Colors.white;
  static const Color error = Color(0xFFD32F2F);
  static const Color success = Color(0xFF4CAF50);
  static const Color warning = Color(0xFFFF9800);
  static const Color info = Color(0xFF2196F3);
  
  // Railway specific colors
  static const Color railwayOrange = Color(0xFFFF6B35);
  static const Color railwayRed = Color(0xFFD32F2F);
  static const Color railwayNavy = Color(0xFF1A237E);
  static const Color railwayCream = Color(0xFFFFF8E1);
}

class AppStrings {
  static const String appName = 'Railway Amenities';
  static const String appVersion = '1.0.0';
  
  // Auth
  static const String login = 'Login';
  static const String signup = 'Sign Up';
  static const String logout = 'Logout';
  static const String email = 'Email';
  static const String password = 'Password';
  static const String confirmPassword = 'Confirm Password';
  static const String name = 'Name';
  
  // Roles
  static const String superAdmin = 'SuperAdmin';
  static const String stationManager = 'StationManager';
  static const String staff = 'Staff';
  static const String public = 'Public';
  
  // Dashboard
  static const String dashboard = 'Dashboard';
  static const String stations = 'Stations';
  static const String issues = 'Issues';
  static const String inspections = 'Inspections';
  static const String reports = 'Reports';
  static const String settings = 'Settings';
  
  // Common
  static const String loading = 'Loading...';
  static const String error = 'Error';
  static const String success = 'Success';
  static const String cancel = 'Cancel';
  static const String save = 'Save';
  static const String delete = 'Delete';
  static const String edit = 'Edit';
  static const String add = 'Add';
  static const String search = 'Search';
  static const String filter = 'Filter';
  static const String refresh = 'Refresh';
}

class ApiConstants {
  // For web: localhost, For mobile: IP address
  // Change to localhost for web testing, or IP address for phone
  static const String baseUrl = 'http://10.118.59.187:3000/api';
  static const String authEndpoint = '/auth';
  static const String stationsEndpoint = '/stations';
  static const String issuesEndpoint = '/issues';
  static const String inspectionsEndpoint = '/inspections';
  static const String reportsEndpoint = '/reports';
  static const String usersEndpoint = '/users';
  static const String mediaEndpoint = '/media';
  
  // Auth endpoints
  static const String loginEndpoint = '$authEndpoint/login';
  static const String signupEndpoint = '$authEndpoint/signup';
  static const String meEndpoint = '$authEndpoint/me';
  
  // Media endpoints
  static const String uploadEndpoint = '$mediaEndpoint/upload';
}

class AppDimensions {
  static const double paddingSmall = 8.0;
  static const double paddingMedium = 16.0;
  static const double paddingLarge = 24.0;
  static const double paddingXLarge = 32.0;
  
  static const double marginSmall = 8.0;
  static const double marginMedium = 16.0;
  static const double marginLarge = 24.0;
  
  static const double borderRadius = 8.0;
  static const double borderRadiusLarge = 12.0;
  
  static const double elevation = 2.0;
  static const double elevationLarge = 4.0;
}

class AppTextStyles {
  static const TextStyle heading1 = TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: AppColors.primary,
  );
  
  static const TextStyle heading2 = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.bold,
    color: AppColors.primary,
  );
  
  static const TextStyle heading3 = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    color: AppColors.primary,
  );
  
  static const TextStyle bodyLarge = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.normal,
  );
  
  static const TextStyle bodyMedium = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.normal,
  );
  
  static const TextStyle bodySmall = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.normal,
  );
  
  static const TextStyle button = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: Colors.white,
  );
}

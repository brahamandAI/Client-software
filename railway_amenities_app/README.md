# Railway Amenities Android App

A comprehensive Android application for managing railway station amenities, inspections, and issue tracking. Built with Flutter for cross-platform compatibility.

## 🚀 Features

### Core Functionality
- **Station Management**: View and manage railway stations
- **Issue Reporting**: Report issues with amenities using camera
- **Inspections**: Conduct daily inspections with photo documentation
- **Role-Based Access**: Different access levels for different user types
- **Real-time Updates**: Live data synchronization
- **Offline Support**: Work without internet connection

### User Roles
- **SuperAdmin**: Full system access and management
- **StationManager**: Manage assigned station and staff
- **Staff**: Conduct inspections and report issues
- **Public**: View station information and report issues

### Technical Features
- **Flutter Framework**: Cross-platform mobile development
- **Material Design 3**: Modern, beautiful UI
- **Camera Integration**: Photo capture for issues and inspections
- **Location Services**: GPS integration for station location
- **Push Notifications**: Real-time alerts and updates
- **Offline Storage**: Local data caching

## 🛠️ Tech Stack

- **Flutter**: 3.0+ with Dart
- **State Management**: Provider pattern
- **HTTP Client**: Dio for API calls
- **Local Storage**: SharedPreferences
- **Image Handling**: Image Picker, Cached Network Image
- **Location**: Geolocator
- **Notifications**: Flutter Local Notifications

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Flutter SDK 3.0+
- Android Studio or VS Code
- Android SDK (API level 21+)
- Git

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd railway_amenities_app
```

### 2. Install Dependencies
```bash
flutter pub get
```

### 3. Configure API Endpoints
Update the API base URL in `lib/utils/constants.dart`:
```dart
class ApiConstants {
  static const String baseUrl = 'http://your-api-url.com/api';
  // ... other constants
}
```

### 4. Run the App
```bash
# Debug mode
flutter run

# Release mode
flutter run --release
```

## 📱 App Structure

```
lib/
├── main.dart                 # App entry point
├── models/                   # Data models
│   ├── user.dart
│   ├── station.dart
│   ├── issue.dart
│   └── inspection.dart
├── screens/                  # App screens
│   ├── auth/                # Authentication screens
│   ├── dashboard/           # Dashboard screens
│   ├── stations/            # Station management
│   ├── issues/              # Issue management
│   ├── inspections/         # Inspection screens
│   ├── users/               # User management
│   └── reports/             # Reports and analytics
├── services/                # API and business logic
│   ├── api_service.dart
│   └── auth_service.dart
├── widgets/                 # Reusable UI components
│   ├── custom_button.dart
│   └── custom_text_field.dart
└── utils/                   # Utilities and constants
    └── constants.dart
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
API_BASE_URL=http://your-api-url.com/api
GOOGLE_MAPS_API_KEY=your-google-maps-key
```

### Android Permissions
The app requires the following permissions:
- `INTERNET`: For API calls
- `CAMERA`: For photo capture
- `READ_EXTERNAL_STORAGE`: For image access
- `WRITE_EXTERNAL_STORAGE`: For image storage
- `ACCESS_FINE_LOCATION`: For GPS location
- `VIBRATE`: For notifications

## 📱 Screens Overview

### Authentication
- **Login Screen**: User authentication
- **Signup Screen**: New user registration

### Dashboards
- **Admin Dashboard**: System overview and management
- **Manager Dashboard**: Station management
- **Staff Dashboard**: Daily operations
- **Public Dashboard**: Station information

### Core Features
- **Station List**: Browse all railway stations
- **Station Detail**: View station amenities and information
- **Issue List**: View and manage reported issues
- **Create Issue**: Report new issues with photos
- **Inspection List**: View inspection history
- **Create Inspection**: Conduct new inspections
- **User Management**: Manage user accounts
- **Reports**: Analytics and reporting

## 🎨 UI/UX Features

- **Material Design 3**: Modern, consistent design
- **Railway Theme**: Custom colors and branding
- **Responsive Layout**: Works on all screen sizes
- **Dark Mode Support**: Automatic theme switching
- **Accessibility**: Screen reader and accessibility support
- **Smooth Animations**: Fluid transitions and interactions

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-Based Access**: Granular permission system
- **Data Validation**: Input sanitization and validation
- **Secure Storage**: Encrypted local data storage
- **API Security**: HTTPS and secure endpoints

## 📊 Performance Optimizations

- **Image Caching**: Efficient image loading and caching
- **Lazy Loading**: On-demand data loading
- **Memory Management**: Optimized memory usage
- **Network Optimization**: Efficient API calls
- **Offline Support**: Local data synchronization

## 🧪 Testing

### Run Tests
```bash
# Unit tests
flutter test

# Integration tests
flutter test integration_test/

# Coverage report
flutter test --coverage
```

### Test Coverage
- Unit tests for business logic
- Widget tests for UI components
- Integration tests for user flows
- API service tests

## 📦 Building for Production

### Android APK
```bash
# Build APK
flutter build apk --release

# Build App Bundle (recommended for Play Store)
flutter build appbundle --release
```

### Build Configuration
- **Target SDK**: Android 13 (API 33)
- **Minimum SDK**: Android 5.0 (API 21)
- **Architecture**: ARM64, ARMv7, x86_64
- **Signing**: Release keystore configuration

## 🚀 Deployment

### Google Play Store
1. Build release APK/AAB
2. Create Play Console listing
3. Upload and configure app
4. Submit for review

### Internal Distribution
1. Build APK
2. Distribute via internal channels
3. Install on target devices

## 🔄 API Integration

The app integrates with the Railway Amenities backend API:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current user

### Stations
- `GET /api/stations` - List stations
- `GET /api/stations/:id` - Get station details

### Issues
- `GET /api/issues` - List issues
- `POST /api/issues` - Create issue
- `PATCH /api/issues/:id/status` - Update status

### Inspections
- `GET /api/inspections` - List inspections
- `POST /api/inspections` - Create inspection

### Media
- `POST /api/media/upload` - Upload images

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   - Ensure Flutter SDK is properly installed
   - Run `flutter doctor` to check setup
   - Clean and rebuild: `flutter clean && flutter pub get`

2. **API Connection Issues**
   - Check network connectivity
   - Verify API base URL configuration
   - Check server status

3. **Camera Issues**
   - Ensure camera permissions are granted
   - Check device camera functionality
   - Verify image picker configuration

4. **Location Issues**
   - Enable location services
   - Grant location permissions
   - Check GPS functionality

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed description

## 🔄 Future Enhancements

- [ ] Push notifications
- [ ] Offline data sync
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Voice notes for inspections
- [ ] QR code scanning
- [ ] Real-time chat
- [ ] Advanced reporting features

---

**Note**: This is a production-ready Android application. Ensure proper testing and configuration before deployment.

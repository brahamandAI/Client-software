import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../utils/constants.dart';
import '../../widgets/custom_button.dart';
import '../../models/station.dart';
import '../stations/station_detail_screen.dart';
import '../issues/issue_list_screen.dart';
import '../inspections/inspection_list_screen.dart';
import '../inspections/create_inspection_screen.dart';
import '../issues/create_issue_screen.dart';
import '../settings/settings_screen.dart';
import '../notifications/notifications_screen.dart';
import '../auth/login_screen.dart';

class StaffDashboard extends StatefulWidget {
  const StaffDashboard({Key? key}) : super(key: key);

  @override
  State<StaffDashboard> createState() => _StaffDashboardState();
}

class _StaffDashboardState extends State<StaffDashboard> {
  int _selectedIndex = 0;

  final List<Widget> _screens = [
    const StaffHomeScreen(),
    const StationDetailScreen(
      station: Station(id: '', name: 'Sample Station', code: 'SMP', region: 'Sample Region', address: 'Sample Address', geoLat: 0.0, geoLng: 0.0),
      showAppBar: false,
    ),
    const IssueListScreen(showAppBar: false),
    const InspectionListScreen(showAppBar: false),
  ];

  final List<String> _titles = [
    'Staff Dashboard',
    'My Station',
    'Issues',
    'Inspections',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_titles[_selectedIndex]),
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications),
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (context) => const NotificationsScreen()),
                  );
                },
              ),
              Positioned(
                right: 8,
                top: 8,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: const BoxDecoration(
                    color: AppColors.error,
                    shape: BoxShape.circle,
                  ),
                  constraints: const BoxConstraints(
                    minWidth: 16,
                    minHeight: 16,
                  ),
                  child: const Text(
                    '2',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
            ],
          ),
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'logout') {
                _handleLogout();
              } else if (value == 'settings') {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (context) => const SettingsScreen()),
                );
              } else if (value == 'profile') {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (context) => const SettingsScreen()),
                );
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'profile',
                child: ListTile(
                  leading: Icon(Icons.person),
                  title: Text('Profile'),
                ),
              ),
              const PopupMenuItem(
                value: 'settings',
                child: ListTile(
                  leading: Icon(Icons.settings),
                  title: Text('Settings'),
                ),
              ),
              const PopupMenuItem(
                value: 'logout',
                child: ListTile(
                  leading: Icon(Icons.logout),
                  title: Text('Logout'),
                ),
              ),
            ],
          ),
        ],
      ),
      body: _screens[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.train),
            label: 'Station',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.warning),
            label: 'Issues',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.checklist),
            label: 'Inspections',
          ),
        ],
      ),
    );
  }

  void _handleLogout() async {
    final authService = Provider.of<AuthService>(context, listen: false);
    await authService.logout();
    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
    }
  }
}

class StaffHomeScreen extends StatefulWidget {
  const StaffHomeScreen({Key? key}) : super(key: key);

  @override
  State<StaffHomeScreen> createState() => _StaffHomeScreenState();
}

class _StaffHomeScreenState extends State<StaffHomeScreen> {
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppDimensions.paddingMedium),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Welcome Section
          Consumer<AuthService>(
            builder: (context, authService, child) {
              return Card(
                child: Padding(
                  padding: const EdgeInsets.all(AppDimensions.paddingMedium),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Good morning, ${authService.userName}!',
                        style: AppTextStyles.heading2,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Ready to start your daily inspections and issue reporting',
                        style: AppTextStyles.bodyLarge.copyWith(
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
          
          const SizedBox(height: 20),
          
          // Today's Tasks
          Text(
            'Today\'s Tasks',
            style: AppTextStyles.heading3,
          ),
          const SizedBox(height: 16),
          
          Card(
            child: Padding(
              padding: const EdgeInsets.all(AppDimensions.paddingMedium),
              child: Column(
                children: [
                  _buildTaskItem(
                    'Morning Inspection',
                    'Platform 1-3',
                    Icons.checklist,
                    AppColors.primary,
                    () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (context) => const CreateInspectionScreen()),
                      );
                    },
                  ),
                  const Divider(),
                  _buildTaskItem(
                    'Issue Follow-up',
                    'Water booth repair',
                    Icons.warning,
                    AppColors.warning,
                    () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (context) => const IssueListScreen()),
                      );
                    },
                  ),
                  const Divider(),
                  _buildTaskItem(
                    'Evening Inspection',
                    'Platform 4-6',
                    Icons.checklist,
                    AppColors.success,
                    () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (context) => const CreateInspectionScreen()),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 20),
          
          // Quick Actions
          Text(
            'Quick Actions',
            style: AppTextStyles.heading3,
          ),
          const SizedBox(height: 16),
          
          Column(
            children: [
              CustomButton(
                text: 'Start Inspection',
                icon: Icons.checklist,
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (context) => const InspectionListScreen()),
                  );
                },
              ),
              const SizedBox(height: 12),
              CustomButton(
                text: 'Report Issue',
                icon: Icons.add_alert,
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (context) => const CreateIssueScreen()),
                  );
                },
              ),
              const SizedBox(height: 12),
              CustomButton(
                text: 'View My Station',
                icon: Icons.train,
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (context) => const StationDetailScreen(station: Station(id: '', name: 'Sample Station', code: 'SMP', region: 'Sample Region', address: 'Sample Address', geoLat: 0.0, geoLng: 0.0))),
                  );
                },
              ),
            ],
          ),
          
          const SizedBox(height: 20),
          
          // Recent Activity
          Text(
            'Recent Activity',
            style: AppTextStyles.heading3,
          ),
          const SizedBox(height: 16),
          
          Card(
            child: Padding(
              padding: const EdgeInsets.all(AppDimensions.paddingMedium),
              child: Column(
                children: [
                  _buildActivityItem(
                    'Completed inspection',
                    'Platform 2 - All amenities working',
                    '2 hours ago',
                    Icons.check_circle,
                    AppColors.success,
                  ),
                  const Divider(),
                  _buildActivityItem(
                    'Reported issue',
                    'Toilet cleaning required',
                    '4 hours ago',
                    Icons.warning,
                    AppColors.warning,
                  ),
                  const Divider(),
                  _buildActivityItem(
                    'Updated status',
                    'Water booth repair completed',
                    '6 hours ago',
                    Icons.info,
                    AppColors.info,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTaskItem(String title, String subtitle, IconData icon, Color color, VoidCallback onTap) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: color.withOpacity(0.1),
        child: Icon(icon, color: color, size: 20),
      ),
      title: Text(title),
      subtitle: Text(subtitle),
      trailing: const Icon(Icons.arrow_forward_ios, size: 16),
      onTap: onTap,
    );
  }

  Widget _buildActivityItem(String title, String subtitle, String time, IconData icon, Color color) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: color.withOpacity(0.1),
        child: Icon(icon, color: color, size: 20),
      ),
      title: Text(title),
      subtitle: Text(subtitle),
      trailing: Text(
        time,
        style: AppTextStyles.bodySmall.copyWith(
          color: Colors.grey[600],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../utils/constants.dart';
import '../../widgets/custom_button.dart';
import '../../models/station.dart';
import '../stations/station_detail_screen.dart';
import '../issues/issue_list_screen.dart';
import '../issues/create_issue_screen.dart';
import '../inspections/inspection_list_screen.dart';
import '../inspections/create_inspection_screen.dart';
import '../reports/reports_screen.dart';
import '../settings/settings_screen.dart';
import '../notifications/notifications_screen.dart';
import '../auth/login_screen.dart';

class ManagerDashboard extends StatefulWidget {
  const ManagerDashboard({Key? key}) : super(key: key);

  @override
  State<ManagerDashboard> createState() => _ManagerDashboardState();
}

class _ManagerDashboardState extends State<ManagerDashboard> {
  int _selectedIndex = 0;

  final List<Widget> _screens = [
    const ManagerHomeScreen(),
    const StationDetailScreen(
      station: Station(id: '', name: 'Sample Station', code: 'SMP', region: 'Sample Region', address: 'Sample Address', geoLat: 0.0, geoLng: 0.0),
      showAppBar: false,
    ),
    const IssueListScreen(showAppBar: false),
    const InspectionListScreen(showAppBar: false),
    const ReportsScreen(showAppBar: false),
  ];

  final List<String> _titles = [
    'Manager Dashboard',
    'My Station',
    'Issues',
    'Inspections',
    'Reports',
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
            label: 'My Station',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.warning),
            label: 'Issues',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.checklist),
            label: 'Inspections',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.analytics),
            label: 'Reports',
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

class ManagerHomeScreen extends StatefulWidget {
  const ManagerHomeScreen({Key? key}) : super(key: key);

  @override
  State<ManagerHomeScreen> createState() => _ManagerHomeScreenState();
}

class _ManagerHomeScreenState extends State<ManagerHomeScreen> {
  bool _isLoading = true;
  int _openIssues = 0;
  int _todayInspections = 0;
  int _highPriorityIssues = 0;
  int _resolvedToday = 0;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchDashboardStats();
  }

  Future<void> _fetchDashboardStats() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final apiService = ApiService();
      
      // Fetch issues and inspections
      final results = await Future.wait([
        apiService.getIssues(),
        apiService.getInspections(),
      ]);

      final issues = results[0] as List;
      final inspections = results[1] as List;

      // Calculate stats
      final now = DateTime.now();
      final todayStart = DateTime(now.year, now.month, now.day);

      final openIssues = issues.where((issue) {
        final status = issue.status?.toLowerCase() ?? '';
        return status != 'resolved' && status != 'closed';
      }).length;

      final highPriority = issues.where((issue) {
        return issue.priority?.toLowerCase() == 'high';
      }).length;

      final resolvedToday = issues.where((issue) {
        final status = issue.status?.toLowerCase() ?? '';
        final resolvedAt = issue.resolvedAt;
        return (status == 'resolved' || status == 'closed') &&
               resolvedAt != null &&
               resolvedAt.isAfter(todayStart);
      }).length;

      final todayInspections = inspections.where((inspection) {
        final createdAt = inspection.createdAt;
        return createdAt != null && createdAt.isAfter(todayStart);
      }).length;

      setState(() {
        _openIssues = openIssues;
        _todayInspections = todayInspections;
        _highPriorityIssues = highPriority;
        _resolvedToday = resolvedToday;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _fetchDashboardStats,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
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
                          'Welcome, ${authService.userName}!',
                          style: AppTextStyles.heading2,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Manage your station amenities and staff efficiently',
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
            
            // Error Message
            if (_error != null)
              Card(
                color: Colors.red[50],
                child: Padding(
                  padding: const EdgeInsets.all(AppDimensions.paddingMedium),
                  child: Row(
                    children: [
                      Icon(Icons.error_outline, color: AppColors.error),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Failed to load stats. Pull to retry.',
                          style: TextStyle(color: AppColors.error),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            
            if (_error != null) const SizedBox(height: 20),
            
            // Stats Grid
            _isLoading
                ? const Center(
                    child: Padding(
                      padding: EdgeInsets.all(40),
                      child: CircularProgressIndicator(),
                    ),
                  )
                : GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: 2,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    childAspectRatio: 1.5,
                    children: [
                      _buildStatCard(
                        'Open Issues',
                        _openIssues.toString(),
                        Icons.warning,
                        AppColors.warning,
                        () => Navigator.of(context).push(
                          MaterialPageRoute(builder: (context) => const IssueListScreen()),
                        ),
                      ),
                      _buildStatCard(
                        'Today\'s Inspections',
                        _todayInspections.toString(),
                        Icons.checklist,
                        AppColors.success,
                        () => Navigator.of(context).push(
                          MaterialPageRoute(builder: (context) => const InspectionListScreen()),
                        ),
                      ),
                      _buildStatCard(
                        'High Priority',
                        _highPriorityIssues.toString(),
                        Icons.priority_high,
                        AppColors.error,
                        () => Navigator.of(context).push(
                          MaterialPageRoute(builder: (context) => const IssueListScreen()),
                        ),
                      ),
                      _buildStatCard(
                        'Resolved Today',
                        _resolvedToday.toString(),
                        Icons.check_circle,
                        AppColors.info,
                        () => Navigator.of(context).push(
                          MaterialPageRoute(builder: (context) => const IssueListScreen()),
                        ),
                      ),
                    ],
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
                  text: 'View My Station',
                  icon: Icons.train,
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (context) => const StationDetailScreen(station: Station(id: '', name: 'Sample Station', code: 'SMP', region: 'Sample Region', address: 'Sample Address', geoLat: 0.0, geoLng: 0.0))),
                    );
                  },
                ),
                const SizedBox(height: 12),
                CustomButton(
                  text: 'Report New Issue',
                  icon: Icons.add_alert,
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (context) => const CreateIssueScreen()),
                    );
                  },
                ),
                const SizedBox(height: 12),
                CustomButton(
                  text: 'Start Inspection',
                  icon: Icons.checklist,
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (context) => const CreateInspectionScreen()),
                    );
                  },
                ),
                const SizedBox(height: 12),
                CustomButton(
                  text: 'View Reports',
                  icon: Icons.analytics,
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (context) => const ReportsScreen()),
                    );
                  },
                ),
              ],
            ),
            
            const SizedBox(height: 20),
            
            // Recent Issues
            Text(
              'Recent Issues',
              style: AppTextStyles.heading3,
            ),
            const SizedBox(height: 16),
            
            Card(
              child: Padding(
                padding: const EdgeInsets.all(AppDimensions.paddingMedium),
                child: Column(
                  children: [
                    _buildIssueItem('Water booth not working', 'High', '2 hours ago'),
                    const Divider(),
                    _buildIssueItem('Toilet cleaning required', 'Medium', '4 hours ago'),
                    const Divider(),
                    _buildIssueItem('Light not working', 'Low', '6 hours ago'),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color, VoidCallback onTap) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppDimensions.borderRadius),
        child: Padding(
          padding: const EdgeInsets.all(AppDimensions.paddingMedium),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 32, color: color),
              const SizedBox(height: 8),
              Text(
                value,
                style: AppTextStyles.heading2.copyWith(color: color),
              ),
              const SizedBox(height: 4),
              Text(
                title,
                style: AppTextStyles.bodySmall,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildIssueItem(String title, String priority, String time) {
    Color priorityColor = priority == 'High' 
        ? AppColors.error 
        : priority == 'Medium' 
            ? AppColors.warning 
            : AppColors.success;

    return ListTile(
      leading: CircleAvatar(
        backgroundColor: priorityColor.withOpacity(0.1),
        child: Icon(
          Icons.warning,
          color: priorityColor,
          size: 20,
        ),
      ),
      title: Text(title),
      subtitle: Text(time),
      trailing: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: priorityColor.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          priority,
          style: AppTextStyles.bodySmall.copyWith(
            color: priorityColor,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(builder: (context) => const IssueListScreen()),
        );
      },
    );
  }
}

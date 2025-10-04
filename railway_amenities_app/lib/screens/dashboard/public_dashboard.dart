import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../utils/constants.dart';
import '../../widgets/custom_button.dart';
import '../stations/station_list_screen.dart';
import '../issues/create_issue_screen.dart';
import '../auth/login_screen.dart';

class PublicDashboard extends StatefulWidget {
  const PublicDashboard({Key? key}) : super(key: key);

  @override
  State<PublicDashboard> createState() => _PublicDashboardState();
}

class _PublicDashboardState extends State<PublicDashboard> {
  int _selectedIndex = 0;

  final List<Widget> _screens = [
    const PublicHomeScreen(),
    const StationListScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Railway Amenities'),
        actions: [
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'logout') {
                _handleLogout();
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
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.train),
            label: 'Stations',
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

class PublicHomeScreen extends StatefulWidget {
  const PublicHomeScreen({Key? key}) : super(key: key);

  @override
  State<PublicHomeScreen> createState() => _PublicHomeScreenState();
}

class _PublicHomeScreenState extends State<PublicHomeScreen> {
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
                        'Welcome to Railway Amenities!',
                        style: AppTextStyles.heading2,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Find information about railway stations and report issues',
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
          
          // Features Grid
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            childAspectRatio: 1.2,
            children: [
              _buildFeatureCard(
                'Find Stations',
                'Locate railway stations near you',
                Icons.location_on,
                AppColors.primary,
                () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (context) => const StationListScreen()),
                ),
              ),
              _buildFeatureCard(
                'Report Issues',
                'Report problems with amenities',
                Icons.report_problem,
                AppColors.warning,
                () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (context) => const CreateIssueScreen()),
                ),
              ),
              _buildFeatureCard(
                'Station Info',
                'View station amenities and facilities',
                Icons.info,
                AppColors.info,
                () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (context) => const StationListScreen()),
                ),
              ),
              _buildFeatureCard(
                'Contact Us',
                'Get help and support',
                Icons.contact_support,
                AppColors.success,
                () {
                  // TODO: Show contact information
                },
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
                text: 'Browse All Stations',
                icon: Icons.train,
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (context) => const StationListScreen()),
                  );
                },
              ),
              const SizedBox(height: 12),
              CustomButton(
                text: 'Report an Issue',
                icon: Icons.add_alert,
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (context) => const CreateIssueScreen()),
                  );
                },
              ),
            ],
          ),
          
          const SizedBox(height: 20),
          
          // Information Section
          Card(
            child: Padding(
              padding: const EdgeInsets.all(AppDimensions.paddingMedium),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'About Railway Amenities',
                    style: AppTextStyles.heading3,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'This app helps you find information about railway station amenities and report any issues you encounter. You can:',
                    style: AppTextStyles.bodyMedium,
                  ),
                  const SizedBox(height: 8),
                  const Text('• View station locations and amenities'),
                  const Text('• Report issues with facilities'),
                  const Text('• Get real-time updates on repairs'),
                  const Text('• Contact station management'),
                  const SizedBox(height: 16),
                  Text(
                    'Your feedback helps us improve railway services for all passengers.',
                    style: AppTextStyles.bodyMedium.copyWith(
                      fontStyle: FontStyle.italic,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureCard(String title, String subtitle, IconData icon, Color color, VoidCallback onTap) {
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
                title,
                style: AppTextStyles.bodyLarge.copyWith(
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: AppTextStyles.bodySmall.copyWith(
                  color: Colors.grey[600],
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

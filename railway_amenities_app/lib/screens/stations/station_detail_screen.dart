import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../models/station.dart';
import '../../utils/constants.dart';
import '../../widgets/custom_button.dart';
import '../issues/create_issue_screen.dart';

class StationDetailScreen extends StatefulWidget {
  final Station station;
  final bool showAppBar;

  const StationDetailScreen({
    Key? key,
    required this.station,
    this.showAppBar = true,
  }) : super(key: key);

  @override
  State<StationDetailScreen> createState() => _StationDetailScreenState();
}

class _StationDetailScreenState extends State<StationDetailScreen> {
  
  Future<void> _openMap(double lat, double lng, String name) async {
    final url = Uri.parse('https://www.google.com/maps/search/?api=1&query=$lat,$lng');
    
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open map')),
        );
      }
    }
  }

  Future<void> _openDirections(double lat, double lng, String name) async {
    final url = Uri.parse('https://www.google.com/maps/dir/?api=1&destination=$lat,$lng');
    
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open directions')),
        );
      }
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: widget.showAppBar ? AppBar(
        title: Text(widget.station.name),
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () {
              // TODO: Implement share functionality
            },
          ),
        ],
      ) : null,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppDimensions.paddingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Station Header
            Card(
              child: Padding(
                padding: const EdgeInsets.all(AppDimensions.paddingMedium),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(
                            Icons.train,
                            color: AppColors.primary,
                            size: 32,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.station.name,
                                style: AppTextStyles.heading2,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Station Code: ${widget.station.code}',
                                style: AppTextStyles.bodyLarge.copyWith(
                                  color: Colors.grey[600],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    _buildInfoRow(Icons.location_on, 'Address', widget.station.address),
                    const SizedBox(height: 12),
                    _buildInfoRow(Icons.public, 'Region', widget.station.region),
                    const SizedBox(height: 12),
                    _buildInfoRow(Icons.map, 'Coordinates', 
                        '${widget.station.geoLat.toStringAsFixed(4)}, ${widget.station.geoLng.toStringAsFixed(4)}'),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 20),
            
            // Amenities Section
            Text(
              'Station Amenities',
              style: AppTextStyles.heading3,
            ),
            const SizedBox(height: 16),
            
            Card(
              child: Padding(
                padding: const EdgeInsets.all(AppDimensions.paddingMedium),
                child: Column(
                  children: [
                    _buildAmenityItem('Water Booths', '4', Icons.water_drop, AppColors.info),
                    const Divider(),
                    _buildAmenityItem('Toilets', '8', Icons.wc, AppColors.primary),
                    const Divider(),
                    _buildAmenityItem('Seating', '50', Icons.chair, AppColors.success),
                    const Divider(),
                    _buildAmenityItem('Lighting', '25', Icons.lightbulb, AppColors.warning),
                    const Divider(),
                    _buildAmenityItem('Fans', '15', Icons.ac_unit, AppColors.info),
                    const Divider(),
                    _buildAmenityItem('Dustbins', '20', Icons.delete, AppColors.secondary),
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
                  text: 'Report an Issue',
                  icon: Icons.add_alert,
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (context) => CreateIssueScreen(station: widget.station),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 12),
                CustomButton(
                  text: 'View on Map',
                  icon: Icons.map,
                  onPressed: () => _openMap(widget.station.geoLat, widget.station.geoLng, widget.station.name),
                ),
                const SizedBox(height: 12),
                CustomButton(
                  text: 'Get Directions',
                  icon: Icons.directions,
                  onPressed: () => _openDirections(widget.station.geoLat, widget.station.geoLng, widget.station.name),
                ),
              ],
            ),
            
            const SizedBox(height: 20),
            
            // Station Status
            Card(
              child: Padding(
                padding: const EdgeInsets.all(AppDimensions.paddingMedium),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Station Status',
                      style: AppTextStyles.heading3,
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Container(
                          width: 12,
                          height: 12,
                          decoration: const BoxDecoration(
                            color: AppColors.success,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'All amenities operational',
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: AppColors.success,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Last updated: 2 hours ago',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 20, color: Colors.grey[600]),
        const SizedBox(width: 12),
        Text(
          '$label: ',
          style: AppTextStyles.bodyMedium.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: AppTextStyles.bodyMedium,
          ),
        ),
      ],
    );
  }

  Widget _buildAmenityItem(String name, String count, IconData icon, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              name,
              style: AppTextStyles.bodyLarge,
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Text(
              count,
              style: AppTextStyles.bodyMedium.copyWith(
                color: color,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

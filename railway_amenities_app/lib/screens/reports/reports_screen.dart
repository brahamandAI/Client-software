import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../utils/constants.dart';
import '../../widgets/custom_button.dart';

class ReportsScreen extends StatefulWidget {
  final bool showAppBar;
  
  const ReportsScreen({Key? key, this.showAppBar = true}) : super(key: key);

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  final ApiService _apiService = ApiService();
  String _selectedPeriod = 'daily';
  Map<String, dynamic>? _reportData;
  bool _isLoading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadReport();
  }

  Future<void> _loadReport() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final reportData = await _apiService.getMisReport(period: _selectedPeriod);
      
      setState(() {
        _reportData = reportData;
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
    return Scaffold(
      appBar: widget.showAppBar ? AppBar(
        title: const Text('Reports & Analytics'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadReport,
          ),
        ],
      ) : null,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppDimensions.paddingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Period Selection
            Card(
              child: Padding(
                padding: const EdgeInsets.all(AppDimensions.paddingMedium),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Report Period',
                      style: AppTextStyles.heading3,
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: RadioListTile<String>(
                            title: const Text('Daily'),
                            value: 'daily',
                            groupValue: _selectedPeriod,
                            onChanged: (value) {
                              setState(() {
                                _selectedPeriod = value!;
                              });
                              _loadReport();
                            },
                          ),
                        ),
                        Expanded(
                          child: RadioListTile<String>(
                            title: const Text('Weekly'),
                            value: 'weekly',
                            groupValue: _selectedPeriod,
                            onChanged: (value) {
                              setState(() {
                                _selectedPeriod = value!;
                              });
                              _loadReport();
                            },
                          ),
                        ),
                        Expanded(
                          child: RadioListTile<String>(
                            title: const Text('Monthly'),
                            value: 'monthly',
                            groupValue: _selectedPeriod,
                            onChanged: (value) {
                              setState(() {
                                _selectedPeriod = value!;
                              });
                              _loadReport();
                            },
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 20),
            
            // Report Content
            if (_isLoading) ...[
              const Center(
                child: CircularProgressIndicator(),
              ),
            ] else if (_error != null) ...[
              Center(
                child: Column(
                  children: [
                    Icon(
                      Icons.error_outline,
                      size: 64,
                      color: Colors.grey[400],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Error loading report',
                      style: AppTextStyles.heading3,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _error!,
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: Colors.grey[600],
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _loadReport,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            ] else if (_reportData != null) ...[
              _buildReportContent(),
            ] else ...[
              const Center(
                child: Text('No report data available'),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildReportContent() {
    final metrics = _reportData?['metrics'] ?? {};
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Summary Cards
        Text(
          'Summary',
          style: AppTextStyles.heading3,
        ),
        const SizedBox(height: 16),
        
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          childAspectRatio: 1.5,
          children: [
            _buildMetricCard(
              'Total Issues',
              '${metrics['totalIssues'] ?? 0}',
              Icons.warning,
              AppColors.warning,
            ),
            _buildMetricCard(
              'Resolved Issues',
              '${metrics['resolvedIssues'] ?? 0}',
              Icons.check_circle,
              AppColors.success,
            ),
            _buildMetricCard(
              'Open Issues',
              '${metrics['openIssues'] ?? 0}',
              Icons.pending,
              AppColors.error,
            ),
            _buildMetricCard(
              'Avg Resolution Time',
              '${metrics['avgResolutionTime'] ?? 0}h',
              Icons.timer,
              AppColors.info,
            ),
          ],
        ),
        
        const SizedBox(height: 20),
        
        // Detailed Metrics
        Text(
          'Detailed Metrics',
          style: AppTextStyles.heading3,
        ),
        const SizedBox(height: 16),
        
        Card(
          child: Padding(
            padding: const EdgeInsets.all(AppDimensions.paddingMedium),
            child: Column(
              children: [
                _buildMetricRow('Inspections Completed', '${metrics['inspectionsCount'] ?? 0}'),
                const Divider(),
                _buildMetricRow('High Priority Issues', '${metrics['highPriorityIssues'] ?? 0}'),
                const Divider(),
                _buildMetricRow('Medium Priority Issues', '${metrics['mediumPriorityIssues'] ?? 0}'),
                const Divider(),
                _buildMetricRow('Low Priority Issues', '${metrics['lowPriorityIssues'] ?? 0}'),
                const Divider(),
                _buildMetricRow('Issues by Station', '${metrics['issuesByStation']?.length ?? 0}'),
              ],
            ),
          ),
        ),
        
        const SizedBox(height: 20),
        
        // Performance Metrics
        Text(
          'Performance Metrics',
          style: AppTextStyles.heading3,
        ),
        const SizedBox(height: 16),
        
        Card(
          child: Padding(
            padding: const EdgeInsets.all(AppDimensions.paddingMedium),
            child: Column(
              children: [
                _buildPerformanceMetric('Issue Resolution Rate', '${metrics['resolutionRate'] ?? 0}%'),
                const Divider(),
                _buildPerformanceMetric('Average Response Time', '${metrics['avgResponseTime'] ?? 0} minutes'),
                const Divider(),
                _buildPerformanceMetric('Customer Satisfaction', '${metrics['satisfactionScore'] ?? 0}%'),
                const Divider(),
                _buildPerformanceMetric('System Uptime', '${metrics['uptime'] ?? 0}%'),
              ],
            ),
          ),
        ),
        
        const SizedBox(height: 20),
        
        // Export Options
        Text(
          'Export Options',
          style: AppTextStyles.heading3,
        ),
        const SizedBox(height: 16),
        
        Row(
          children: [
            Expanded(
              child: CustomButton(
                text: 'Export PDF',
                icon: Icons.picture_as_pdf,
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('PDF export functionality coming soon'),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: CustomButton(
                text: 'Export Excel',
                icon: Icons.table_chart,
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Excel export functionality coming soon'),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildMetricCard(String title, String value, IconData icon, Color color) {
    return Card(
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
    );
  }

  Widget _buildMetricRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: AppTextStyles.bodyMedium,
          ),
          Text(
            value,
            style: AppTextStyles.bodyMedium.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPerformanceMetric(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: AppTextStyles.bodyLarge,
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Text(
              value,
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.primary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

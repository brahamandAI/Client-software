import 'package:flutter/material.dart';
import '../../models/issue.dart';
import '../../services/api_service.dart';
import '../../utils/constants.dart';
import '../../widgets/custom_text_field.dart';
import 'issue_detail_screen.dart';
import 'create_issue_screen.dart';

class IssueListScreen extends StatefulWidget {
  final bool showAppBar;
  
  const IssueListScreen({Key? key, this.showAppBar = true}) : super(key: key);

  @override
  State<IssueListScreen> createState() => _IssueListScreenState();
}

class _IssueListScreenState extends State<IssueListScreen> {
  final ApiService _apiService = ApiService();
  final TextEditingController _searchController = TextEditingController();
  
  List<Issue> _issues = [];
  List<Issue> _filteredIssues = [];
  bool _isLoading = true;
  String? _error;
  String _selectedFilter = 'all';

  @override
  void initState() {
    super.initState();
    _loadIssues();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadIssues() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final issues = await _apiService.getIssues();
      
      setState(() {
        _issues = issues;
        _filteredIssues = issues;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  void _filterIssues(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredIssues = _issues;
      } else {
        _filteredIssues = _issues.where((issue) {
          return issue.description.toLowerCase().contains(query.toLowerCase()) ||
                 issue.stationName?.toLowerCase().contains(query.toLowerCase()) == true;
        }).toList();
      }
    });
  }

  void _filterByStatus(String status) {
    setState(() {
      _selectedFilter = status;
      if (status == 'all') {
        _filteredIssues = _issues;
      } else {
        _filteredIssues = _issues.where((issue) => issue.status == status).toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: widget.showAppBar ? AppBar(
        title: const Text('Issues'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (context) => const CreateIssueScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadIssues,
          ),
        ],
      ) : null,
      body: Column(
        children: [
          // Search and Filter Bar
          Padding(
            padding: const EdgeInsets.all(AppDimensions.paddingMedium),
            child: Column(
              children: [
                CustomSearchField(
                  controller: _searchController,
                  hintText: 'Search issues...',
                  onSearch: () => _filterIssues(_searchController.text),
                  onClear: () {
                    _searchController.clear();
                    _filterIssues('');
                  },
                ),
                const SizedBox(height: 12),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFilterChip('All', 'all'),
                      const SizedBox(width: 8),
                      _buildFilterChip('Reported', 'reported'),
                      const SizedBox(width: 8),
                      _buildFilterChip('Assigned', 'assigned'),
                      const SizedBox(width: 8),
                      _buildFilterChip('Resolved', 'resolved'),
                      const SizedBox(width: 8),
                      _buildFilterChip('High Priority', 'high'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          // Issues List
          Expanded(
            child: _buildIssuesList(),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _selectedFilter == value;
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) {
          _filterByStatus(value);
        }
      },
      selectedColor: AppColors.primary.withOpacity(0.2),
      checkmarkColor: AppColors.primary,
    );
  }

  Widget _buildIssuesList() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              'Error loading issues',
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
              onPressed: _loadIssues,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_filteredIssues.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.warning_outlined,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              'No issues found',
              style: AppTextStyles.heading3,
            ),
            const SizedBox(height: 8),
            Text(
              'Try adjusting your search or filter criteria',
              style: AppTextStyles.bodyMedium.copyWith(
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: AppDimensions.paddingMedium),
      itemCount: _filteredIssues.length,
      itemBuilder: (context, index) {
        final issue = _filteredIssues[index];
        return _buildIssueCard(issue);
      },
    );
  }

  Widget _buildIssueCard(Issue issue) {
    Color priorityColor = issue.isHighPriority 
        ? AppColors.error 
        : issue.isMediumPriority 
            ? AppColors.warning 
            : AppColors.success;

    Color statusColor = issue.isReported 
        ? AppColors.warning 
        : issue.isAssigned 
            ? AppColors.info 
            : issue.isResolved 
                ? AppColors.success 
                : AppColors.secondary;

    return Card(
      margin: const EdgeInsets.only(bottom: AppDimensions.marginMedium),
      child: InkWell(
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (context) => IssueDetailScreen(issue: issue),
            ),
          );
        },
        borderRadius: BorderRadius.circular(AppDimensions.borderRadius),
        child: Padding(
          padding: const EdgeInsets.all(AppDimensions.paddingMedium),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: priorityColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      Icons.warning,
                      color: priorityColor,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          issue.stationName ?? 'Unknown Station',
                          style: AppTextStyles.bodyMedium.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          issue.description,
                          style: AppTextStyles.bodyMedium,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  const Icon(
                    Icons.arrow_forward_ios,
                    size: 16,
                    color: Colors.grey,
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: priorityColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      issue.priority.toUpperCase(),
                      style: AppTextStyles.bodySmall.copyWith(
                        color: priorityColor,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      issue.status.toUpperCase(),
                      style: AppTextStyles.bodySmall.copyWith(
                        color: statusColor,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(
                    Icons.person,
                    size: 16,
                    color: Colors.grey[600],
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Reported by ${issue.reportedByName ?? 'Unknown'}',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: Colors.grey[600],
                    ),
                  ),
                  const Spacer(),
                  Text(
                    _formatDate(issue.reportedAt),
                    style: AppTextStyles.bodySmall.copyWith(
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);
    
    if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }
}

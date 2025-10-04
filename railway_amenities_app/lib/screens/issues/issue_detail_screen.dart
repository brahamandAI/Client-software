import 'package:flutter/material.dart';
import '../../models/issue.dart';
import '../../utils/constants.dart';
import '../../widgets/custom_button.dart';

class IssueDetailScreen extends StatefulWidget {
  final Issue issue;

  const IssueDetailScreen({
    Key? key,
    required this.issue,
  }) : super(key: key);

  @override
  State<IssueDetailScreen> createState() => _IssueDetailScreenState();
}

class _IssueDetailScreenState extends State<IssueDetailScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Issue Details'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () {
              // TODO: Implement share functionality
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppDimensions.paddingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Issue Header
            Card(
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
                            color: _getPriorityColor().withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(
                            Icons.warning,
                            color: _getPriorityColor(),
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.issue.stationName ?? 'Unknown Station',
                                style: AppTextStyles.heading3,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Issue #${widget.issue.id.substring(0, 8)}',
                                style: AppTextStyles.bodyMedium.copyWith(
                                  color: Colors.grey[600],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      widget.issue.description,
                      style: AppTextStyles.bodyLarge,
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        _buildStatusChip('Priority', widget.issue.priority, _getPriorityColor()),
                        const SizedBox(width: 8),
                        _buildStatusChip('Status', widget.issue.status, _getStatusColor()),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 20),
            
            // Issue Information
            Text(
              'Issue Information',
              style: AppTextStyles.heading3,
            ),
            const SizedBox(height: 16),
            
            Card(
              child: Padding(
                padding: const EdgeInsets.all(AppDimensions.paddingMedium),
                child: Column(
                  children: [
                    _buildInfoRow('Reported By', widget.issue.reportedByName ?? 'Unknown'),
                    const Divider(),
                    _buildInfoRow('Reported At', _formatDate(widget.issue.reportedAt)),
                    if (widget.issue.assignedToName != null) ...[
                      const Divider(),
                      _buildInfoRow('Assigned To', widget.issue.assignedToName!),
                    ],
                    if (widget.issue.assignedAt != null) ...[
                      const Divider(),
                      _buildInfoRow('Assigned At', _formatDate(widget.issue.assignedAt!)),
                    ],
                    if (widget.issue.resolvedAt != null) ...[
                      const Divider(),
                      _buildInfoRow('Resolved At', _formatDate(widget.issue.resolvedAt!)),
                    ],
                    if (widget.issue.notes != null && widget.issue.notes!.isNotEmpty) ...[
                      const Divider(),
                      _buildInfoRow('Notes', widget.issue.notes!),
                    ],
                  ],
                ),
              ),
            ),
            
            // Photos Section
            if (widget.issue.photos.isNotEmpty) ...[
              const SizedBox(height: 20),
              Text(
                'Photos (${widget.issue.photos.length})',
                style: AppTextStyles.heading3,
              ),
              const SizedBox(height: 16),
              
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(AppDimensions.paddingMedium),
                  child: GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 8,
                      mainAxisSpacing: 8,
                      childAspectRatio: 1,
                    ),
                    itemCount: widget.issue.photos.length,
                    itemBuilder: (context, index) {
                      return ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(
                          widget.issue.photos[index],
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              color: Colors.grey[300],
                              child: const Icon(
                                Icons.image_not_supported,
                                color: Colors.grey,
                              ),
                            );
                          },
                        ),
                      );
                    },
                  ),
                ),
              ),
            ],
            
            const SizedBox(height: 20),
            
            // Actions
            if (widget.issue.isOpen) ...[
              Text(
                'Actions',
                style: AppTextStyles.heading3,
              ),
              const SizedBox(height: 16),
              
              Column(
                children: [
                  if (widget.issue.isReported) ...[
                    CustomButton(
                      text: 'Acknowledge Issue',
                      icon: Icons.check,
                      onPressed: () {
                        _updateIssueStatus('acknowledged');
                      },
                    ),
                    const SizedBox(height: 12),
                  ],
                  if (widget.issue.isAcknowledged) ...[
                    CustomButton(
                      text: 'Assign to Staff',
                      icon: Icons.person_add,
                      onPressed: () {
                        _assignIssue();
                      },
                    ),
                    const SizedBox(height: 12),
                  ],
                  if (widget.issue.isAssigned) ...[
                    CustomButton(
                      text: 'Mark as Resolved',
                      icon: Icons.check_circle,
                      onPressed: () {
                        _updateIssueStatus('resolved');
                      },
                    ),
                    const SizedBox(height: 12),
                  ],
                  if (widget.issue.isResolved) ...[
                    CustomButton(
                      text: 'Close Issue',
                      icon: Icons.close,
                      onPressed: () {
                        _updateIssueStatus('closed');
                      },
                    ),
                    const SizedBox(height: 12),
                  ],
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildStatusChip(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        '$label: ${value.toUpperCase()}',
        style: AppTextStyles.bodySmall.copyWith(
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: AppTextStyles.bodyMedium.copyWith(
                fontWeight: FontWeight.w600,
                color: Colors.grey[700],
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              value,
              style: AppTextStyles.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }

  Color _getPriorityColor() {
    switch (widget.issue.priority) {
      case 'high':
        return AppColors.error;
      case 'medium':
        return AppColors.warning;
      case 'low':
        return AppColors.success;
      default:
        return AppColors.info;
    }
  }

  Color _getStatusColor() {
    switch (widget.issue.status) {
      case 'reported':
        return AppColors.warning;
      case 'acknowledged':
        return AppColors.info;
      case 'assigned':
        return AppColors.primary;
      case 'resolved':
        return AppColors.success;
      case 'closed':
        return AppColors.secondary;
      default:
        return AppColors.info;
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year} at ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }

  void _updateIssueStatus(String status) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Update Status to ${status.toUpperCase()}?'),
        content: const Text('Are you sure you want to update this issue status?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              // TODO: Implement status update
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Issue status updated to $status'),
                  backgroundColor: AppColors.success,
                ),
              );
            },
            child: const Text('Update'),
          ),
        ],
      ),
    );
  }

  void _assignIssue() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Assign Issue'),
        content: const Text('Select staff member to assign this issue to:'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              // TODO: Implement assignment
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Issue assigned successfully'),
                  backgroundColor: AppColors.success,
                ),
              );
            },
            child: const Text('Assign'),
          ),
        ],
      ),
    );
  }
}
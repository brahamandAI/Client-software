import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../../models/inspection.dart';
import '../../services/api_service.dart';
import '../../utils/constants.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';

class CreateInspectionScreen extends StatefulWidget {
  const CreateInspectionScreen({Key? key}) : super(key: key);

  @override
  State<CreateInspectionScreen> createState() => _CreateInspectionScreenState();
}

class _CreateInspectionScreenState extends State<CreateInspectionScreen> {
  final _formKey = GlobalKey<FormState>();
  final _notesController = TextEditingController();
  final _apiService = ApiService();
  final _imagePicker = ImagePicker();
  
  String? _selectedStationId;
  String _selectedStatus = 'completed';
  List<File> _selectedImages = [];
  bool _isLoading = false;

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.camera,
        imageQuality: 80,
      );
      
      if (image != null) {
        setState(() {
          _selectedImages.add(File(image.path));
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error picking image: $e'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  Future<void> _pickImageFromGallery() async {
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 80,
      );
      
      if (image != null) {
        setState(() {
          _selectedImages.add(File(image.path));
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error picking image: $e'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  void _removeImage(int index) {
    setState(() {
      _selectedImages.removeAt(index);
    });
  }

  Future<void> _submitInspection() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedStationId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select a station'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // Upload images first
      List<String> imageUrls = [];
      for (File image in _selectedImages) {
        final url = await _apiService.uploadImage(image);
        imageUrls.add(url);
      }

      // Create inspection
      final inspection = Inspection(
        id: '',
        stationId: _selectedStationId!,
        inspectedById: '', // Will be set by API
        status: _selectedStatus,
        notes: _notesController.text.trim(),
        photos: imageUrls,
        inspectedAt: DateTime.now(),
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      await _apiService.createInspection(inspection);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Inspection submitted successfully!'),
            backgroundColor: AppColors.success,
          ),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error creating inspection: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Inspection'),
        actions: [
          TextButton(
            onPressed: _isLoading ? null : _submitInspection,
            child: Text(
              'Submit',
              style: AppTextStyles.bodyLarge.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppDimensions.paddingMedium),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Station Selection
              Text(
                'Select Station',
                style: AppTextStyles.heading3,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _selectedStationId,
                decoration: InputDecoration(
                  labelText: 'Station',
                  prefixIcon: const Icon(Icons.train),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppDimensions.borderRadius),
                  ),
                ),
                items: const [
                  DropdownMenuItem(
                    value: 'station1',
                    child: Text('Central Station'),
                  ),
                  DropdownMenuItem(
                    value: 'station2',
                    child: Text('East Junction'),
                  ),
                  DropdownMenuItem(
                    value: 'station3',
                    child: Text('West Terminal'),
                  ),
                ],
                onChanged: (value) {
                  setState(() {
                    _selectedStationId = value;
                  });
                },
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please select a station';
                  }
                  return null;
                },
              ),
              
              const SizedBox(height: 20),

              // Status Selection
              Text(
                'Inspection Status',
                style: AppTextStyles.heading3,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: RadioListTile<String>(
                      title: const Text('Pending'),
                      value: 'pending',
                      groupValue: _selectedStatus,
                      onChanged: (value) {
                        setState(() {
                          _selectedStatus = value!;
                        });
                      },
                    ),
                  ),
                  Expanded(
                    child: RadioListTile<String>(
                      title: const Text('Completed'),
                      value: 'completed',
                      groupValue: _selectedStatus,
                      onChanged: (value) {
                        setState(() {
                          _selectedStatus = value!;
                        });
                      },
                    ),
                  ),
                  Expanded(
                    child: RadioListTile<String>(
                      title: const Text('Failed'),
                      value: 'failed',
                      groupValue: _selectedStatus,
                      onChanged: (value) {
                        setState(() {
                          _selectedStatus = value!;
                        });
                      },
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 20),

              // Notes
              Text(
                'Inspection Notes',
                style: AppTextStyles.heading3,
              ),
              const SizedBox(height: 12),
              CustomTextField(
                controller: _notesController,
                labelText: 'Describe your inspection findings',
                maxLines: 4,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please provide inspection notes';
                  }
                  if (value.trim().length < 10) {
                    return 'Notes must be at least 10 characters';
                  }
                  return null;
                },
              ),
              
              const SizedBox(height: 20),

              // Photos
              Text(
                'Photos (Optional)',
                style: AppTextStyles.heading3,
              ),
              const SizedBox(height: 12),
              
              // Photo buttons
              Row(
                children: [
                  Expanded(
                    child: CustomButton(
                      text: 'Take Photo',
                      icon: Icons.camera_alt,
                      onPressed: _pickImage,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: CustomButton(
                      text: 'From Gallery',
                      icon: Icons.photo_library,
                      onPressed: _pickImageFromGallery,
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 16),
              
              // Selected images
              if (_selectedImages.isNotEmpty) ...[
                Text(
                  'Selected Photos (${_selectedImages.length})',
                  style: AppTextStyles.bodyLarge.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  height: 100,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: _selectedImages.length,
                    itemBuilder: (context, index) {
                      return Container(
                        margin: const EdgeInsets.only(right: 8),
                        child: Stack(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: Image.file(
                                _selectedImages[index],
                                width: 100,
                                height: 100,
                                fit: BoxFit.cover,
                              ),
                            ),
                            Positioned(
                              top: 4,
                              right: 4,
                              child: GestureDetector(
                                onTap: () => _removeImage(index),
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: const BoxDecoration(
                                    color: Colors.red,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(
                                    Icons.close,
                                    color: Colors.white,
                                    size: 16,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 20),
              ],

              // Submit Button
              CustomButton(
                text: 'Submit Inspection',
                icon: Icons.checklist,
                onPressed: _isLoading ? null : _submitInspection,
                isLoading: _isLoading,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
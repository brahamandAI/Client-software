import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../models/station.dart';
import '../../utils/constants.dart';
import '../../widgets/custom_button.dart';

class AddStationScreen extends StatefulWidget {
  const AddStationScreen({Key? key}) : super(key: key);

  @override
  State<AddStationScreen> createState() => _AddStationScreenState();
}

class _AddStationScreenState extends State<AddStationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _codeController = TextEditingController();
  final _regionController = TextEditingController();
  final _addressController = TextEditingController();
  final _latController = TextEditingController();
  final _lngController = TextEditingController();
  
  bool _isLoading = false;

  @override
  void dispose() {
    _nameController.dispose();
    _codeController.dispose();
    _regionController.dispose();
    _addressController.dispose();
    _latController.dispose();
    _lngController.dispose();
    super.dispose();
  }

  Future<void> _createStation() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final station = Station(
        id: '',
        name: _nameController.text.trim(),
        code: _codeController.text.trim().toUpperCase(),
        region: _regionController.text.trim(),
        address: _addressController.text.trim(),
        geoLat: double.parse(_latController.text.trim()),
        geoLng: double.parse(_lngController.text.trim()),
      );

      final apiService = ApiService();
      await apiService.createStation(station);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Station created successfully!'),
            backgroundColor: AppColors.success,
          ),
        );
        Navigator.of(context).pop(true); // Return true to indicate success
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to create station: ${e.toString()}'),
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
        title: const Text('Add New Station'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppDimensions.paddingMedium),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Station Name
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Station Name *',
                  hintText: 'e.g., Mumbai Central',
                  prefixIcon: Icon(Icons.train),
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter station name';
                  }
                  if (value.trim().length < 2) {
                    return 'Name must be at least 2 characters';
                  }
                  return null;
                },
              ),
              const SizedBox(height: AppDimensions.paddingMedium),

              // Station Code
              TextFormField(
                controller: _codeController,
                decoration: const InputDecoration(
                  labelText: 'Station Code *',
                  hintText: 'e.g., MMCT',
                  prefixIcon: Icon(Icons.tag),
                  border: OutlineInputBorder(),
                ),
                textCapitalization: TextCapitalization.characters,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter station code';
                  }
                  if (value.trim().length < 2) {
                    return 'Code must be at least 2 characters';
                  }
                  return null;
                },
              ),
              const SizedBox(height: AppDimensions.paddingMedium),

              // Region
              TextFormField(
                controller: _regionController,
                decoration: const InputDecoration(
                  labelText: 'Region *',
                  hintText: 'e.g., Western Railway',
                  prefixIcon: Icon(Icons.location_city),
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter region';
                  }
                  if (value.trim().length < 2) {
                    return 'Region must be at least 2 characters';
                  }
                  return null;
                },
              ),
              const SizedBox(height: AppDimensions.paddingMedium),

              // Address
              TextFormField(
                controller: _addressController,
                decoration: const InputDecoration(
                  labelText: 'Address *',
                  hintText: 'Full station address',
                  prefixIcon: Icon(Icons.location_on),
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter address';
                  }
                  if (value.trim().length < 5) {
                    return 'Address must be at least 5 characters';
                  }
                  return null;
                },
              ),
              const SizedBox(height: AppDimensions.paddingMedium),

              // Latitude
              TextFormField(
                controller: _latController,
                decoration: const InputDecoration(
                  labelText: 'Latitude *',
                  hintText: 'e.g., 19.0760',
                  prefixIcon: Icon(Icons.map),
                  border: OutlineInputBorder(),
                ),
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter latitude';
                  }
                  final lat = double.tryParse(value.trim());
                  if (lat == null) {
                    return 'Please enter a valid number';
                  }
                  if (lat < -90 || lat > 90) {
                    return 'Latitude must be between -90 and 90';
                  }
                  return null;
                },
              ),
              const SizedBox(height: AppDimensions.paddingMedium),

              // Longitude
              TextFormField(
                controller: _lngController,
                decoration: const InputDecoration(
                  labelText: 'Longitude *',
                  hintText: 'e.g., 72.8777',
                  prefixIcon: Icon(Icons.map),
                  border: OutlineInputBorder(),
                ),
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter longitude';
                  }
                  final lng = double.tryParse(value.trim());
                  if (lng == null) {
                    return 'Please enter a valid number';
                  }
                  if (lng < -180 || lng > 180) {
                    return 'Longitude must be between -180 and 180';
                  }
                  return null;
                },
              ),
              const SizedBox(height: AppDimensions.paddingLarge),

              // Submit Button
              _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : CustomButton(
                      text: 'Create Station',
                      icon: Icons.add,
                      onPressed: _createStation,
                    ),
              
              const SizedBox(height: AppDimensions.paddingMedium),
              
              // Help Text
              Card(
                color: Colors.blue[50],
                child: Padding(
                  padding: const EdgeInsets.all(AppDimensions.paddingMedium),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: const [
                          Icon(Icons.info_outline, color: AppColors.info, size: 20),
                          SizedBox(width: 8),
                          Text(
                            'Tips for adding stations:',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: AppColors.info,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        '• Station code should be unique and uppercase\n'
                        '• Use Google Maps to find accurate coordinates\n'
                        '• Latitude: North (+) or South (-)\n'
                        '• Longitude: East (+) or West (-)',
                        style: TextStyle(fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

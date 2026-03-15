import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../features/items/services/item_upload_service.dart';

class EditItemPage extends StatefulWidget {
  final String itemId;

  const EditItemPage({super.key, required this.itemId});

  @override
  State<EditItemPage> createState() => _EditItemPageState();
}

class _EditItemPageState extends State<EditItemPage> {
  final ItemUploadService _itemService = const ItemUploadService();
  final ImagePicker _imagePicker = ImagePicker();

  final List<String> _categories = const [
    'Jacket',
    'Shirt',
    'Sweater',
    'Dress',
    'Pants',
    'Skirt',
    'Shoes',
    'Accessories',
  ];
  final List<String> _sizes = const ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  final List<String> _conditions = const [
    'Like New',
    'Excellent Condition',
    'Good Condition',
    'Fair Condition',
  ];

  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _priceController = TextEditingController();

  bool _isLoading = true;
  bool _isSaving = false;
  bool _isFree = true;
  String? _selectedCategory;
  String? _selectedSize;
  String? _selectedCondition;
  List<String> _existingPhotos = [];
  List<XFile> _newPhotos = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final item = await _itemService.getMyItemDetail(widget.itemId);
      if (!mounted) return;
      setState(() {
        _titleController.text = item.title;
        _descriptionController.text = item.description ?? '';
        _priceController.text = item.price?.toStringAsFixed(0) ?? '';
        _isFree = item.isFree;
        _selectedCategory = _frontendCategory(item.category);
        _selectedSize = item.size;
        _selectedCondition = _frontendCondition(item.condition);
        _existingPhotos = item.photoUrls;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load item: $e')),
      );
    }
  }

  String _frontendCategory(String value) {
    switch (value.toLowerCase()) {
      case 'jacket':
        return 'Jacket';
      case 'shirt':
        return 'Shirt';
      case 'sweater':
        return 'Sweater';
      case 'dress':
        return 'Dress';
      case 'pants':
        return 'Pants';
      case 'skirt':
        return 'Skirt';
      case 'shoes':
        return 'Shoes';
      default:
        return 'Accessories';
    }
  }

  String _frontendCondition(String value) {
    switch (value.toLowerCase()) {
      case 'like_new':
        return 'Like New';
      case 'excellent':
        return 'Excellent Condition';
      case 'fair':
        return 'Fair Condition';
      default:
        return 'Good Condition';
    }
  }

  Future<void> _pickPhotos() async {
    final picked = await _imagePicker.pickMultiImage(imageQuality: 90, limit: 5);
    if (picked.isEmpty) return;
    if (!mounted) return;
    setState(() {
      _newPhotos = picked.take(5).toList();
    });
  }

  Future<void> _save() async {
    if (_selectedCategory == null || _selectedSize == null || _selectedCondition == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please complete all required fields')),
      );
      return;
    }

    setState(() => _isSaving = true);
    try {
      await _itemService.updateItem(
        itemId: widget.itemId,
        title: _titleController.text.trim(),
        description: _descriptionController.text.trim(),
        category: _selectedCategory,
        size: _selectedSize,
        condition: _selectedCondition,
        isFree: _isFree,
        price: _priceController.text,
        photos: _newPhotos.isEmpty ? null : _newPhotos,
      );
      if (!mounted) return;
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      setState(() => _isSaving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Save failed: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Edit Item')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Photos', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 96,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _newPhotos.isNotEmpty ? _newPhotos.length : _existingPhotos.length,
                      separatorBuilder: (context, index) => const SizedBox(width: 8),
                      itemBuilder: (context, index) {
                        final hasNew = _newPhotos.isNotEmpty;
                        return ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: SizedBox(
                            width: 96,
                            height: 96,
                            child: hasNew
                                ? Image.file(File(_newPhotos[index].path), fit: BoxFit.cover)
                                : Image.network(_existingPhotos[index], fit: BoxFit.cover),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 8),
                  OutlinedButton.icon(
                    onPressed: _pickPhotos,
                    icon: const Icon(Icons.photo_library_outlined),
                    label: const Text('Replace Photos'),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _titleController,
                    decoration: const InputDecoration(labelText: 'Title'),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: _selectedCategory,
                    items: _categories
                        .map((value) => DropdownMenuItem(value: value, child: Text(value)))
                        .toList(),
                    onChanged: (value) => setState(() => _selectedCategory = value),
                    decoration: const InputDecoration(labelText: 'Category'),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          initialValue: _selectedSize,
                          items: _sizes
                              .map((value) => DropdownMenuItem(value: value, child: Text(value)))
                              .toList(),
                          onChanged: (value) => setState(() => _selectedSize = value),
                          decoration: const InputDecoration(labelText: 'Size'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          initialValue: _selectedCondition,
                          items: _conditions
                              .map((value) => DropdownMenuItem(value: value, child: Text(value)))
                              .toList(),
                          onChanged: (value) => setState(() => _selectedCondition = value),
                          decoration: const InputDecoration(labelText: 'Condition'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  SwitchListTile(
                    value: _isFree,
                    title: const Text('Free item'),
                    onChanged: (value) => setState(() => _isFree = value),
                  ),
                  if (!_isFree)
                    TextField(
                      controller: _priceController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Price'),
                    ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _descriptionController,
                    maxLines: 5,
                    decoration: const InputDecoration(labelText: 'Description'),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isSaving ? null : _save,
                      child: Text(_isSaving ? 'Saving...' : 'Save Changes'),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}

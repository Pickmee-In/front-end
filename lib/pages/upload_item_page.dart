import 'dart:io';

import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';

import '../features/items/services/item_upload_service.dart';

class UploadItemPage extends StatefulWidget {
  const UploadItemPage({super.key});

  @override
  State<UploadItemPage> createState() => _UploadItemPageState();
}

class _UploadItemPageState extends State<UploadItemPage> {
  final List<String> categories = [
    'Jacket',
    'Shirt',
    'Sweater',
    'Dress',
    'Pants',
    'Skirt',
    'Shoes',
    'Accessories',
  ];

  final List<String> sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  final List<String> conditions = [
    'Like New',
    'Excellent Condition',
    'Good Condition',
    'Fair Condition'
  ];

  String? selectedCategory;
  String? selectedSize;
  String? selectedCondition;
  final titleController = TextEditingController();
  final descriptionController = TextEditingController();
  final priceController = TextEditingController();
  final ItemUploadService _itemUploadService = const ItemUploadService();
  final ImagePicker _imagePicker = ImagePicker();
  bool isLoading = false;
  bool isAiAnalyzing = false;
  bool isFree = true;
  List<XFile> uploadedPhotos = [];
  String? aiDetectedCategory;
  String? aiDetectedCondition;
  String? aiError;
  double? _currentLat;
  double? _currentLng;

  @override
  void initState() {
    super.initState();
    _captureLocation();
  }

  Future<void> _captureLocation() async {
    try {
      final enabled = await Geolocator.isLocationServiceEnabled();
      if (!enabled) return;
      LocationPermission perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) {
        perm = await Geolocator.requestPermission();
        if (perm == LocationPermission.denied) return;
      }
      if (perm == LocationPermission.deniedForever) return;
      final pos = await Geolocator.getCurrentPosition(
        locationSettings:
            const LocationSettings(accuracy: LocationAccuracy.medium),
      );
      if (!mounted) return;
      setState(() {
        _currentLat = pos.latitude;
        _currentLng = pos.longitude;
      });
    } catch (_) {}
  }

  @override
  void dispose() {
    titleController.dispose();
    descriptionController.dispose();
    priceController.dispose();
    super.dispose();
  }

  Future<void> _pickFromGallery() async {
    final picked = await _imagePicker.pickMultiImage(
      imageQuality: 90,
      limit: 5,
    );
    if (picked.isEmpty) return;

    final availableSlots = 5 - uploadedPhotos.length;
    if (availableSlots <= 0) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Maximum 5 photos allowed')),
        );
      }
      return;
    }

    setState(() {
      uploadedPhotos = [...uploadedPhotos, ...picked.take(availableSlots)];
    });

    await _analyzeFirstPhoto();
  }

  Future<void> _pickFromCamera() async {
    final picked = await _imagePicker.pickImage(
      source: ImageSource.camera,
      imageQuality: 90,
    );
    if (picked == null) return;

    if (uploadedPhotos.length >= 5) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Maximum 5 photos allowed')),
        );
      }
      return;
    }

    setState(() {
      uploadedPhotos = [...uploadedPhotos, picked];
    });

    await _analyzeFirstPhoto();
  }

  Future<void> _analyzeFirstPhoto() async {
    if (uploadedPhotos.isEmpty) return;

    setState(() {
      isAiAnalyzing = true;
      aiError = null;
    });

    try {
      final result = await _itemUploadService.analyzePhoto(uploadedPhotos.first);
      if (!mounted) return;

      setState(() {
        isAiAnalyzing = false;
        if (result.success) {
          aiDetectedCategory = result.category;
          aiDetectedCondition = result.condition;

          final detectedCategory = _frontendCategoryFromBackend(result.category);
          if (detectedCategory != null && selectedCategory == null) {
            selectedCategory = detectedCategory;
          }

          final detectedCondition = _frontendConditionFromBackend(result.condition);
          if (detectedCondition != null && selectedCondition == null) {
            selectedCondition = detectedCondition;
          }
        } else {
          aiError = result.errorMessage ??
              'AI detection failed. Please input category/condition manually.';
        }
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        isAiAnalyzing = false;
        aiError =
            'AI detection failed. Please input category/condition manually.';
      });
    }
  }

  String? _frontendCategoryFromBackend(String? value) {
    if (value == null) return null;
    final map = {
      'jacket': 'Jacket',
      'shirt': 'Shirt',
      'sweater': 'Sweater',
      'dress': 'Dress',
      'pants': 'Pants',
      'skirt': 'Skirt',
      'shoes': 'Shoes',
      'accessories': 'Accessories',
      'other': 'Accessories',
    };
    return map[value.toLowerCase()];
  }

  String? _frontendConditionFromBackend(String? value) {
    if (value == null) return null;
    final map = {
      'like_new': 'Like New',
      'excellent': 'Excellent Condition',
      'good': 'Good Condition',
      'fair': 'Fair Condition',
    };
    return map[value.toLowerCase()];
  }

  Future<void> _uploadItem() async {
    if (uploadedPhotos.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please upload at least 1 photo')),
      );
      return;
    }

    if (selectedCategory == null || selectedSize == null || selectedCondition == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all fields')),
      );
      return;
    }

    if (titleController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a title')),
      );
      return;
    }

    if (!isFree && priceController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a price')),
      );
      return;
    }

    setState(() => isLoading = true);

    try {
      await _itemUploadService.createItem(
        photos: uploadedPhotos,
        title: titleController.text,
        category: selectedCategory!,
        size: selectedSize!,
        condition: selectedCondition!,
        isFree: isFree,
        price: priceController.text,
        description: descriptionController.text,
        latitude: _currentLat,
        longitude: _currentLng,
      );

      if (!mounted) return;
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Item listed successfully!'),
          backgroundColor: Color(0xff8CE4FF),
        ),
      );
      Navigator.pop(context, true);
    } catch (error) {
      if (!mounted) return;
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Upload failed: $error')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black87),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'List New Item',
          style: TextStyle(
            color: Colors.black87,
            fontSize: 18,
            fontWeight: FontWeight.w700,
            fontFamily: 'Plus Jakarta Sans',
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Title',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: titleController,
                    textInputAction: TextInputAction.next,
                    decoration: InputDecoration(
                      hintText: 'e.g. Oversized denim jacket',
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide(color: Colors.grey.shade300),
                      ),
                      focusedBorder: const OutlineInputBorder(
                        borderRadius: BorderRadius.all(Radius.circular(16)),
                        borderSide: BorderSide(color: Color(0xff8CE4FF), width: 2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 18),

                  // Photos Section
                  Center(
                    child: Text(
                      'Photos',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Upload Photo Card
                  Center(
                    child: GestureDetector(
                      onTap: _pickFromGallery,
                      child: Container(
                        width: 260,
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: const Color(0xff8CE4FF).withValues(alpha: 0.3),
                            width: 2,
                          ),
                          borderRadius: BorderRadius.circular(16),
                          color: const Color(0xff8CE4FF).withValues(alpha: 0.05),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
                        child: Column(
                          children: [
                            Icon(
                              Icons.cloud_upload_outlined,
                              size: 48,
                              color: const Color(0xff8CE4FF),
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              'Upload Photo',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: Colors.black87,
                                fontFamily: 'Plus Jakarta Sans',
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Add up to 5 photos of your item',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey.shade600,
                                fontFamily: 'Plus Jakarta Sans',
                              ),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xff8CE4FF),
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 28,
                                  vertical: 10,
                                ),
                                elevation: 0,
                              ),
                              onPressed: () {
                                _pickFromGallery();
                              },
                              child: const Text(
                                'Add Photo',
                                style: TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 13,
                                  fontFamily: 'Plus Jakarta Sans',
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),

                  if (uploadedPhotos.isNotEmpty)
                    SizedBox(
                      height: 90,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: uploadedPhotos.length,
                        separatorBuilder: (context, index) => const SizedBox(width: 10),
                        itemBuilder: (context, index) {
                          final photo = uploadedPhotos[index];
                          return Stack(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                child: Image.file(
                                  File(photo.path),
                                  width: 90,
                                  height: 90,
                                  fit: BoxFit.cover,
                                ),
                              ),
                              Positioned(
                                right: 4,
                                top: 4,
                                child: GestureDetector(
                                  onTap: () {
                                    setState(() {
                                      uploadedPhotos.removeAt(index);
                                    });
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.all(3),
                                    decoration: const BoxDecoration(
                                      color: Colors.black54,
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.close,
                                      size: 12,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          );
                        },
                      ),
                    ),

                  const SizedBox(height: 12),

                  // Photo sources
                  Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Column(
                          children: [
                            GestureDetector(
                              onTap: _pickFromCamera,
                              child: Container(
                                width: 52,
                                height: 52,
                                decoration: BoxDecoration(
                                  color: const Color(0xff8CE4FF).withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Icon(
                                  Icons.camera_alt_outlined,
                                  color: Color(0xff8CE4FF),
                                  size: 24,
                                ),
                              ),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'Camera',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: Colors.black87,
                                fontFamily: 'Plus Jakarta Sans',
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(width: 48),
                        Column(
                          children: [
                            GestureDetector(
                              onTap: _pickFromGallery,
                              child: Container(
                                width: 52,
                                height: 52,
                                decoration: BoxDecoration(
                                  color: const Color(0xff8CE4FF).withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Icon(
                                  Icons.image_outlined,
                                  color: Color(0xff8CE4FF),
                                  size: 24,
                                ),
                              ),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'Gallery',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: Colors.black87,
                                fontFamily: 'Plus Jakarta Sans',
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 28),

                  // AI Detection
                  Center(
                    child: Container(
                      width: 320,
                      decoration: BoxDecoration(
                        color: const Color(0xff8CE4FF).withValues(alpha: 0.08),
                        border: Border.all(
                          color: const Color(0xff8CE4FF).withValues(alpha: 0.2),
                        ),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: const Color(0xff8CE4FF),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(
                              Icons.auto_awesome,
                              color: Colors.white,
                              size: 22,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'AI IDENTIFICATION',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    color: const Color(0xff8CE4FF),
                                    letterSpacing: 0.4,
                                    fontFamily: 'Plus Jakarta Sans',
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  isAiAnalyzing
                                      ? 'Analyzing photo with Gemini...'
                                      : aiError != null
                                          ? 'AI error: $aiError'
                                          : aiDetectedCategory != null
                                              ? 'Category detected: ${_frontendCategoryFromBackend(aiDetectedCategory) ?? aiDetectedCategory}'
                                              : 'Upload photo for AI detection',
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.black87,
                                    fontFamily: 'Plus Jakarta Sans',
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Icon(
                            aiError != null
                                ? Icons.error_outline
                                : aiDetectedCategory != null
                                    ? Icons.check_circle
                                    : Icons.info_outline,
                            color: aiError != null
                                ? Colors.orange
                                : const Color(0xff8CE4FF),
                            size: 24,
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 28),

                  // Category
                  Text(
                    'Category',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: Colors.grey.shade300,
                        width: 1,
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: DropdownButtonFormField<String>(
                      initialValue: selectedCategory,
                      hint: const Text('Select category'),
                      items: categories.map((cat) {
                        return DropdownMenuItem(value: cat, child: Text(cat));
                      }).toList(),
                      onChanged: (value) => setState(() => selectedCategory = value),
                      decoration: const InputDecoration(
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      ),
                    ),
                  ),

                  const SizedBox(height: 18),

                  // Size and Condition Row
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Size',
                              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                fontWeight: FontWeight.w700,
                                fontSize: 13,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Container(
                              decoration: BoxDecoration(
                                border: Border.all(
                                  color: Colors.grey.shade300,
                                  width: 1,
                                ),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: DropdownButtonFormField<String>(
                                initialValue: selectedSize,
                                hint: const Text('Select size'),
                                items: sizes.map((size) {
                                  return DropdownMenuItem(value: size, child: Text(size));
                                }).toList(),
                                onChanged: (value) => setState(() => selectedSize = value),
                                decoration: const InputDecoration(
                                  border: InputBorder.none,
                                  contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Condition',
                              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                fontWeight: FontWeight.w700,
                                fontSize: 13,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Container(
                              decoration: BoxDecoration(
                                border: Border.all(
                                  color: Colors.grey.shade300,
                                  width: 1,
                                ),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: DropdownButtonFormField<String>(
                                initialValue: selectedCondition,
                                hint: const Text('Select condition'),
                                items: conditions.map((cond) {
                                  return DropdownMenuItem(value: cond, child: Text(cond));
                                }).toList(),
                                onChanged: (value) => setState(() => selectedCondition = value),
                                decoration: const InputDecoration(
                                  border: InputBorder.none,
                                  contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 18),

                  // Price Selection
                  Text(
                    'Harga',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => isFree = true),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                            decoration: BoxDecoration(
                              border: Border.all(
                                color: isFree
                                    ? const Color(0xff8CE4FF)
                                    : Colors.grey.shade300,
                                width: isFree ? 2 : 1,
                              ),
                              borderRadius: BorderRadius.circular(12),
                              color: isFree
                                  ? const Color(0xff8CE4FF).withValues(alpha: 0.08)
                                  : Colors.transparent,
                            ),
                            child: Center(
                              child: Text(
                                'Free',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: isFree
                                      ? const Color(0xff8CE4FF)
                                      : Colors.grey.shade600,
                                  fontFamily: 'Plus Jakarta Sans',
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => isFree = false),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                            decoration: BoxDecoration(
                              border: Border.all(
                                color: !isFree
                                    ? const Color(0xff8CE4FF)
                                    : Colors.grey.shade300,
                                width: !isFree ? 2 : 1,
                              ),
                              borderRadius: BorderRadius.circular(12),
                              color: !isFree
                                  ? const Color(0xff8CE4FF).withValues(alpha: 0.08)
                                  : Colors.transparent,
                            ),
                            child: Center(
                              child: Text(
                                'Bayar',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: !isFree
                                      ? const Color(0xff8CE4FF)
                                      : Colors.grey.shade600,
                                  fontFamily: 'Plus Jakarta Sans',
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),

                  if (!isFree) ...[
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: priceController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      style: const TextStyle(fontSize: 13),
                      decoration: InputDecoration(
                        hintText: 'Masukkan nominal harga...',
                        hintStyle: TextStyle(
                          color: Colors.grey.shade500,
                          fontSize: 13,
                          fontFamily: 'Plus Jakarta Sans',
                        ),
                        prefix: const Padding(
                          padding: EdgeInsets.only(left: 12, right: 4),
                          child: Text(
                            'Rp ',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              fontFamily: 'Plus Jakarta Sans',
                            ),
                          ),
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: Colors.grey.shade300),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: Colors.grey.shade300),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(
                            color: Color(0xff8CE4FF),
                            width: 2,
                          ),
                        ),
                        contentPadding: const EdgeInsets.symmetric(vertical: 14, horizontal: 0),
                      ),
                    ),
                  ]
                  else ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                      decoration: BoxDecoration(
                        color: const Color(0xff8CE4FF).withValues(alpha: 0.08),
                        border: Border.all(
                          color: const Color(0xff8CE4FF).withValues(alpha: 0.2),
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Center(
                        child: Text(
                          'Item akan ditampilkan sebagai free untuk di-tukar',
                          style: TextStyle(
                            fontSize: 12,
                            color: Color(0xff8CE4FF),
                            fontWeight: FontWeight.w600,
                            fontFamily: 'Plus Jakarta Sans',
                          ),
                        ),
                      ),
                    ),
                  ],

                  const SizedBox(height: 18),

                  // Description
                  Text(
                    'Description',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: descriptionController,
                    maxLines: 4,
                    style: const TextStyle(fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Describe the material, fit, and any flaws...',
                      hintStyle: TextStyle(
                        color: Colors.grey.shade500,
                        fontSize: 13,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.grey.shade300),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.grey.shade300),
                      ),
                      contentPadding: const EdgeInsets.all(16),
                    ),
                  ),

                  const SizedBox(height: 28),

                  // List Item Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xff8CE4FF),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                        elevation: 2,
                      ),
                      onPressed: isLoading ? null : _uploadItem,
                      child: isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2.5,
                                valueColor: AlwaysStoppedAnimation(Colors.white),
                              ),
                            )
                          : const Text(
                              '✓ List Item',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                fontFamily: 'Plus Jakarta Sans',
                              ),
                            ),
                    ),
                  ),

                  const SizedBox(height: 12),
                  Center(
                    child: Text(
                      'By listing your item, you agree to PickMe\'s\nsustainable selling guidelines',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.grey.shade600,
                        fontFamily: 'Plus Jakarta Sans',
                        height: 1.4,
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

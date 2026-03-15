import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';

import '../../../core/config/app_config.dart';
import '../../auth/services/auth_storage.dart';

class AiAnalyzeResult {
  final bool success;
  final String? category;
  final String? condition;
  final double? confidence;
  final String? errorCode;
  final String? errorMessage;
  final bool manualInputRequired;

  const AiAnalyzeResult({
    required this.success,
    this.category,
    this.condition,
    this.confidence,
    this.errorCode,
    this.errorMessage,
    required this.manualInputRequired,
  });

  factory AiAnalyzeResult.fromJson(Map<String, dynamic> json) {
    final ai = (json['aiAnalysis'] as Map<String, dynamic>?) ?? const {};
    return AiAnalyzeResult(
      success: json['success'] as bool? ?? false,
      category: ai['category'] as String?,
      condition: ai['condition'] as String?,
      confidence:
          ai['confidence'] != null ? (ai['confidence'] as num).toDouble() : null,
      errorCode: ai['errorCode'] as String?,
      errorMessage: ai['errorMessage'] as String?,
      manualInputRequired: json['manualInputRequired'] as bool? ?? true,
    );
  }
}

class ItemUploadService {
  const ItemUploadService();

  String _absoluteImageUrl(String? url) {
    if (url == null || url.isEmpty) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return '${AppConfig.apiBaseUrl}$url';
  }

  Future<Map<String, String>> _headers() async {
    final token = await AuthStorage.getAccessToken();
    return {
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  Future<AiAnalyzeResult> analyzePhoto(XFile photo) async {
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('${AppConfig.apiBaseUrl}/api/items/analyze'),
    );

    request.headers.addAll(await _headers());
    request.files.add(await http.MultipartFile.fromPath('photo', photo.path));

    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        'Analyze failed (${response.statusCode}): ${response.body}',
      );
    }

    final json = jsonDecode(response.body) as Map<String, dynamic>;
    return AiAnalyzeResult.fromJson(json);
  }

  Future<void> createItem({
    required List<XFile> photos,
    required String title,
    required String category,
    required String size,
    required String condition,
    required bool isFree,
    String? price,
    String? description,
    double? latitude,
    double? longitude,
    String? locationLabel,
  }) async {
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('${AppConfig.apiBaseUrl}/api/items'),
    );

    request.headers.addAll(await _headers());

    request.fields['title'] = title.trim().isEmpty ? '$category Item' : title.trim();
    request.fields['category'] = _mapCategory(category);
    request.fields['size'] = size;
    request.fields['condition'] = _mapCondition(condition);
    request.fields['listingType'] = isFree ? 'swap' : 'thrift';
    request.fields['isFree'] = '$isFree';
    if (!isFree && (price?.trim().isNotEmpty ?? false)) {
      request.fields['price'] = price!.trim();
    }
    if (description?.trim().isNotEmpty ?? false) {
      request.fields['description'] = description!.trim();
    }
    if (latitude != null) request.fields['latitude'] = '$latitude';
    if (longitude != null) request.fields['longitude'] = '$longitude';
    if (locationLabel != null && locationLabel.trim().isNotEmpty) {
      request.fields['locationLabel'] = locationLabel.trim();
    }

    for (final photo in photos) {
      request.files.add(await http.MultipartFile.fromPath('photos', photo.path));
    }

    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        'Create item failed (${response.statusCode}): ${response.body}',
      );
    }
  }

  Future<List<MyItem>> listMyItems() async {
    final uri = Uri.parse('${AppConfig.apiBaseUrl}/api/items/mine');
    final response = await http.get(uri, headers: await _headers());

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        'List my items failed (${response.statusCode}): ${response.body}',
      );
    }

    final json = jsonDecode(response.body) as Map<String, dynamic>;
    final rows = json['items'] as List<dynamic>? ?? [];

    return rows.map((e) {
      final m = e as Map<String, dynamic>;
      return MyItem(
        id: m['id'] as String,
        title: m['title'] as String? ?? 'Untitled Item',
        size: m['size'] as String? ?? '-',
        imageUrl: _absoluteImageUrl(m['imageUrl'] as String?),
        category: m['category'] as String?,
        condition: m['condition'] as String?,
        isFree: m['isFree'] as bool? ?? true,
        price: m['price'] != null ? (m['price'] as num).toDouble() : null,
      );
    }).toList();
  }

  Future<void> deleteItem(String itemId) async {
    final uri = Uri.parse('${AppConfig.apiBaseUrl}/api/items/$itemId');
    final response = await http.delete(uri, headers: await _headers());

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        'Delete item failed (${response.statusCode}): ${response.body}',
      );
    }
  }

  Future<void> updateItem({
    required String itemId,
    String? title,
    String? description,
    String? category,
    String? size,
    String? condition,
    bool? isFree,
    String? price,
    List<XFile>? photos,
  }) async {
    final request = http.MultipartRequest(
      'PATCH',
      Uri.parse('${AppConfig.apiBaseUrl}/api/items/$itemId'),
    );

    request.headers.addAll(await _headers());
    if (title != null) request.fields['title'] = title;
    if (description != null) request.fields['description'] = description;
    if (category != null) request.fields['category'] = _mapCategory(category);
    if (size != null) request.fields['size'] = size;
    if (condition != null) request.fields['condition'] = _mapCondition(condition);
    if (isFree != null) request.fields['isFree'] = '$isFree';
    if (isFree == false && (price?.trim().isNotEmpty ?? false)) {
      request.fields['price'] = price!.trim();
    }
    if (photos != null) {
      for (final photo in photos) {
        request.files.add(await http.MultipartFile.fromPath('photos', photo.path));
      }
    }

    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        'Update item failed (${response.statusCode}): ${response.body}',
      );
    }
  }

  Future<MyItemDetail> getMyItemDetail(String itemId) async {
    final uri = Uri.parse('${AppConfig.apiBaseUrl}/api/items/mine/$itemId');
    final response = await http.get(uri, headers: await _headers());

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        'Get item detail failed (${response.statusCode}): ${response.body}',
      );
    }

    final json = jsonDecode(response.body) as Map<String, dynamic>;
    final item = json['item'] as Map<String, dynamic>;
    return MyItemDetail.fromJson(item, _absoluteImageUrl);
  }

  String _mapCategory(String value) {
    return value.trim().toLowerCase();
  }

  String _mapCondition(String value) {
    switch (value.trim().toLowerCase()) {
      case 'like new':
        return 'like_new';
      case 'excellent condition':
        return 'excellent';
      case 'good condition':
        return 'good';
      case 'fair condition':
        return 'fair';
      default:
        return 'good';
    }
  }
}

class MyItem {
  final String id;
  final String title;
  final String size;
  final String imageUrl;
  final String? category;
  final String? condition;
  final bool isFree;
  final double? price;

  const MyItem({
    required this.id,
    required this.title,
    required this.size,
    required this.imageUrl,
    this.category,
    this.condition,
    required this.isFree,
    this.price,
  });
}

class MyItemDetail {
  final String id;
  final String title;
  final String? description;
  final String category;
  final String size;
  final String condition;
  final String listingType;
  final bool isFree;
  final double? price;
  final String? locationLabel;
  final List<String> photoUrls;

  const MyItemDetail({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.size,
    required this.condition,
    required this.listingType,
    required this.isFree,
    required this.price,
    required this.locationLabel,
    required this.photoUrls,
  });

  factory MyItemDetail.fromJson(
    Map<String, dynamic> json,
    String Function(String? url) absolute,
  ) {
    final photos = (json['photos'] as List<dynamic>? ?? [])
        .map((e) => absolute((e as Map<String, dynamic>)['url'] as String?))
        .where((e) => e.isNotEmpty)
        .toList();

    return MyItemDetail(
      id: json['id'] as String,
      title: json['title'] as String? ?? 'Untitled Item',
      description: json['description'] as String?,
      category: json['category'] as String? ?? 'other',
      size: json['size'] as String? ?? '-',
      condition: json['condition'] as String? ?? 'good',
      listingType: json['listingType'] as String? ?? 'swap',
      isFree: json['isFree'] as bool? ?? true,
      price: json['price'] != null ? (json['price'] as num).toDouble() : null,
      locationLabel: json['locationLabel'] as String?,
      photoUrls: photos,
    );
  }
}

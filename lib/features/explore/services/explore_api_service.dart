import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../../core/config/app_config.dart';
import '../../auth/services/auth_storage.dart';
import '../models/explore_item.dart';

class ExploreApiService {
  const ExploreApiService();

  Future<Map<String, String>> _headers() async {
    final token = await AuthStorage.getAccessToken();
    return {
      'Content-Type': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  Future<ExploreItemsResponse> getItems({
    String? category,
    String? priceFilter,
    String? sortBy,
    double? latitude,
    double? longitude,
    double? maxDistanceKm,
    bool includeSwiped = false,
    String? listingType,
    int limit = 25,
    int offset = 0,
  }) async {
    final queryParams = <String, String>{
      'limit': '$limit',
      'offset': '$offset',
      'includeSwiped': '$includeSwiped',
      if (category != null) 'category': category,
      if (priceFilter != null) 'priceFilter': priceFilter,
      if (sortBy != null) 'sortBy': sortBy,
      if (latitude != null) 'latitude': '$latitude',
      if (longitude != null) 'longitude': '$longitude',
      if (maxDistanceKm != null) 'maxDistanceKm': '$maxDistanceKm',
      if (listingType != null) 'listingType': listingType,
    };

    final uri = Uri.parse('${AppConfig.apiBaseUrl}/api/explore/items')
        .replace(queryParameters: queryParams);

    final response = await http.get(uri, headers: await _headers());

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        'Explore items failed (${response.statusCode}): ${response.body}',
      );
    }

    final json = jsonDecode(response.body) as Map<String, dynamic>;
    return ExploreItemsResponse.fromJson(json);
  }

  Future<void> swipe({
    required String itemId,
    required String action, // pick | skip
  }) async {
    final uri = Uri.parse('${AppConfig.apiBaseUrl}/api/explore/swipe');

    final response = await http.post(
      uri,
      headers: await _headers(),
      body: jsonEncode({'itemId': itemId, 'action': action}),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('Swipe failed (${response.statusCode}): ${response.body}');
    }
  }

  Future<List<ExploreItem>> getFavorites() async {
    final uri = Uri.parse('${AppConfig.apiBaseUrl}/api/explore/favorites');

    final response = await http.get(uri, headers: await _headers());

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        'Get favorites failed (${response.statusCode}): ${response.body}',
      );
    }

    final json = jsonDecode(response.body) as Map<String, dynamic>;
    final list = (json['items'] as List<dynamic>? ?? [])
      .map((e) => Map<String, dynamic>.from(e as Map))
      .toList();
    return list.map(ExploreItem.fromJson).toList();
  }

  Future<void> removeFavorite(String itemId) async {
    final uri = Uri.parse('${AppConfig.apiBaseUrl}/api/explore/favorites/$itemId');

    final response = await http.delete(uri, headers: await _headers());

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        'Remove favorite failed (${response.statusCode}): ${response.body}',
      );
    }
  }
}

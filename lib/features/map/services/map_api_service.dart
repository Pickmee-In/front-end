import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../../core/config/app_config.dart';
import '../../auth/services/auth_storage.dart';
import '../models/map_item.dart';

class MapApiService {
  const MapApiService();

  Future<Map<String, String>> _headers() async {
    final token = await AuthStorage.getAccessToken();
    return {
      'Content-Type': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  /// GET /api/map/nearby
  ///
  /// Returns clothing items with lat/lng for map markers.
  /// All parameters are optional.
  Future<List<MapItem>> getNearbyItems({
    double? latitude,
    double? longitude,
    double? maxDistanceKm,
    String? listingType,
    String? q,
    int limit = 200,
  }) async {
    final queryParams = <String, String>{'limit': '$limit'};
    if (latitude != null) queryParams['latitude'] = '$latitude';
    if (longitude != null) queryParams['longitude'] = '$longitude';
    if (maxDistanceKm != null) queryParams['maxDistanceKm'] = '$maxDistanceKm';
    if (listingType != null) queryParams['listingType'] = listingType;
    if (q != null && q.isNotEmpty) queryParams['q'] = q;

    final uri = Uri.parse('${AppConfig.apiBaseUrl}/api/map/nearby')
        .replace(queryParameters: queryParams);

    final response = await http.get(uri, headers: await _headers());

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        'Map nearby failed (${response.statusCode}): ${response.body}',
      );
    }

    final json = jsonDecode(response.body) as Map<String, dynamic>;
    final itemsJson = json['items'] as List<dynamic>? ?? [];
    return itemsJson
        .map((e) => MapItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// GET /api/map/items/:id
  ///
  /// Returns a single item's full details (for the bottom detail card).
  Future<MapItem?> getItemById(String id) async {
    final uri =
        Uri.parse('${AppConfig.apiBaseUrl}/api/map/items/$id');

    final response = await http.get(uri, headers: await _headers());

    if (response.statusCode == 404) return null;

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        'Map item detail failed (${response.statusCode}): ${response.body}',
      );
    }

    final json = jsonDecode(response.body) as Map<String, dynamic>;
    final itemJson = json['item'] as Map<String, dynamic>?;
    if (itemJson == null) return null;
    return MapItem.fromJson(itemJson);
  }
}

class ExploreItem {
  final String id;
  final String name;
  final String category;
  final String condition;
  final String distance;
  final String imageUrl;
  final bool isNewDrop;
  final String listingType;
  final String size;
  final bool isFavorite;
  final double? price;
  final String? locationLabel;

  const ExploreItem({
    required this.id,
    required this.name,
    required this.category,
    required this.condition,
    required this.distance,
    required this.imageUrl,
    required this.isNewDrop,
    required this.listingType,
    required this.size,
    required this.isFavorite,
    required this.price,
    required this.locationLabel,
  });

  factory ExploreItem.fromJson(Map<String, dynamic> json) {
    return ExploreItem(
      id: json['id'] as String,
      name: json['name'] as String,
      category: json['category'] as String,
      condition: json['condition'] as String,
      distance: json['distance'] as String,
      imageUrl: json['imageUrl'] as String,
      isNewDrop: (json['isNewDrop'] as bool?) ?? false,
      listingType: (json['listingType'] as String?) ?? 'swap',
      size: (json['size'] as String?) ?? '-',
      isFavorite: (json['isFavorite'] as bool?) ?? false,
      price: (json['price'] as num?)?.toDouble(),
      locationLabel: json['locationLabel'] as String?,
    );
  }
}

class ExplorePagination {
  final int limit;
  final int offset;
  final int count;

  const ExplorePagination({
    required this.limit,
    required this.offset,
    required this.count,
  });

  factory ExplorePagination.fromJson(Map<String, dynamic> json) {
    return ExplorePagination(
      limit: (json['limit'] as num?)?.toInt() ?? 0,
      offset: (json['offset'] as num?)?.toInt() ?? 0,
      count: (json['count'] as num?)?.toInt() ?? 0,
    );
  }
}

class ExploreItemsResponse {
  final List<ExploreItem> items;
  final ExplorePagination pagination;

  const ExploreItemsResponse({
    required this.items,
    required this.pagination,
  });

  factory ExploreItemsResponse.fromJson(Map<String, dynamic> json) {
    final itemsJson = (json['items'] as List<dynamic>? ?? [])
      .map((e) => Map<String, dynamic>.from(e as Map))
      .toList();

    return ExploreItemsResponse(
      items: itemsJson.map(ExploreItem.fromJson).toList(),
      pagination: ExplorePagination.fromJson(
        (json['pagination'] as Map<String, dynamic>? ?? const {}),
      ),
    );
  }
}

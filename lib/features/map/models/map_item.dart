class MapItem {
  final String id;
  final String title;
  final double latitude;
  final double longitude;
  final String imageUrl;
  final String listingType;
  final bool isFavorite;
  final String distance;
  final double? distanceKm;
  final String? locationLabel;
  final String category;
  final String condition;
  final String size;
  final double? price;
  final bool isNewDrop;

  const MapItem({
    required this.id,
    required this.title,
    required this.latitude,
    required this.longitude,
    required this.imageUrl,
    required this.listingType,
    required this.isFavorite,
    required this.distance,
    this.distanceKm,
    this.locationLabel,
    required this.category,
    required this.condition,
    required this.size,
    this.price,
    required this.isNewDrop,
  });

  MapItem copyWith({bool? isFavorite}) {
    return MapItem(
      id: id,
      title: title,
      latitude: latitude,
      longitude: longitude,
      imageUrl: imageUrl,
      listingType: listingType,
      isFavorite: isFavorite ?? this.isFavorite,
      distance: distance,
      distanceKm: distanceKm,
      locationLabel: locationLabel,
      category: category,
      condition: condition,
      size: size,
      price: price,
      isNewDrop: isNewDrop,
    );
  }

  factory MapItem.fromJson(Map<String, dynamic> json) {
    return MapItem(
      id: json['id'] as String,
      title: json['title'] as String,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      imageUrl: json['imageUrl'] as String? ?? '',
      listingType: json['listingType'] as String? ?? 'thrift',
      isFavorite: json['isFavorite'] as bool? ?? false,
      distance: json['distance'] as String? ?? '',
      distanceKm: json['distanceKm'] != null
          ? (json['distanceKm'] as num).toDouble()
          : null,
      locationLabel: json['locationLabel'] as String?,
      category: json['category'] as String? ?? 'Other',
      condition: json['condition'] as String? ?? '',
      size: json['size'] as String? ?? '',
      price: json['price'] != null ? (json['price'] as num).toDouble() : null,
      isNewDrop: json['isNewDrop'] as bool? ?? false,
    );
  }
}

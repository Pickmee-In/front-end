import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class PickMeExplorePage extends StatefulWidget {
  const PickMeExplorePage({super.key});

  @override
  State<PickMeExplorePage> createState() => _PickMeExplorePageState();
}

class _PickMeExplorePageState extends State<PickMeExplorePage> {
  String activeFilter = "All";
  bool isFavorite = false;
  GoogleMapController? _mapController;

  /// Sample store locations
  final List<StoreMarker> stores = [
    StoreMarker(
      name: "Green Thread Shop",
      latlng: const LatLng(40.7128, -74.0060),
      image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuC-JLK9Sz-7QDox4jch9MXZmorxd3R0G5C8gtszDyUNABsX-mfmpoEkyOm5dnqSKdDNO4yZkHFN0Kex35IQyZgqteXFbTCcsSQhElsbzut_ZJD8lK8usJXQo6goLRnZUxdl2D5Z8iHegd2T2T2MBU9695mVL_N3a7hP1gHNBAHum1qOGylmhxBewuHx1KDvtQc9DljDwhXufLLPqoDqZ6-xbkLMBsf8n8_toLot0KmT_5uvo-whFg96mKR5pjx78BjgvmfOaNNNM4Gy",
      rating: 4.8,
      reviews: 124,
      distance: 0.5,
    ),
    StoreMarker(
      name: "Eco Boutique",
      latlng: const LatLng(40.7580, -73.9855),
      image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuC-JLK9Sz-7QDox4jch9MXZmorxd3R0G5C8gtszDyUNABsX-mfmpoEkyOm5dnqSKdDNO4yZkHFN0Kex35IQyZgqteXFbTCcsSQhElsbzut_ZJD8lK8usJXQo6goLRnZUxdl2D5Z8iHegd2T2T2MBU9695mVL_N3a7hP1gHNBAHum1qOGylmhxBewuHx1KDvtQc9DljDwhXufLLPqoDqZ6-xbkLMBsf8n8_toLot0KmT_5uvo-whFg96mKR5pjx78BjgvmfOaNNNM4Gy",
      rating: 4.5,
      reviews: 89,
      distance: 1.2,
    ),
    StoreMarker(
      name: "Sustainable Living",
      latlng: const LatLng(40.7489, -73.9680),
      image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuC-JLK9Sz-7QDox4jch9MXZmorxd3R0G5C8gtszDyUNABsX-mfmpoEkyOm5dnqSKdDNO4yZkHFN0Kex35IQyZgqteXFbTCcsSQhElsbzut_ZJD8lK8usJXQo6goLRnZUxdl2D5Z8iHegd2T2T2MBU9695mVL_N3a7hP1gHNBAHum1qOGylmhxBewuHx1KDvtQc9DljDwhXufLLPqoDqZ6-xbkLMBsf8n8_toLot0KmT_5uvo-whFg96mKR5pjx78BjgvmfOaNNNM4Gy",
      rating: 4.7,
      reviews: 156,
      distance: 0.8,
    ),
  ];

  Set<Marker> markers = {};
  int selectedStoreIndex = 0;

  @override
  void initState() {
    super.initState();
    _initializeMarkers();
  }

  void _initializeMarkers() {
    markers = stores.asMap().entries.map((entry) {
      int index = entry.key;
      StoreMarker store = entry.value;

      return Marker(
        markerId: MarkerId(store.name),
        position: store.latlng,
        onTap: () {
          setState(() {
            selectedStoreIndex = index;
          });
          _animateToStore(store.latlng);
        },
        infoWindow: InfoWindow(
          title: store.name,
          snippet: "⭐ ${store.rating} • ${store.reviews} reviews",
        ),
      );
    }).toSet();
  }

  void _animateToStore(LatLng location) {
    if (_mapController == null) return;
    _mapController!.animateCamera(
      CameraUpdate.newCameraPosition(
        CameraPosition(
          target: location,
          zoom: 15,
        ),
      ),
    );
  }

  void _zoomIn() {
    if (_mapController == null) return;
    _mapController!.animateCamera(
      CameraUpdate.zoomIn(),
    );
  }

  void _zoomOut() {
    if (_mapController == null) return;
    _mapController!.animateCamera(
      CameraUpdate.zoomOut(),
    );
  }

  void _goToCurrentLocation() {
    if (_mapController == null) return;
    _mapController!.animateCamera(
      CameraUpdate.newCameraPosition(
        const CameraPosition(
          target: LatLng(40.7128, -74.0060),
          zoom: 14,
        ),
      ),
    );
  }

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          /// GOOGLE MAP
          GoogleMap(
            onMapCreated: (controller) {
              _mapController = controller;
            },
            initialCameraPosition: const CameraPosition(
              target: LatLng(40.7128, -74.0060),
              zoom: 14,
            ),
            markers: markers,
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
            mapToolbarEnabled: false,
          ),

          /// HEADER WITH SEARCH & FILTERS
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    /// SEARCH BAR
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            height: 50,
                            padding: const EdgeInsets.symmetric(horizontal: 14),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(14),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.1),
                                  blurRadius: 12,
                                  spreadRadius: 0,
                                  offset: const Offset(0, 4),
                                )
                              ],
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.search,
                                    color: Colors.grey, size: 20),
                                const SizedBox(width: 10),
                                const Expanded(
                                  child: TextField(
                                    decoration: InputDecoration(
                                      hintText: "Find sustainable sh",
                                      hintStyle: TextStyle(
                                        color: Colors.grey,
                                        fontSize: 14,
                                      ),
                                      border: InputBorder.none,
                                    ),
                                  ),
                                ),
                                GestureDetector(
                                  onTap: () {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                          content:
                                              Text('🎤 Voice search activated')),
                                    );
                                  },
                                  child: Icon(Icons.mic,
                                      color: const Color(0xff8CE4FF),
                                      size: 20),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        GestureDetector(
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('⚙️ Filters opened')),
                            );
                          },
                          child: Container(
                            height: 50,
                            width: 50,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(14),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.1),
                                  blurRadius: 12,
                                  spreadRadius: 0,
                                  offset: const Offset(0, 4),
                                )
                              ],
                            ),
                            child: const Icon(Icons.tune,
                                color: Colors.black, size: 24),
                          ),
                        )
                      ],
                    ),

                    const SizedBox(height: 14),

                    /// FILTER PILLS
                    SizedBox(
                      height: 38,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        children: [
                          filterButton("All", Icons.verified),
                          filterButton("Thrift", Icons.shopping_bag),
                          filterButton("Donation",
                              Icons.volunteer_activism),
                          filterButton("Zero Waste", Icons.eco),
                        ],
                      ),
                    )
                  ],
                ),
              ),
            ),
          ),

          /// CENTER MARKER
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 70,
                  height: 70,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.15),
                        blurRadius: 16,
                        spreadRadius: 0,
                        offset: const Offset(0, 4),
                      )
                    ],
                  ),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Container(
                        width: 70,
                        height: 70,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: Color(0xff8CE4FF),
                        ),
                      ),
                      Container(
                        width: 56,
                        height: 56,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white,
                        ),
                        child: const Icon(Icons.storefront,
                            color: Colors.black, size: 28),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  "GREEN THREAD",
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 11,
                    color: Colors.black,
                  ),
                )
              ],
            ),
          ),

          /// ZOOM & LOCATION BUTTONS
          Positioned(
            right: 16,
            bottom: 320,
            child: Column(
              children: [
                mapActionButton(Icons.add, _zoomIn),
                const SizedBox(height: 12),
                mapActionButton(Icons.remove, _zoomOut),
                const SizedBox(height: 12),
                mapActionButton(Icons.near_me, _goToCurrentLocation),
              ],
            ),
          ),

          /// FLOATING STORE CARD
          Positioned(
            bottom: 80,
            left: 16,
            right: 16,
            child: shopDetailCard(stores[selectedStoreIndex]),
          ),
        ],
      ),
    );
  }

  Widget filterButton(String text, IconData icon) {
    bool isActive = activeFilter == text;
    return GestureDetector(
      onTap: () {
        setState(() {
          activeFilter = text;
        });
      },
      child: Container(
        margin: const EdgeInsets.only(right: 10),
        child: ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            backgroundColor: isActive ? Colors.black : Colors.white,
            foregroundColor: isActive ? Colors.white : Colors.black,
            elevation: isActive ? 0 : 2,
            padding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(24),
            ),
          ),
          icon: Icon(icon, size: 16),
          label: Text(
            text,
            style: const TextStyle(
                fontSize: 12, fontWeight: FontWeight.w500),
          ),
          onPressed: () {
            setState(() {
              activeFilter = text;
            });
          },
        ),
      ),
    );
  }

  Widget mapActionButton(IconData icon, VoidCallback onPressed) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.12),
              blurRadius: 12,
              spreadRadius: 0,
              offset: const Offset(0, 4),
            )
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onPressed,
            borderRadius: BorderRadius.circular(16),
            child: Icon(icon, color: Colors.black, size: 24),
          ),
        ),
      ),
    );
  }

  Widget shopDetailCard(StoreMarker store) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.15),
            blurRadius: 20,
            spreadRadius: 0,
            offset: const Offset(0, -4),
          )
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          /// STORE INFO ROW
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              /// IMAGE WITH BADGE
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(14),
                    child: Image.network(
                      store.image,
                      width: 70,
                      height: 70,
                      fit: BoxFit.cover,
                    ),
                  ),
                  Positioned(
                    top: 4,
                    left: 4,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 4,
                          )
                        ],
                      ),
                      child: const Text(
                        "NEW",
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: Colors.black,
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(width: 12),

              /// STORE DETAILS
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            store.name,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: Colors.black,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        GestureDetector(
                          onTap: () {
                            setState(() {
                              isFavorite = !isFavorite;
                            });
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(
                                  isFavorite
                                      ? '❤️ Added to favorites'
                                      : '🤍 Removed from favorites',
                                ),
                              ),
                            );
                          },
                          child: Icon(
                            isFavorite
                                ? Icons.favorite
                                : Icons.favorite_border,
                            color: Colors.red,
                            size: 20,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      "⭐ ${store.rating} • ${store.reviews} reviews",
                      style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xFFFFA500),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      "📍 ${store.distance} KM • 🟢 Open until 6 PM",
                      style: const TextStyle(
                        fontSize: 11,
                        color: Colors.grey,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          /// ACTION BUTTONS
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    backgroundColor: const Color(0xff8CE4FF),
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                  icon: const Icon(Icons.directions, size: 16),
                  label: const Text(
                    "Get Directions",
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                            '🗺️ Opening directions to ${store.name}'),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(width: 10),
              GestureDetector(
                onTap: () {
                  showModalBottomSheet(
                    context: context,
                    builder: (context) => Container(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          ListTile(
                            leading: const Icon(Icons.phone),
                            title: const Text('Call'),
                            onTap: () {
                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('📞 Calling...')),
                              );
                            },
                          ),
                          ListTile(
                            leading: const Icon(Icons.share),
                            title: const Text('Share'),
                            onTap: () {
                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('📤 Share shop')),
                              );
                            },
                          ),
                          ListTile(
                            leading: const Icon(Icons.info),
                            title: const Text('More Info'),
                            onTap: () {
                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                    content: Text('ℹ️ More information')),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                  );
                },
                child: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.more_horiz,
                      color: Colors.black, size: 18),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
/// Store Marker Model
class StoreMarker {
  final String name;
  final LatLng latlng;
  final String image;
  final double rating;
  final int reviews;
  final double distance;

  StoreMarker({
    required this.name,
    required this.latlng,
    required this.image,
    required this.rating,
    required this.reviews,
    required this.distance,
  });
}
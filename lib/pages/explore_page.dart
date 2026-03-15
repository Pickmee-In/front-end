import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import 'package:url_launcher/url_launcher.dart';

import '../features/chat/services/chat_service.dart';
import '../features/explore/services/explore_api_service.dart';
import '../features/map/models/map_item.dart';
import '../features/map/services/map_api_service.dart';
import 'chat_page.dart';

class PickMeExplorePage extends StatefulWidget {
  const PickMeExplorePage({super.key});

  @override
  State<PickMeExplorePage> createState() => _PickMeExplorePageState();
}

class _PickMeExplorePageState extends State<PickMeExplorePage>
    with TickerProviderStateMixin {
    // ── Filter / Search ──────────────────────────────────────────────
    String activeFilter = "All";
    final TextEditingController _searchController = TextEditingController();
    Timer? _searchDebounce;

    // ── Map ──────────────────────────────────────────────────────────
    final MapController _mapController = MapController();

    // ── Services ─────────────────────────────────────────────────────
    final MapApiService _mapApiService = const MapApiService();
    final ExploreApiService _exploreApiService = const ExploreApiService();
    final ChatService _chatService = const ChatService();

    // ── State ────────────────────────────────────────────────────────
    List<MapItem> _items = [];
    MapItem? _selectedItem;
    bool _isLoading = false;
    double? _userLat;
    double? _userLng;

    // ── Blink animation for selected marker ──────────────────────────
    late AnimationController _blinkController;
    late Animation<double> _blinkAnimation;

    /// Default center: Klaten, Central Java
    static const LatLng _defaultCenter = LatLng(-7.706, 110.601);

    // ─────────────────────────────────────────────────────────────────
    // Lifecycle
    // ─────────────────────────────────────────────────────────────────

    @override
    void initState() {
      super.initState();
      _blinkController = AnimationController(
        duration: const Duration(milliseconds: 700),
        vsync: this,
      )..repeat(reverse: true);
      _blinkAnimation = Tween<double>(begin: 0.6, end: 1.0).animate(
        CurvedAnimation(parent: _blinkController, curve: Curves.easeInOut),
      );
      _bootstrap();
    }

    @override
    void dispose() {
      _blinkController.dispose();
      _searchController.dispose();
      _searchDebounce?.cancel();
      super.dispose();
    }

    // ─────────────────────────────────────────────────────────────────
    // Data loading
    // ─────────────────────────────────────────────────────────────────

    Future<void> _bootstrap() async {
      await _requestLocation();
      await _loadItems();
    }

    Future<void> _requestLocation() async {
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
          _userLat = pos.latitude;
          _userLng = pos.longitude;
        });
        // Move map to user location after first frame
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            _mapController.move(LatLng(_userLat!, _userLng!), 14.0);
          }
        });
      } catch (_) {}
    }

    Future<void> _loadItems() async {
      if (!mounted) return;
      setState(() => _isLoading = true);
      try {
        final listingType = _filterToListingType(activeFilter);
        final q = _searchController.text.trim().isEmpty
            ? null
            : _searchController.text.trim();
        final result = await _mapApiService.getNearbyItems(
          latitude: _userLat,
          longitude: _userLng,
          listingType: listingType,
          q: q,
        );
        if (!mounted) return;
        setState(() {
          _items = result;
          if (_selectedItem == null && result.isNotEmpty) {
            _selectedItem = result.first;
          } else if (_selectedItem != null) {
            final updated =
                result.where((i) => i.id == _selectedItem!.id).toList();
            _selectedItem =
                updated.isNotEmpty ? updated.first : result.firstOrNull;
          }
          _isLoading = false;
        });
      } catch (_) {
        if (mounted) setState(() => _isLoading = false);
      }
    }

    String? _filterToListingType(String filter) {
      switch (filter) {
        case "Thrift":
          return "thrift";
        case "Donation":
          return "donate";
        case "Zero Waste":
          return "swap";
        default:
          return null;
      }
    }

    void _onSearchChanged(String _) {
      _searchDebounce?.cancel();
      _searchDebounce = Timer(const Duration(milliseconds: 500), _loadItems);
    }

    // ─────────────────────────────────────────────────────────────────
    // Favorite toggle
    // ─────────────────────────────────────────────────────────────────

    Future<void> _toggleFavorite(MapItem item) async {
      final newAction = item.isFavorite ? 'skip' : 'pick';
      try {
        await _exploreApiService.swipe(itemId: item.id, action: newAction);
        if (!mounted) return;
        setState(() {
          final idx = _items.indexWhere((i) => i.id == item.id);
          if (idx != -1) {
            _items[idx] = _items[idx].copyWith(isFavorite: !item.isFavorite);
            if (_selectedItem?.id == item.id) {
              _selectedItem = _items[idx];
            }
          }
        });
      } catch (_) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to update favorite')),
        );
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // Directions
    // ─────────────────────────────────────────────────────────────────

    Future<void> _getDirections(MapItem item) async {
      final lat = item.latitude;
      final lng = item.longitude;
      final label = Uri.encodeComponent(item.title);
      // geo: URI opens any installed maps app on Android
      final geoUri = Uri.parse('geo:$lat,$lng?q=$lat,$lng($label)');
      // Fallback: OpenStreetMap in browser
      final osmUri = Uri.parse(
          'https://www.openstreetmap.org/?mlat=$lat&mlon=$lng#map=17/$lat/$lng');
      try {
        if (await canLaunchUrl(geoUri)) {
          await launchUrl(geoUri);
        } else {
          await launchUrl(osmUri, mode: LaunchMode.externalApplication);
        }
      } catch (_) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open maps')),
        );
      }
    }

    Future<void> _openChatForItem(MapItem item) async {
      try {
        final conversation = await _chatService.startConversationForItem(item.id);
        if (!mounted) return;
        await Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => ChatDetailPage(
              conversationId: conversation.id,
              initialTitle: conversation.otherUserName,
            ),
          ),
        );
      } catch (error) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not open chat: $error')),
        );
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // Map helpers
    // ─────────────────────────────────────────────────────────────────

    void _moveToUserLocation() {
      if (_userLat != null && _userLng != null) {
        _mapController.move(LatLng(_userLat!, _userLng!), 15.0);
      } else {
        _requestLocation();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('📍 Getting your location...')),
          );
        }
      }
    }

    /// Blue pulsing dot for the user's current position
    Marker _buildUserLocationMarker() {
      return Marker(
        point: LatLng(_userLat!, _userLng!),
        width: 28,
        height: 28,
        child: Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.blue,
            border: Border.all(color: Colors.white, width: 2.5),
            boxShadow: [
              BoxShadow(
                color: Colors.blue.withValues(alpha: 0.5),
                blurRadius: 10,
                spreadRadius: 4,
              ),
            ],
          ),
        ),
      );
    }

    List<Marker> _buildMarkers() {
      return _items.map((item) {
        final isSelected = _selectedItem?.id == item.id;
        return Marker(
          point: LatLng(item.latitude, item.longitude),
          width: isSelected ? 80 : 60,
          height: isSelected ? 80 : 60,
          child: GestureDetector(
            onTap: () {
              setState(() => _selectedItem = item);
              _mapController.move(LatLng(item.latitude, item.longitude), 16.0);
            },
            child: _buildMarkerWidget(item, isSelected),
          ),
        );
      }).toList();
    }

    Widget _buildMarkerWidget(MapItem item, bool isSelected) {
      final color = _listingTypeColor(item.listingType);
      final size = isSelected ? 62.0 : 46.0;
      Widget circle = Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: color.withValues(alpha: 0.15),
          border: Border.all(color: color, width: isSelected ? 3 : 2),
          boxShadow: [
            BoxShadow(
                color: color.withValues(alpha: 0.35), blurRadius: 8, spreadRadius: 2),
          ],
        ),
        child: ClipOval(
          child: Image.network(
            item.imageUrl,
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) => Container(
              color: color.withValues(alpha: 0.1),
              child: Icon(Icons.checkroom, color: color, size: size * 0.45),
            ),
          ),
        ),
      );
      if (isSelected) {
        circle = AnimatedBuilder(
          animation: _blinkAnimation,
            builder: (context, child) =>
              Opacity(opacity: _blinkAnimation.value, child: child),
          child: circle,
        );
      }
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          circle,
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(shape: BoxShape.circle, color: color),
          ),
        ],
      );
    }

    Color _listingTypeColor(String type) {
      switch (type) {
        case 'thrift':
          return const Color(0xFF8CE4FF);
        case 'donate':
          return Colors.green;
        case 'swap':
          return Colors.orange;
        default:
          return Colors.grey;
      }
    }

    String _formatPrice(double price) {
      if (price >= 1000000) {
        return 'Rp ${(price / 1000000).toStringAsFixed(1)}jt';
      } else if (price >= 1000) {
        return 'Rp ${(price / 1000).toStringAsFixed(0)}k';
      }
      return 'Rp ${price.toStringAsFixed(0)}';
    }

    // ─────────────────────────────────────────────────────────────────
    // Build
    // ─────────────────────────────────────────────────────────────────

    @override
    Widget build(BuildContext context) {
      return Scaffold(
        body: Stack(
          children: [
            /// OSM MAP
            FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: _defaultCenter,
                initialZoom: 14.0,
                minZoom: 8.0,
                maxZoom: 19.0,
              ),
              children: [
                TileLayer(
                  urlTemplate:
                      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.example.front_end',
                ),
                // Nearby-radius fill
                if (_userLat != null && _userLng != null)
                  CircleLayer(
                    circles: [
                      CircleMarker(
                        point: LatLng(_userLat!, _userLng!),
                        radius: 5000, // 5 km
                        useRadiusInMeter: true,
                        color: const Color(0xFF8CE4FF).withValues(alpha: 0.08),
                        borderColor:
                            const Color(0xFF8CE4FF).withValues(alpha: 0.45),
                        borderStrokeWidth: 1.5,
                      ),
                    ],
                  ),
                MarkerLayer(markers: _buildMarkers()),
                // User location dot (drawn on top of item markers)
                if (_userLat != null && _userLng != null)
                  MarkerLayer(markers: [_buildUserLocationMarker()]),
              ],
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
                                    color: Colors.black.withValues(alpha: 0.1),
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
                                  Expanded(
                                    child: TextField(
                                      controller: _searchController,
                                      onChanged: _onSearchChanged,
                                      decoration: const InputDecoration(
                                        hintText: "Find sustainable clothes...",
                                        hintStyle: TextStyle(
                                          color: Colors.grey,
                                          fontSize: 14,
                                        ),
                                        border: InputBorder.none,
                                      ),
                                    ),
                                  ),
                                  if (_isLoading)
                                    const SizedBox(
                                      width: 16,
                                      height: 16,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: Color(0xff8CE4FF),
                                      ),
                                    )
                                  else
                                    GestureDetector(
                                      onTap: _loadItems,
                                      child: const Icon(Icons.mic,
                                          color: Color(0xff8CE4FF), size: 20),
                                    ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          GestureDetector(
                            onTap: () => _showFilterSheet(context),
                            child: Container(
                              height: 50,
                              width: 50,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(14),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.1),
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
                            filterButton(
                                "Donation", Icons.volunteer_activism),
                            filterButton("Zero Waste", Icons.eco),
                          ],
                        ),
                      )
                    ],
                  ),
                ),
              ),
            ),

            /// ZOOM & LOCATION BUTTONS
            Positioned(
              right: 16,
              bottom: 320,
              child: Column(
                children: [
                  mapActionButton(Icons.add, () {
                    final z = _mapController.camera.zoom;
                    _mapController.move(
                        _mapController.camera.center, z + 1);
                  }),
                  const SizedBox(height: 12),
                  mapActionButton(Icons.remove, () {
                    final z = _mapController.camera.zoom;
                    _mapController.move(
                        _mapController.camera.center, z - 1);
                  }),
                  const SizedBox(height: 12),
                  mapActionButton(Icons.near_me, _moveToUserLocation),
                ],
              ),
            ),

            /// FLOATING STORE CARD
            Positioned(
              bottom: 80,
              left: 16,
              right: 16,
              child: _selectedItem != null
                  ? shopDetailCard(_selectedItem!)
                  : const SizedBox.shrink(),
            ),
          ],
        ),
      );
    }

    // ─────────────────────────────────────────────────────────────────
    // Filter sheet
    // ─────────────────────────────────────────────────────────────────

    void _showFilterSheet(BuildContext ctx) {
      showModalBottomSheet(
        context: ctx,
        builder: (_) => Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.verified),
                title: const Text('All items'),
                onTap: () {
                  Navigator.pop(ctx);
                  setState(() => activeFilter = "All");
                  _loadItems();
                },
              ),
              ListTile(
                leading: const Icon(Icons.shopping_bag),
                title: const Text('Thrift only'),
                onTap: () {
                  Navigator.pop(ctx);
                  setState(() => activeFilter = "Thrift");
                  _loadItems();
                },
              ),
              ListTile(
                leading: const Icon(Icons.volunteer_activism),
                title: const Text('Donations only'),
                onTap: () {
                  Navigator.pop(ctx);
                  setState(() => activeFilter = "Donation");
                  _loadItems();
                },
              ),
              ListTile(
                leading: const Icon(Icons.eco),
                title: const Text('Swap / Zero Waste'),
                onTap: () {
                  Navigator.pop(ctx);
                  setState(() => activeFilter = "Zero Waste");
                  _loadItems();
                },
              ),
            ],
          ),
        ),
      );
    }

    // ─────────────────────────────────────────────────────────────────
    // Widget helpers
    // ─────────────────────────────────────────────────────────────────

    Widget filterButton(String text, IconData icon) {
      bool isActive = activeFilter == text;
      return GestureDetector(
        onTap: () {
          setState(() {
            activeFilter = text;
          });
          _loadItems();
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
              _loadItems();
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
                color: Colors.black.withValues(alpha: 0.12),
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

    Widget shopDetailCard(MapItem item) {
      return Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.15),
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
                        item.imageUrl,
                        width: 70,
                        height: 70,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Container(
                          width: 70,
                          height: 70,
                          color: Colors.grey[200],
                          child: const Icon(Icons.checkroom, color: Colors.grey),
                        ),
                      ),
                    ),
                    if (item.isNewDrop)
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
                                color: Colors.black.withValues(alpha: 0.1),
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
                              item.title,
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
                            onTap: () => _toggleFavorite(item),
                            child: Icon(
                              item.isFavorite
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
                        '${item.condition} • ${item.category}',
                        style: const TextStyle(
                          fontSize: 11,
                          color: Color(0xFFFFA500),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        [
                          if (item.distance.isNotEmpty) '📍 ${item.distance}',
                          item.price != null
                              ? _formatPrice(item.price!)
                              : 'Free',
                        ].join(' • '),
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
                    onPressed: () => _getDirections(item),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xff8CE4FF),
                      elevation: 0,
                      side: const BorderSide(color: Color(0xff8CE4FF)),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                    ),
                    icon: const Icon(Icons.chat_bubble_outline, size: 16),
                    label: const Text(
                      "Go to Chat",
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    onPressed: () => _openChatForItem(item),
                  ),
                ),
                const SizedBox(width: 10),
                GestureDetector(
                  onTap: () {
                    showModalBottomSheet(
                      context: context,
                      builder: (ctx) => Container(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            ListTile(
                              leading: const Icon(Icons.info_outline),
                              title: const Text('Details'),
                              subtitle: Text(
                                  '${item.size} • ${item.listingType.toUpperCase()}'),
                              onTap: () => Navigator.pop(ctx),
                            ),
                            ListTile(
                              leading: const Icon(Icons.share),
                              title: const Text('Share'),
                              onTap: () {
                                Navigator.pop(ctx);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                      content: Text('📤 Share item')),
                                );
                              },
                            ),
                            ListTile(
                              leading: const Icon(Icons.map_outlined),
                              title: const Text('Centre on map'),
                              onTap: () {
                                Navigator.pop(ctx);
                                _mapController.move(
                                  LatLng(item.latitude, item.longitude),
                                  17.0,
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

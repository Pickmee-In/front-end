import 'package:flutter/material.dart';
import 'notifications_page.dart';

class Item {
  final String id;
  final String name;
  final String category;
  final String condition;
  final String distance;
  final String imageUrl;
  final bool isNewDrop;

  Item({
    required this.id,
    required this.name,
    required this.category,
    required this.condition,
    required this.distance,
    required this.imageUrl,
    required this.isNewDrop,
  });
}

class DiscoverItemsPage extends StatefulWidget {
  const DiscoverItemsPage({super.key});

  @override
  State<DiscoverItemsPage> createState() => _DiscoverItemsPageState();
}

class _DiscoverItemsPageState extends State<DiscoverItemsPage>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late AnimationController _cardExitController;
  int currentIndex = 0;
  double _dragDistance = 0;
  double _dragVerticalDistance = 0;
  double _rotationAngle = 0;
  bool _isAnimatingExit = false;
  bool _exitLiked = false;
  String _sortBy = 'Closest';
  int notifications = 3;
  String? _selectedCategory;
  String? _selectedPriceFilter; // 'free', 'paid', 'all'

  final List<String> categories = [
    'All',
    'Jacket',
    'Shirt',
    'Sweater',
    'Dress',
    'Pants',
    'Skirt',
    'Shoes',
    'Accessories',
  ];

  final List<Item> items = [
    Item(
      id: '1',
      name: 'Vintage Denim Jacket',
      category: 'JACKET',
      condition: 'Excellent Condition',
      distance: '1.2 km away',
      imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuC-JLK9Sz-7QDox4jch9MXZmorxd3R0G5C8gtszDyUNABsX-mfmpoEkyOm5dnqSKdDNO4yZkHFN0Kex35IQyZgqteXFbTCcsSQhElsbzut_ZJD8lK8usJXQo6goLRnZUxdl2D5Z8iHegd2T2T2MBU9695mVL_N3a7hP1gHNBAHum1qOGylmhxBewuHx1KDvtQc9DljDwhXufLLPqoDqZ6-xbkLMBsf8n8_toLot0KmT_5uvo-whFg96mKR5pjx78BjgvmfOaNNNM4Gy',
      isNewDrop: true,
    ),
    Item(
      id: '2',
      name: 'Sustainable Linen Shirt',
      category: 'SHIRT',
      condition: 'Like New',
      distance: '2.5 km away',
      imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuC-JLK9Sz-7QDox4jch9MXZmorxd3R0G5C8gtszDyUNABsX-mfmpoEkyOm5dnqSKdDNO4yZkHFN0Kex35IQyZgqteXFbTCcsSQhElsbzut_ZJD8lK8usJXQo6goLRnZUxdl2D5Z8iHegd2T2T2MBU9695mVL_N3a7hP1gHNBAHum1qOGylmhxBewuHx1KDvtQc9DljDwhXufLLPqoDqZ6-xbkLMBsf8n8_toLot0KmT_5uvo-whFg96mKR5pjx78BjgvmfOaNNNM4Gy',
      isNewDrop: false,
    ),
    Item(
      id: '3',
      name: 'Eco-Friendly Sweater',
      category: 'SWEATER',
      condition: 'Good Condition',
      distance: '0.8 km away',
      imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuC-JLK9Sz-7QDox4jch9MXZmorxd3R0G5C8gtszDyUNABsX-mfmpoEkyOm5dnqSKdDNO4yZkHFN0Kex35IQyZgqteXFbTCcsSQhElsbzut_ZJD8lK8usJXQo6goLRnZUxdl2D5Z8iHegd2T2T2MBU9695mVL_N3a7hP1gHNBAHum1qOGylmhxBewuHx1KDvtQc9DljDwhXufLLPqoDqZ6-xbkLMBsf8n8_toLot0KmT_5uvo-whFg96mKR5pjx78BjgvmfOaNNNM4Gy',
      isNewDrop: true,
    ),
    Item(
      id: '4',
      name: 'Vintage Floral Dress',
      category: 'DRESS',
      condition: 'Excellent Condition',
      distance: '3.2 km away',
      imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuC-JLK9Sz-7QDox4jch9MXZmorxd3R0G5C8gtszDyUNABsX-mfmpoEkyOm5dnqSKdDNO4yZkHFN0Kex35IQyZgqteXFbTCcsSQhElsbzut_ZJD8lK8usJXQo6goLRnZUxdl2D5Z8iHegd2T2T2MBU9695mVL_N3a7hP1gHNBAHum1qOGylmhxBewuHx1KDvtQc9DljDwhXufLLPqoDqZ6-xbkLMBsf8n8_toLot0KmT_5uvo-whFg96mKR5pjx78BjgvmfOaNNNM4Gy',
      isNewDrop: false,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );
    _cardExitController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    _cardExitController.dispose();
    super.dispose();
  }

  void _animateCardOut(bool isLiked) {
    _isAnimatingExit = true;
    _exitLiked = isLiked;
    _cardExitController.forward().then((_) {
      if (mounted) {
        setState(() {
          currentIndex++;
          _dragDistance = 0;
          _dragVerticalDistance = 0;
          _rotationAngle = 0;
          _isAnimatingExit = false;
          _cardExitController.reset();
        });
      }
    });
  }

  void _snapCardBack() {
    _animationController.forward(from: 0.0).then((_) {
      if (mounted) {
        setState(() {
          _dragDistance = 0;
          _dragVerticalDistance = 0;
          _rotationAngle = 0;
          _animationController.reset();
        });
      }
    });
  }

  void _showFilterMenu() {
    showGeneralDialog(
      context: context,
      barrierLabel: 'Barrier',
      barrierDismissible: true,
      barrierColor: Colors.black.withValues(alpha: 0.3),
      transitionDuration: const Duration(milliseconds: 300),
      pageBuilder: (context, anim1, anim2) {
        return const SizedBox();
      },
      transitionBuilder: (context, anim1, anim2, child) {
        return Align(
          alignment: Alignment.centerLeft,
          child: SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(-1, 0),
              end: Offset.zero,
            ).animate(anim1),
            child: StatefulBuilder(
              builder: (context, setModalState) {
                return Container(
                  width: 300,
                  height: double.infinity,
                  color: Colors.white,
                  child: SingleChildScrollView(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Header
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Saring & Urutkan',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.black,
                                  fontFamily: 'Plus Jakarta Sans',
                                ),
                              ),
                              GestureDetector(
                                onTap: () => Navigator.pop(context),
                                child: const Icon(Icons.close, size: 24),
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),

                          // Sort By Section
                          const Text(
                            'Urutkan Berdasarkan',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: Colors.black,
                              fontFamily: 'Plus Jakarta Sans',
                            ),
                          ),
                          const SizedBox(height: 12),
                          Column(
                            children: [
                              _buildSortOption('Closest', 'Terdekat dari saya', setModalState),
                              _buildSortOption('Newest', 'Terbaru dulu', setModalState),
                              _buildSortOption('Price: Low to High', 'Harga terendah', setModalState),
                              _buildSortOption('Price: High to Low', 'Harga tertinggi', setModalState),
                              _buildSortOption('Condition', 'Kondisi terbaik', setModalState),
                            ],
                          ),
                          const SizedBox(height: 24),

                          // Category Section
                          const Text(
                            'Kategori Barang',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: Colors.black,
                              fontFamily: 'Plus Jakarta Sans',
                            ),
                          ),
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 6,
                            runSpacing: 6,
                            children: categories.map((category) {
                              final isSelected = _selectedCategory == category;
                              return GestureDetector(
                                onTap: () {
                                  setModalState(() {
                                    _selectedCategory = isSelected ? null : category;
                                  });
                                },
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 6,
                                  ),
                                  decoration: BoxDecoration(
                                    color: isSelected
                                        ? const Color(0xff8CE4FF)
                                        : Colors.grey.shade100,
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(
                                      color: isSelected
                                          ? const Color(0xff8CE4FF)
                                          : Colors.grey.shade300,
                                    ),
                                  ),
                                  child: Text(
                                    category,
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: isSelected ? Colors.white : Colors.black87,
                                      fontFamily: 'Plus Jakarta Sans',
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                          const SizedBox(height: 24),

                          // Price Filter Section
                          const Text(
                            'Tipe Barang',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: Colors.black,
                              fontFamily: 'Plus Jakarta Sans',
                            ),
                          ),
                          const SizedBox(height: 12),
                          Column(
                            children: [
                              _buildPriceOption('Gratis', 'free', setModalState),
                              const SizedBox(height: 8),
                              _buildPriceOption('Berbayar', 'paid', setModalState),
                              const SizedBox(height: 8),
                              _buildPriceOption('Semua', 'all', setModalState),
                            ],
                          ),
                          const SizedBox(height: 24),

                          // Apply Button
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xff8CE4FF),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                              onPressed: () {
                                setState(() {});
                                Navigator.pop(context);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                      'Filter diterapkan • ${_selectedCategory ?? 'Semua'} • ${_selectedPriceFilter == 'free' ? 'Gratis' : _selectedPriceFilter == 'paid' ? 'Berbayar' : 'Semua'}',
                                    ),
                                    duration: const Duration(milliseconds: 1500),
                                  ),
                                );
                              },
                              child: const Text(
                                'Terapkan',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  fontFamily: 'Plus Jakarta Sans',
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        );
      },
    );
  }

  Widget _buildSortOption(String value, String label, setModalState) {
    final isSelected = _sortBy == value;
    return GestureDetector(
      onTap: () {
        setModalState(() {
          _sortBy = value;
        });
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xff8CE4FF).withValues(alpha: 0.1) : Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected
                ? const Color(0xff8CE4FF)
                : Colors.grey.shade300,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: isSelected ? const Color(0xff8CE4FF) : Colors.black87,
                    fontFamily: 'Plus Jakarta Sans',
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.grey.shade500,
                    fontFamily: 'Plus Jakarta Sans',
                  ),
                ),
              ],
            ),
            if (isSelected)
              const Icon(
                Icons.check_circle,
                color: Color(0xff8CE4FF),
                size: 20,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildPriceOption(String label, String value, setModalState) {
    final isSelected = _selectedPriceFilter == value;
    return GestureDetector(
      onTap: () {
        setModalState(() {
          _selectedPriceFilter = isSelected ? null : value;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xff8CE4FF) : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected
                ? const Color(0xff8CE4FF)
                : Colors.grey.shade300,
          ),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: isSelected ? Colors.white : Colors.black87,
              fontFamily: 'Plus Jakarta Sans',
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.menu, color: Colors.black),
          onPressed: _showFilterMenu,
        ),
        title: const Text(
          'PickMe',
          style: TextStyle(
            color: Colors.black,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        actions: [
          // Sort By Button
          PopupMenuButton<String>(
            onSelected: (value) {
              setState(() {
                _sortBy = value;
              });
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Sorted by: $value'),
                  duration: const Duration(milliseconds: 1500),
                ),
              );
            },
            itemBuilder: (BuildContext context) => [
              const PopupMenuItem(
                value: 'Closest',
                child: Text('Closest to me'),
              ),
              const PopupMenuItem(
                value: 'Newest',
                child: Text('Newest first'),
              ),
              const PopupMenuItem(
                value: 'Price: Low to High',
                child: Text('Price: Low to High'),
              ),
              const PopupMenuItem(
                value: 'Price: High to Low',
                child: Text('Price: High to Low'),
              ),
              const PopupMenuItem(
                value: 'Condition',
                child: Text('Best Condition'),
              ),
            ],
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: Center(
                child: Text(
                  _sortBy,
                  style: const TextStyle(
                    color: Colors.black,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ),
          // Notification Button
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_none, color: Colors.black),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const NotificationsPage(),
                    ),
                  ).then((_) {
                    setState(() {
                      notifications = 0;
                    });
                  });
                },
              ),
              if (notifications > 0)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    width: 18,
                    height: 18,
                    decoration: BoxDecoration(
                      color: const Color(0xff8CE4FF),
                      borderRadius: BorderRadius.circular(9),
                    ),
                    child: Center(
                      child: Text(
                        notifications.toString(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: currentIndex >= items.length
          ? _buildNoMoreItems()
          : Stack(
              children: [
                // Background cards effect - animated
                if (currentIndex + 2 < items.length)
                  AnimatedBuilder(
                    animation: _cardExitController,
                    builder: (context, child) {
                      final progress = _cardExitController.value;
                      return Positioned.fill(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 20, vertical: 20),
                          child: Transform.translate(
                            offset: Offset(0, 16 - (progress * 8)),
                            child: Transform.scale(
                              scale: 0.92 + (progress * 0.02),
                              child: Opacity(
                                opacity: 1.0 - (progress * 0.3),
                                child: child,
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                    child: _buildItemCard(items[currentIndex + 2]),
                  ),

                // Second background card - animated
                if (currentIndex + 1 < items.length)
                  AnimatedBuilder(
                    animation: _cardExitController,
                    builder: (context, child) {
                      final progress = _cardExitController.value;
                      final curve = Curves.easeOut;
                      final curvedProgress = curve.transform(progress);
                      return Positioned.fill(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 20, vertical: 20),
                          child: Transform.translate(
                            offset: Offset(0, 8 - (curvedProgress * 8)),
                            child: Transform.scale(
                              scale: 0.96 + (curvedProgress * 0.02),
                              child: Opacity(
                                opacity: 1.0 - (curvedProgress * 0.15),
                                child: child,
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                    child: _buildItemCard(items[currentIndex + 1]),
                  ),

                // Main card with drag
                Positioned.fill(
                  child: GestureDetector(
                    onHorizontalDragUpdate: (details) {
                      if (!_isAnimatingExit) {
                        setState(() {
                          _dragDistance += details.delta.dx;
                          _dragVerticalDistance += details.delta.dy * 0.5;
                          _rotationAngle = _dragDistance / 500;
                        });
                      }
                    },
                    onHorizontalDragEnd: (details) {
                      if (_isAnimatingExit) return;

                      final velocity = details.velocity.pixelsPerSecond.dx;
                      final isLiked = _dragDistance > 0;

                      if (_dragDistance.abs() > 80 || velocity.abs() > 800) {
                        _animateCardOut(isLiked);
                      } else {
                        _snapCardBack();
                      }
                    },
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 20),
                      child: AnimatedBuilder(
                        animation: _cardExitController,
                        builder: (context, child) {
                          double exitOffset = 0;
                          double exitRotation = 0;
                          double exitScale = 1.0;

                          if (_isAnimatingExit) {
                            final progress = _cardExitController.value;
                            final curve = Curves.easeInCubic;
                            final curvedProgress = curve.transform(progress);

                            exitOffset = _exitLiked
                                ? curvedProgress * 800
                                : -curvedProgress * 800;
                            exitRotation =
                                (_exitLiked ? 0.5 : -0.5) * curvedProgress;

                            final fadeProgress =
                                Curves.easeOut.transform(progress);
                            exitScale = 1.0 - (fadeProgress * 0.1);
                          }

                          return Transform.translate(
                            offset: Offset(
                              _isAnimatingExit ? exitOffset : _dragDistance,
                              _isAnimatingExit
                                  ? -100 * _cardExitController.value
                                  : _dragVerticalDistance,
                            ),
                            child: Transform.rotate(
                              angle: _isAnimatingExit
                                  ? exitRotation
                                  : _rotationAngle,
                              alignment: Alignment.bottomRight,
                              child: Transform.scale(
                                scale: _isAnimatingExit
                                    ? exitScale
                                    : (1 - (_dragDistance.abs() / 3000)),
                                child: Opacity(
                                  opacity: _isAnimatingExit
                                      ? 1.0 - _cardExitController.value
                                      : 1.0,
                                  child: child,
                                ),
                              ),
                            ),
                          );
                        },
                        child: _buildItemCard(
                          items[currentIndex],
                          dragDistance: _dragDistance,
                          isAnimatingExit: _isAnimatingExit,
                        ),
                      ),
                    ),
                  ),
                ),

                // Progress indicator
                Positioned(
                  top: 16,
                  left: 20,
                  right: 20,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: LinearProgressIndicator(
                      value: (currentIndex + 1) / items.length,
                      minHeight: 4,
                      backgroundColor: Colors.grey.shade300,
                      valueColor: const AlwaysStoppedAnimation<Color>(
                        Color(0xff8CE4FF),
                      ),
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildItemCard(Item item,
      {double dragDistance = 0, bool isAnimatingExit = false}) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.25),
            blurRadius: 20,
            offset: const Offset(0, 12),
          )
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(28),
        child: Stack(
          children: [
            // Image
            Image.network(
              item.imageUrl,
              fit: BoxFit.cover,
              width: double.infinity,
              height: double.infinity,
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  color: Colors.grey.shade300,
                  child: const Center(
                    child: Icon(Icons.broken_image, size: 48),
                  ),
                );
              },
            ),

            // Gradient overlay
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    Colors.black.withValues(alpha: 0.8),
                  ],
                ),
              ),
            ),

            // Like badge overlay - inside card
            if (dragDistance > 30 && !isAnimatingExit)
              Positioned.fill(
                child: Align(
                  alignment: Alignment.topLeft,
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: TweenAnimationBuilder<double>(
                      tween: Tween<double>(
                          begin: 0,
                          end: (dragDistance / 300).clamp(0, 1).toDouble()),
                      duration: const Duration(milliseconds: 150),
                      curve: Curves.easeOut,
                      builder: (context, value, child) {
                        return Opacity(
                          opacity: value,
                          child: Transform.scale(
                            scale: value * 0.9 + 0.1,
                            child: Transform.rotate(
                              angle: -0.3,
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 16, vertical: 12),
                                decoration: BoxDecoration(
                                  color: Colors.green.shade400,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color: Colors.green.shade600,
                                    width: 3,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.green.shade400
                                          .withValues(alpha: 0.8),
                                      blurRadius: 20,
                                      spreadRadius: 4,
                                    )
                                  ],
                                ),
                                child: const Text(
                                  'LIKE ♥',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 1,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ),
              ),

            // Skip badge overlay - inside card
            if (dragDistance < -30 && !isAnimatingExit)
              Positioned.fill(
                child: Align(
                  alignment: Alignment.topRight,
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: TweenAnimationBuilder<double>(
                      tween: Tween<double>(
                          begin: 0,
                          end:
                              ((-dragDistance) / 300).clamp(0, 1).toDouble()),
                      duration: const Duration(milliseconds: 150),
                      curve: Curves.easeOut,
                      builder: (context, value, child) {
                        return Opacity(
                          opacity: value,
                          child: Transform.scale(
                            scale: value * 0.9 + 0.1,
                            child: Transform.rotate(
                              angle: 0.3,
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 16, vertical: 12),
                                decoration: BoxDecoration(
                                  color: const Color(0xff8CE4FF),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color: const Color(0xff5BC4FF),
                                    width: 3,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: const Color(0xff8CE4FF)
                                          .withValues(alpha: 0.8),
                                      blurRadius: 20,
                                      spreadRadius: 4,
                                    )
                                  ],
                                ),
                                child: const Text(
                                  '✕ SKIP',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 1,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ),
              ),

            // Content at bottom
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Category badges
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade700,
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Text(
                            item.category,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        if (item.isNewDrop)
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  Colors.green.shade400,
                                  Colors.green.shade600,
                                ],
                              ),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: const Text(
                              'NEW DROP',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Product name
                    Text(
                      item.name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 26,
                        fontWeight: FontWeight.bold,
                        height: 1.2,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Info row with icons
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              const Icon(
                                Icons.check_circle,
                                color: Colors.white70,
                                size: 14,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                item.condition,
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 10),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              const Icon(
                                Icons.location_on,
                                color: Colors.white70,
                                size: 14,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                item.distance,
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNoMoreItems() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                colors: [
                  const Color(0xff8CE4FF).withValues(alpha: 0.2),
                  const Color(0xff44CCFF).withValues(alpha: 0.2),
                ],
              ),
            ),
            child: const Icon(
              Icons.done_all,
              color: Color(0xff8CE4FF),
              size: 50,
            ),
          ),
          const SizedBox(height: 28),
          const Text(
            'Semua Item Selesai!',
            style: TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.bold,
              color: Colors.black,
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'Kamu sudah menjelajahi semua item.\nKembali lagi nanti untuk item baru!',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 36),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xff8CE4FF),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
              elevation: 4,
            ),
            onPressed: () {
              setState(() {
                currentIndex = 0;
              });
            },
            icon: const Icon(Icons.refresh, size: 20),
            label: const Text(
              'Jelajahi Lagi',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

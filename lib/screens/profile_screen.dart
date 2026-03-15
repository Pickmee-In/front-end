import 'package:flutter/material.dart';
import 'package:front_end/features/profile/services/profile_service.dart';
import 'package:front_end/screens/edit_profile_screen.dart';
import 'package:front_end/screens/edit_item_page.dart';
import 'package:front_end/widgets/profile/profile_header.dart';
import 'package:front_end/widgets/profile/stat_card.dart';
import 'package:front_end/widgets/profile/level_card.dart';
import 'package:front_end/widgets/profile/item_card.dart';
import 'package:front_end/features/auth/services/google_auth_service.dart';
import 'package:front_end/features/items/services/item_upload_service.dart';
import 'package:front_end/pages/login_page.dart';
import 'package:front_end/pages/onboarding_page.dart';

class PickMeProfilePage extends StatefulWidget {
  const PickMeProfilePage({super.key});

  @override
  State<PickMeProfilePage> createState() => PickMeProfilePageState();
}

class PickMeProfilePageState extends State<PickMeProfilePage> {
  final ItemUploadService _itemService = const ItemUploadService();
  final ProfileService _profileService = const ProfileService();
  List<MyItem> _myItems = [];
  bool _isLoadingItems = true;
  UserProfile? _profile;
  ProfileStats? _stats;
  bool _isLoadingStats = true;

  @override
  void initState() {
    super.initState();
    refreshProfile();
    refreshMyItems();
    refreshStats();
  }

  Future<void> refreshStats() async {
    try {
      final stats = await _profileService.getStats();
      if (!mounted) return;
      setState(() {
        _stats = stats;
        _isLoadingStats = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _isLoadingStats = false);
    }
  }

  Future<void> refreshProfile() async {
    try {
      final profile = await _profileService.getCurrentUser();
      if (!mounted) return;
      setState(() {
        _profile = profile;
      });
    } catch (_) {
      if (!mounted) return;
    }
  }

  Future<void> refreshMyItems() async {
    try {
      final items = await _itemService.listMyItems();
      if (!mounted) return;
      setState(() {
        _myItems = items;
        _isLoadingItems = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _isLoadingItems = false;
      });
    }
  }

  String _formatPrice(MyItem item) {
    if (item.isFree || item.price == null) return 'Free';
    return 'Rp ${item.price!.toStringAsFixed(0)}';
  }

  Future<void> _deleteItem(MyItem item) async {
    await _itemService.deleteItem(item.id);
    await refreshMyItems();
    await refreshStats();
  }

  Future<void> _showEditDialog(MyItem item) async {
    final didSave = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => EditItemPage(itemId: item.id)),
    );
    if (didSave == true) {
      await refreshMyItems();
      await refreshStats();
    }
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                /// ICON
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.logout,
                    color: Colors.red,
                    size: 30,
                  ),
                ),

                const SizedBox(height: 16),

                /// TITLE
                const Text(
                  "Log Out?",
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),

                const SizedBox(height: 8),

                /// MESSAGE
                const Text(
                  "Are you sure you want to log out from your account?",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey,
                  ),
                ),

                const SizedBox(height: 24),

                /// BUTTONS
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.grey[100],
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed: () => Navigator.pop(context),
                        child: const Text(
                          "Cancel",
                          style: TextStyle(fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed: () async {
                          await GoogleAuthService.instance.signOut();
                          if (!context.mounted) return;

                          Navigator.pop(context);
                          Navigator.of(context).pushAndRemoveUntil(
                            MaterialPageRoute(builder: (_) => const LoginPage()),
                            (route) => false,
                          );
                        },
                        child: const Text(
                          "Log Out",
                          style: TextStyle(fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF8CE4FF), Color(0xFFD0F0FF), Color(0xFFF6F8F6)],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            physics: const NeverScrollableScrollPhysics(),
            child: Column(
              children: [
                /// TOP APP BAR
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Row(
                    children: [
                      const Expanded(
                        child: Text(
                          "My Profile",
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.help_outline, color: Colors.black),
                        tooltip: 'View Tutorial',
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => const OnboardingPage(),
                            ),
                          );
                        },
                      ),
                      IconButton(
                        icon: const Icon(Icons.logout, color: Colors.black),
                        onPressed: () {
                          _showLogoutDialog(context);
                        },
                      )
                    ],
                  ),
                ),

                /// PROFILE HEADER
                ProfileHeader(
                  onEditPressed: () async {
                    final updated = await Navigator.of(context).push<bool>(
                      MaterialPageRoute(
                        builder: (_) => EditProfileScreen(profile: _profile),
                      ),
                    );
                    if (updated == true) {
                      await refreshProfile();
                      await refreshStats();
                    }
                  },
                  avatarUrl: _profile?.avatar?.isNotEmpty == true
                      ? _profile!.avatar!
                      : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
                  name: _profile?.name ?? 'Loading...',
                  bio: _profile?.bio?.trim().isNotEmpty == true
                      ? _profile!.bio!
                      : 'Lengkapi profilmu untuk mulai swap dan thrift 🌿',
                  locationLabel: _profile?.locationLabel,
                ),

                const SizedBox(height: 12),

                /// STATISTICS SECTION
                _buildStatisticsSection(),

                const SizedBox(height: 12),

                /// MY ITEMS SECTION
                _buildMyItemsSection(context),

                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatisticsSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          const Align(
            alignment: Alignment.centerLeft,
            child: Text(
              "Statistics",
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: StatCard(
                  icon: Icons.cyclone,
                  title: "Completed Swaps",
                  value: _isLoadingStats
                      ? '...'
                      : '${_stats?.completedMatches ?? 0}',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: StatCard(
                  icon: Icons.eco,
                  title: "Carbon Saved",
                    value: _isLoadingStats
                      ? '...'
                      : '${(_stats?.carbonSavedKg ?? 0).toStringAsFixed(1)}kg',
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          LevelCard(
            levelName: _isLoadingStats
                ? 'Loading level...'
                : '${_stats?.level ?? 'Eco Beginner'} • ${_stats?.ecoPoints ?? 0} pts',
            progressValue: _stats?.progressValue ?? 0.05,
          ),
        ],
      ),
    );
  }

  Widget _buildMyItemsSection(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text(
                "My Items",
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
              const Spacer(),
              IconButton(
                onPressed: refreshMyItems,
                icon: const Icon(Icons.refresh, size: 20),
              ),
            ],
          ),
          const SizedBox(height: 10),
          if (_isLoadingItems)
            const Center(child: CircularProgressIndicator())
          else if (_myItems.isEmpty)
            const Text(
              'No items yet. Tap + to upload your first item.',
              style: TextStyle(color: Colors.black54, fontSize: 12),
            )
          else
            SizedBox(
              height: 190,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _myItems.length,
                separatorBuilder: (context, index) => const SizedBox(width: 10),
                itemBuilder: (context, index) {
                  final item = _myItems[index];
                  return SizedBox(
                    width: 145,
                    child: ItemCard(
                      title: item.title,
                      subtitle: 'Size ${item.size} • ${_formatPrice(item)}',
                      imageUrl: item.imageUrl.isEmpty
                          ? 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800'
                          : item.imageUrl,
                      onEdit: () => _showEditDialog(item),
                      onDelete: () async {
                        await _deleteItem(item);
                      },
                    ),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}

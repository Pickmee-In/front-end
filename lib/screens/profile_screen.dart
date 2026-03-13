import 'package:flutter/material.dart';
import 'package:front_end/screens/edit_profile_screen.dart';
import 'package:front_end/widgets/profile/profile_header.dart';
import 'package:front_end/widgets/profile/stat_card.dart';
import 'package:front_end/widgets/profile/level_card.dart';
import 'package:front_end/widgets/profile/item_card.dart';

class PickMeProfilePage extends StatelessWidget {
  const PickMeProfilePage({super.key});

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
                        onPressed: () {
                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('👋 Successfully logged out!'),
                              duration: Duration(seconds: 2),
                            ),
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
                  onEditPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => const EditProfileScreen(),
                      ),
                    );
                  },
                ),

                const SizedBox(height: 12),

                /// STATISTICS SECTION
                _buildStatisticsSection(),

                const SizedBox(height: 12),

                /// MY ITEMS SECTION
                _buildMyItemsSection(),

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
                  title: "Items Swapped",
                  value: "42",
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: StatCard(
                  icon: Icons.eco,
                  title: "Carbon Saved",
                  value: "128kg",
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          const LevelCard(),
        ],
      ),
    );
  }

  Widget _buildMyItemsSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "My Items",
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.black,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: ItemCard(
                  title: "Vintage\nDenim",
                  subtitle: "Size M",
                  imageUrl:
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuCPSqLqjXJ5VS9Mbi7qoog3XDBp0HcxtSL0d5AQc_C4pmlQthwCuaarinM3g-adiIqkA7t6H-uPH_fL6Mt3dDHvj7Ufw7kI1vj5_a7Jvfr2q4j0oPcc9eGVRH69t1OI9XYFZFDoWmWxt4PvrPkiU5HfOjEXsTuotdxSgKJDLrr-Cy_aEjIox4jSWwsXdWLPpFkr_YW7Ua0J8gBRdh6rCJ5WQFA9zft06pVFbFSzzHnGP-yjdt55TCtsLu-2aNXN0Pklow1p44TXbunL",
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ItemCard(
                  title: "Silk\nSummer",
                  subtitle: "Size S",
                  imageUrl:
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuBOXLgxqiaKvs9_EnTIGZRkNS8m5yFgkqCQVaSECwZ7MYFG924_7Vpf6Q5F4XqUopipKyLg-2a7VkIJbMWuA2XoMz0_h8jhcwZKXI3gS5Jnr90iZt0HvmBnigE2_iEIBgKvgHbiptavjO7j1lNVFuf3B8BSJbJ9DdmVtdBiAvVQV-G2zn5vNcN_-MuWZhKZU-FDDYblRsUk5C5fbN3gdyPEnvVD3eGJo2u1tTMzi5ZX5sSPb34MNcGCiyeIcgplTpBp2r4YX-b6oqRJ",
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

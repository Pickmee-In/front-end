import 'package:flutter/material.dart';
import '../pages/discover_items_page.dart';
import '../pages/upload_item_page.dart';
import '../pages/chat_page.dart';
import 'explore_screen.dart';
import 'profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  final List<Widget> _screens = const [
    DiscoverItemsPage(),
    PickMeExplorePage(),
    ChatPage(),
    PickMeProfilePage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_selectedIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 20,
              offset: const Offset(0, -4),
            )
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _selectedIndex,
          onTap: (index) {
            setState(() {
              _selectedIndex = index;
            });
          },
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.transparent,
          elevation: 0,
          selectedItemColor: const Color(0xff8CE4FF),
          unselectedItemColor: Colors.grey.shade400,
          selectedLabelStyle: const TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 12,
            fontFamily: 'Plus Jakarta Sans',
          ),
          unselectedLabelStyle: const TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 12,
            fontFamily: 'Plus Jakarta Sans',
          ),
          items: [
            BottomNavigationBarItem(
              icon: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: _selectedIndex == 0
                      ? const Color(0xff8CE4FF).withValues(alpha: 0.1)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  Icons.home_rounded,
                  size: _selectedIndex == 0 ? 26 : 24,
                ),
              ),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: _selectedIndex == 1
                      ? const Color(0xff8CE4FF).withValues(alpha: 0.1)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  Icons.map_rounded,
                  size: _selectedIndex == 1 ? 26 : 24,
                ),
              ),
              label: 'Explore',
            ),
            BottomNavigationBarItem(
              icon: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: _selectedIndex == 2
                      ? const Color(0xff8CE4FF).withValues(alpha: 0.1)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  Icons.chat_bubble_rounded,
                  size: _selectedIndex == 2 ? 26 : 24,
                ),
              ),
              label: 'Chat',
            ),
            BottomNavigationBarItem(
              icon: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: _selectedIndex == 3
                      ? const Color(0xff8CE4FF).withValues(alpha: 0.1)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  Icons.person_rounded,
                  size: _selectedIndex == 3 ? 26 : 24,
                ),
              ),
              label: 'Profile',
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
        ),
        backgroundColor: const Color(0xff8CE4FF),
        foregroundColor: Colors.white,
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const UploadItemPage()),
          );
        },
        child: const Icon(Icons.add, size: 28),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
    );
  }
}

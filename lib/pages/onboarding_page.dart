import 'package:flutter/material.dart';
import 'login_page.dart';

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage>
    with SingleTickerProviderStateMixin {
  int _currentIndex = 0;
  late PageController _pageController;
  late AnimationController _animationController;

  final List<OnboardingSlide> slides = [
    OnboardingSlide(
      title: 'Millions of tons\ngo to waste.',
      description:
          'Give your unused clothes a second life. Join the circular fashion movement.',
      icon: Icons.eco_rounded,
      backgroundColor: const Color(0xff8CE4FF),
      lightColor: const Color(0xff8CE4FF).withValues(alpha: 0.1),
    ),
    OnboardingSlide(
      title: 'Buy sustainably,\nfashionably cheap.',
      description:
          'Find quality pre-loved clothes at unbeatable prices. Support sustainable fashion.',
      icon: Icons.shopping_bag_rounded,
      backgroundColor: const Color(0xff8CE4FF),
      lightColor: const Color(0xff8CE4FF).withValues(alpha: 0.1),
    ),
    OnboardingSlide(
      title: 'Connect with\nthe community.',
      description:
          'Chat, swap, and trade with other fashion enthusiasts. Build a circular wardrobe together.',
      icon: Icons.people_rounded,
      backgroundColor: const Color(0xff8CE4FF),
      lightColor: const Color(0xff8CE4FF).withValues(alpha: 0.1),
    ),
  ];

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  void _goToNextSlide() {
    if (_currentIndex < slides.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    } else {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LoginPage()),
      );
    }
  }

  void _goToPreviousSlide() {
    if (_currentIndex > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xff8CE4FF).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.eco_rounded,
                          color: Color(0xff8CE4FF),
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'PickMe',
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 18,
                          fontFamily: 'Plus Jakarta Sans',
                          color: Colors.black87,
                        ),
                      ),
                    ],
                  ),
                  GestureDetector(
                    onTap: () {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(builder: (_) => const LoginPage()),
                      );
                    },
                    child: Text(
                      'Skip',
                      style: TextStyle(
                        color: Colors.grey.shade500,
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                        fontFamily: 'Plus Jakarta Sans',
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Page View
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: (index) {
                  setState(() {
                    _currentIndex = index;
                  });
                },
                itemCount: slides.length,
                itemBuilder: (context, index) {
                  return OnboardingSlideWidget(slide: slides[index]);
                },
              ),
            ),

            // Dot Indicator
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 24),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  slides.length,
                  (index) => Container(
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    width: _currentIndex == index ? 28 : 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: _currentIndex == index
                          ? const Color(0xff8CE4FF)
                          : Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
              ),
            ),

            // Navigation Buttons
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Row(
                children: [
                  if (_currentIndex > 0) ...[
                    Expanded(
                      child: GestureDetector(
                        onTap: _goToPreviousSlide,
                        child: Container(
                          height: 56,
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: Colors.grey.shade300,
                              width: 1.5,
                            ),
                            borderRadius: BorderRadius.circular(16),
                            color: Colors.white,
                          ),
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.arrow_back_rounded,
                                color: Color(0xff8CE4FF),
                              ),
                              SizedBox(width: 8),
                              Text(
                                'Back',
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xff8CE4FF),
                                  fontFamily: 'Plus Jakarta Sans',
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                  ],
                  Expanded(
                    child: GestureDetector(
                      onTap: _goToNextSlide,
                      child: Container(
                        height: 56,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [
                              Color(0xff8CE4FF),
                              Color(0xff44CCFF),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xff8CE4FF).withValues(alpha: 0.3),
                              blurRadius: 16,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              _currentIndex == slides.length - 1
                                  ? 'Get Started'
                                  : 'Next',
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                                fontFamily: 'Plus Jakarta Sans',
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Icon(
                              Icons.arrow_forward_rounded,
                              color: Colors.white,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}

class OnboardingSlide {
  final String title;
  final String description;
  final IconData icon;
  final Color backgroundColor;
  final Color lightColor;

  OnboardingSlide({
    required this.title,
    required this.description,
    required this.icon,
    required this.backgroundColor,
    required this.lightColor,
  });
}

class OnboardingSlideWidget extends StatelessWidget {
  final OnboardingSlide slide;

  const OnboardingSlideWidget({
    super.key,
    required this.slide,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Icon Circle
        Expanded(
          flex: 2,
          child: Center(
            child: Container(
              width: 160,
              height: 160,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    slide.lightColor,
                    slide.lightColor.withValues(alpha: 0.05),
                  ],
                ),
                borderRadius: BorderRadius.circular(80),
              ),
              child: Icon(
                slide.icon,
                size: 80,
                color: slide.backgroundColor,
              ),
            ),
          ),
        ),

        // Text Section
        Expanded(
          flex: 2,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 28),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  slide.title,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w800,
                    height: 1.2,
                    color: Colors.black87,
                    fontFamily: 'Plus Jakarta Sans',
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  slide.description,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 15,
                    color: Colors.grey.shade600,
                    height: 1.6,
                    fontFamily: 'Plus Jakarta Sans',
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

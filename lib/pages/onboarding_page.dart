import 'package:flutter/material.dart';

class OnboardingPage extends StatelessWidget {
  const OnboardingPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [

            /// HEADER
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [

                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xff8CE4FF).withOpacity(0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.eco,
                          color: Color(0xff44CCFF),
                        ),
                      ),

                      const SizedBox(width: 8),

                      const Text(
                        "PickMe",
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 20,
                        ),
                      ),
                    ],
                  ),

                  TextButton(
                    onPressed: () {
                      Navigator.pop(context);
                    },
                    child: const Text(
                      "Skip",
                      style: TextStyle(color: Colors.grey),
                    ),
                  )
                ],
              ),
            ),

            /// IMAGE
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                height: 420,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(28),
                  image: const DecorationImage(
                    image: NetworkImage(
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuAA4p5vClULXXGvqnTLqWZIGGKfJSYlKz5WAFAv-UdG2FZfonUDkRHganpn6BBpQzi7kEj7JsJbq0gog1QLFlVkul1OYng0ZeDLRSPTe52YSgLCzB-SRvtC-ZkCqB-pYKm161r7mjDny-0qcQJhZ1J-WGFHgp5jGdN1QGHf2KmfemuQs5Rks5aAbb1FZ1AeQoEjrOdy1CVhWx2-M_VI2WM3dU2wBQD8LWVQn4fglGtAdLk-Etq0XLjTSd3rTVKbUbHLZJgcHpQ9XkKN"),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            ),

            /// TEXT SECTION
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 30),
              child: Column(
                children: const [

                  Text(
                    "Millions of tons\n go to waste.",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 34,
                      fontWeight: FontWeight.w800,
                      height: 1.1,
                    ),
                  ),

                  SizedBox(height: 16),

                  Text(
                    "Give your unused clothes a second life. Join the circular fashion movement.",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
            ),

            /// DOT INDICATOR
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  height: 6,
                  width: 30,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [
                        Color(0xff8CE4FF),
                        Color(0xff44CCFF),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                const SizedBox(width: 6),
                dot(),
                const SizedBox(width: 6),
                dot(),
              ],
            ),

            const Spacer(),

            /// BUTTONS
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                children: [

                  /// GET STARTED
                  Container(
                    width: double.infinity,
                    height: 64,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [
                          Color(0xff8CE4FF),
                          Color(0xff44CCFF),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xff8CE4FF).withOpacity(0.4),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        )
                      ],
                    ),
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                      ),
                      onPressed: () {
                        Navigator.pop(context);
                      },
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            "Get Started",
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.black,
                            ),
                          ),
                          SizedBox(width: 8),
                          Icon(Icons.arrow_forward, color: Colors.black)
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 14),

                  /// SIGN IN
                  Container(
                    width: double.infinity,
                    height: 64,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.grey.shade300),
                    ),
                    child: TextButton(
                      onPressed: () {
                        Navigator.pop(context);
                      },
                      child: const Text(
                        "Sign In",
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.black54,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 12),

                  const Text.rich(
                    TextSpan(
                      text: "New here? ",
                      style: TextStyle(color: Colors.grey),
                      children: [
                        TextSpan(
                          text: "Create an account",
                          style: TextStyle(
                            color: Color(0xff44CCFF),
                            fontWeight: FontWeight.bold,
                          ),
                        )
                      ],
                    ),
                  ),

                  const SizedBox(height: 30),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

Widget dot() {
  return Container(
    height: 6,
    width: 6,
    decoration: BoxDecoration(
      color: Colors.grey.shade300,
      borderRadius: BorderRadius.circular(10),
    ),
  );
}

import 'package:flutter/material.dart';

class ProfileHeader extends StatelessWidget {
  final VoidCallback onEditPressed;
  final String avatarUrl;
  final String name;
  final String badge;
  final String bio;
  final String? locationLabel;

  const ProfileHeader({
    super.key,
    required this.onEditPressed,
    this.avatarUrl =
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBM_SS8n4xvnz3KRRwb5JdPoCrpxb5_Om_W-d-L0P9jIG7Ou5Oqbx9ukXsylF-RAKf1yoV-rcVKu-TJkH3QVo57vPUmNLdacWmHVmJRHdQjz1ppF8_VFWy3FbcMCacJC-oBxIDrVFQpUyiqslb2ygMn4uuiXFpULRoj8tL6bFgXRO_OafImCe8J5aizZIanBuq876FUM-Awg7YxiNB1RNIgKJ-a7em0GxGwPfoWs_MQU8ctz9oR8-SwaHcDdJbicQ1LBfVjQDC5Tvhi",
    this.name = "Alex Rivera",
    this.badge = "ECO HERO",
    this.bio = "Saving the planet one swap at a time 🌿",
    this.locationLabel,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        children: [
          Stack(
            children: [
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(50),
                  image: DecorationImage(
                    image: NetworkImage(avatarUrl),
                    fit: BoxFit.cover,
                    onError: (exception, stackTrace) {},
                  ),
                  border: Border.all(
                    color: Colors.white,
                    width: 3,
                  ),
                ),
              ),
              Positioned(
                bottom: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.verified,
                    size: 14,
                    color: Color(0xff8CE4FF),
                  ),
                ),
              )
            ],
          ),
          const SizedBox(height: 8),
          Text(
            name,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            badge,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 6),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Text(
              bio,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12, color: Colors.black87),
            ),
          ),
          if (locationLabel != null && locationLabel!.trim().isNotEmpty) ...[
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.location_on_outlined, size: 14, color: Colors.black54),
                const SizedBox(width: 4),
                Flexible(
                  child: Text(
                    locationLabel!,
                    style: const TextStyle(fontSize: 12, color: Colors.black54),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ],
          const SizedBox(height: 10),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: const Color(0xff8CE4FF),
              padding: const EdgeInsets.symmetric(
                horizontal: 30,
                vertical: 8,
              ),
            ),
            onPressed: onEditPressed,
            child: const Text(
              "Edit Profile",
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}

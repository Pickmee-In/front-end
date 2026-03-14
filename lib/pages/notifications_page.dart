import 'package:flutter/material.dart';

class Notification {
  final String id;
  final String title;
  final String message;
  final String type; // 'like', 'message', 'promo', 'system'
  final String? senderAvatar;
  final String? senderName;
  final DateTime timestamp;
  final bool isRead;

  Notification({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    this.senderAvatar,
    this.senderName,
    required this.timestamp,
    this.isRead = false,
  });
}

class NotificationsPage extends StatefulWidget {
  const NotificationsPage({super.key});

  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> {
  List<Notification> notifications = [
    Notification(
      id: '1',
      title: 'Sarah menyukai Vintage Denim Jacket',
      message: 'Seseorang tertarik dengan barang yang kamu jual',
      type: 'like',
      senderName: 'Sarah',
      senderAvatar: 'https://api.example.com/avatars/sarah.jpg',
      timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
      isRead: false,
    ),
    Notification(
      id: '2',
      title: 'Pesan dari Budi',
      message: 'Halo, apakah barang ini masih tersedia?',
      type: 'message',
      senderName: 'Budi',
      senderAvatar: 'https://api.example.com/avatars/budi.jpg',
      timestamp: DateTime.now().subtract(const Duration(minutes: 23)),
      isRead: false,
    ),
    Notification(
      id: '3',
      title: 'Diskon 30% untuk barang pilihan',
      message: 'Dapatkan penawaran spesial hari ini juga!',
      type: 'promo',
      timestamp: DateTime.now().subtract(const Duration(hours: 2)),
      isRead: true,
    ),
    Notification(
      id: '4',
      title: 'Rina menyukai Eco-Friendly Sweater',
      message: 'Seseorang tertarik dengan barang yang kamu jual',
      type: 'like',
      senderName: 'Rina',
      senderAvatar: 'https://api.example.com/avatars/rina.jpg',
      timestamp: DateTime.now().subtract(const Duration(hours: 3)),
      isRead: true,
    ),
    Notification(
      id: '5',
      title: 'Profile diperbarui',
      message: 'Verifikasi akun kamu untuk kepercayaan lebih',
      type: 'system',
      timestamp: DateTime.now().subtract(const Duration(days: 1)),
      isRead: true,
    ),
    Notification(
      id: '6',
      title: 'Ahmad melakukan pembelian',
      message: 'Pesanan untuk Sustainable Linen Shirt dikonfirmasi',
      type: 'message',
      senderName: 'Ahmad',
      senderAvatar: 'https://api.example.com/avatars/ahmad.jpg',
      timestamp: DateTime.now().subtract(const Duration(days: 1)),
      isRead: true,
    ),
    Notification(
      id: '7',
      title: 'Promo flash sale berakhir',
      message: 'Jangan lewatkan kesempatan emas ini!',
      type: 'promo',
      timestamp: DateTime.now().subtract(const Duration(days: 2)),
      isRead: true,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Notifikasi',
          style: TextStyle(
            color: Colors.black,
            fontSize: 18,
            fontWeight: FontWeight.bold,
            fontFamily: 'Plus Jakarta Sans',
          ),
        ),
        centerTitle: true,
      ),
      body: ListView.builder(
        itemCount: notifications.length,
        padding: const EdgeInsets.symmetric(vertical: 8),
        itemBuilder: (context, index) {
          final notif = notifications[index];
          return _buildNotificationItem(notif);
        },
      ),
    );
  }

  Widget _buildNotificationItem(Notification notif) {
    IconData getIcon() {
      switch (notif.type) {
        case 'like':
          return Icons.favorite_rounded;
        case 'message':
          return Icons.chat_bubble_rounded;
        case 'promo':
          return Icons.local_offer_rounded;
        case 'system':
          return Icons.info_rounded;
        default:
          return Icons.notifications_rounded;
      }
    }

    Color getIconColor() {
      switch (notif.type) {
        case 'like':
          return Colors.red;
        case 'message':
          return const Color(0xff8CE4FF);
        case 'promo':
          return Colors.amber;
        case 'system':
          return Colors.grey;
        default:
          return const Color(0xff8CE4FF);
      }
    }

    String getTimeAgo(DateTime dateTime) {
      final duration = DateTime.now().difference(dateTime);

      if (duration.inMinutes < 1) {
        return 'baru saja';
      } else if (duration.inMinutes < 60) {
        return '${duration.inMinutes}m yang lalu';
      } else if (duration.inHours < 24) {
        return '${duration.inHours}j yang lalu';
      } else if (duration.inDays < 7) {
        return '${duration.inDays}h yang lalu';
      } else {
        return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
      }
    }

    return GestureDetector(
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(notif.title),
            duration: const Duration(milliseconds: 1200),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: notif.isRead ? Colors.white : const Color(0xff8CE4FF).withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: notif.isRead ? Colors.grey.shade200 : const Color(0xff8CE4FF).withValues(alpha: 0.3),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon/Avatar
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: getIconColor().withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Center(
                child: Icon(
                  getIcon(),
                  color: getIconColor(),
                  size: 24,
                ),
              ),
            ),
            const SizedBox(width: 12),

            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          notif.title,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: Colors.black87,
                            fontFamily: 'Plus Jakarta Sans',
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (!notif.isRead)
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: Color(0xff8CE4FF),
                            shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    notif.message,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade600,
                      fontFamily: 'Plus Jakarta Sans',
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    getTimeAgo(notif.timestamp),
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.grey.shade500,
                      fontFamily: 'Plus Jakarta Sans',
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

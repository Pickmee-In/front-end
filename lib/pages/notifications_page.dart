import 'package:flutter/material.dart';

import '../features/notifications/services/notification_service.dart';

class NotificationsPage extends StatefulWidget {
  const NotificationsPage({super.key});

  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> {
  final NotificationService _notificationService = const NotificationService();
  bool _isLoading = true;
  List<AppNotification> _notifications = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final result = await _notificationService.listNotifications();
      if (!mounted) return;
      setState(() {
        _notifications = result.notifications;
        _isLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _isLoading = false);
    }
  }

  Future<void> _markAllRead() async {
    await _notificationService.markAllRead();
    if (!mounted) return;
    setState(() {
      _notifications = _notifications
          .map((n) => AppNotification(
                id: n.id,
                title: n.title,
                message: n.message,
                type: n.type,
                timestamp: n.timestamp,
                isRead: true,
                data: n.data,
              ))
          .toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context, true),
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
        actions: [
          TextButton(
            onPressed: _notifications.every((e) => e.isRead) ? null : _markAllRead,
            child: const Text('Read all'),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _notifications.isEmpty
              ? const Center(
                  child: Text(
                    'Belum ada notifikasi.',
                    style: TextStyle(color: Colors.black54),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.builder(
                    itemCount: _notifications.length,
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    itemBuilder: (context, index) {
                      final notif = _notifications[index];
                      return _buildNotificationItem(notif);
                    },
                  ),
                ),
    );
  }

  Widget _buildNotificationItem(AppNotification notif) {
    IconData getIcon() {
      switch (notif.type) {
        case 'item':
          return Icons.checkroom_rounded;
        case 'chat':
          return Icons.chat_bubble_rounded;
        case 'match':
          return Icons.favorite_rounded;
        case 'system':
          return Icons.info_rounded;
        default:
          return Icons.notifications_rounded;
      }
    }

    Color getIconColor() {
      switch (notif.type) {
        case 'item':
          return const Color(0xff8CE4FF);
        case 'chat':
          return Colors.green;
        case 'match':
          return Colors.red;
        case 'system':
          return Colors.grey;
        default:
          return const Color(0xff8CE4FF);
      }
    }

    String getTimeAgo(DateTime dateTime) {
      final duration = DateTime.now().difference(dateTime);
      if (duration.inMinutes < 1) return 'baru saja';
      if (duration.inMinutes < 60) return '${duration.inMinutes}m yang lalu';
      if (duration.inHours < 24) return '${duration.inHours}j yang lalu';
      if (duration.inDays < 7) return '${duration.inDays}h yang lalu';
      return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
    }

    return GestureDetector(
      onTap: () async {
        if (!notif.isRead) {
          await _notificationService.markRead(notif.id);
          if (!mounted) return;
          setState(() {
            _notifications = _notifications
                .map((n) => n.id == notif.id
                    ? AppNotification(
                        id: n.id,
                        title: n.title,
                        message: n.message,
                        type: n.type,
                        timestamp: n.timestamp,
                        isRead: true,
                        data: n.data,
                      )
                    : n)
                .toList();
          });
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(notif.title), duration: const Duration(milliseconds: 1200)),
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
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: getIconColor().withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Center(child: Icon(getIcon(), color: getIconColor(), size: 24)),
            ),
            const SizedBox(width: 12),
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
                          style: const TextStyle(
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

import 'package:flutter/material.dart';

class ChatPage extends StatefulWidget {
  const ChatPage({super.key});

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  final List<ChatUser> chatUsers = [
    ChatUser(
      id: '1',
      name: 'Budi Santoso',
      lastMessage: 'Boleh tanya ukuran jacketnya?',
      avatar: '👨',
      timestamp: '14:23',
      unread: 2,
      isOnline: true,
    ),
    ChatUser(
      id: '2',
      name: 'Siti Nurhaliza',
      lastMessage: 'Bagus banget nih jeansnya, siap beli',
      avatar: '👩',
      timestamp: '13:45',
      unread: 0,
      isOnline: true,
    ),
    ChatUser(
      id: '3',
      name: 'Ahmad Wijaya',
      lastMessage: 'Masih ada stocknya? Mau 2 piece',
      avatar: '👨',
      timestamp: '12:30',
      unread: 1,
      isOnline: false,
    ),
    ChatUser(
      id: '4',
      name: 'Ratna Dewi',
      lastMessage: 'Terima tukar mismo ngga?',
      avatar: '👩',
      timestamp: '11:15',
      unread: 0,
      isOnline: true,
    ),
    ChatUser(
      id: '5',
      name: 'Danang Pratama',
      lastMessage: 'Serius ini harganya?',
      avatar: '👨',
      timestamp: '10:00',
      unread: 0,
      isOnline: false,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final totalUnread = chatUsers.fold<int>(0, (sum, user) => sum + user.unread);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Chat',
          style: TextStyle(
            color: Colors.black87,
            fontSize: 20,
            fontWeight: FontWeight.w700,
            fontFamily: 'Plus Jakarta Sans',
          ),
        ),
        centerTitle: true,
        actions: [
          if (totalUnread > 0)
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xff8CE4FF),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '$totalUnread',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      fontFamily: 'Plus Jakarta Sans',
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
      body: ListView.builder(
        itemCount: chatUsers.length,
        itemBuilder: (context, index) {
          final user = chatUsers[index];
          return GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => ChatDetailPage(user: user),
                ),
              );
            },
            child: Container(
              color: user.unread > 0
                  ? const Color(0xff8CE4FF).withValues(alpha: 0.04)
                  : Colors.transparent,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    Stack(
                      children: [
                        Container(
                          width: 56,
                          height: 56,
                          decoration: BoxDecoration(
                            color: const Color(0xff8CE4FF).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(28),
                          ),
                          child: Center(
                            child: Text(
                              user.avatar,
                              style: const TextStyle(fontSize: 28),
                            ),
                          ),
                        ),
                        if (user.isOnline)
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: Container(
                              width: 14,
                              height: 14,
                              decoration: BoxDecoration(
                                color: Colors.green,
                                borderRadius: BorderRadius.circular(7),
                                border: Border.all(
                                  color: Colors.white,
                                  width: 2,
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                user.name,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.black87,
                                  fontFamily: 'Plus Jakarta Sans',
                                ),
                              ),
                              Text(
                                user.timestamp,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey.shade500,
                                  fontFamily: 'Plus Jakarta Sans',
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  user.lastMessage,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: Colors.grey.shade600,
                                    fontFamily: 'Plus Jakarta Sans',
                                    fontWeight: user.unread > 0
                                        ? FontWeight.w600
                                        : FontWeight.w400,
                                  ),
                                ),
                              ),
                              if (user.unread > 0)
                                Container(
                                  margin: const EdgeInsets.only(left: 8),
                                  width: 24,
                                  height: 24,
                                  decoration: BoxDecoration(
                                    color: const Color(0xff8CE4FF),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Center(
                                    child: Text(
                                      '${user.unread}',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                        fontFamily: 'Plus Jakarta Sans',
                                      ),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class ChatUser {
  final String id;
  final String name;
  final String lastMessage;
  final String avatar;
  final String timestamp;
  final int unread;
  final bool isOnline;

  ChatUser({
    required this.id,
    required this.name,
    required this.lastMessage,
    required this.avatar,
    required this.timestamp,
    required this.unread,
    required this.isOnline,
  });
}

class ChatDetailPage extends StatefulWidget {
  final ChatUser user;

  const ChatDetailPage({super.key, required this.user});

  @override
  State<ChatDetailPage> createState() => _ChatDetailPageState();
}

class _ChatDetailPageState extends State<ChatDetailPage> {
  final List<Message> messages = [];
  final messageController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Sample messages
    messages.addAll([
      Message(
        text: 'Halo, ini barang bagusnya gapake cacat kan?',
        isSent: false,
        timestamp: '13:45',
      ),
      Message(
        text: 'Iyaa pokoknya masih bagus banget',
        isSent: true,
        timestamp: '13:46',
      ),
      Message(
        text: 'Boleh lihat foto yang lebih jelas?',
        isSent: false,
        timestamp: '13:47',
      ),
      Message(
        text: 'Udah di galeri semua fotonya kak',
        isSent: true,
        timestamp: '13:48',
      ),
    ]);
  }

  @override
  void dispose() {
    messageController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    if (messageController.text.isEmpty) return;

    setState(() {
      messages.add(
        Message(
          text: messageController.text,
          isSent: true,
          timestamp: _getCurrentTime(),
        ),
      );
      messageController.clear();
    });
  }

  String _getCurrentTime() {
    final now = DateTime.now();
    return '${now.hour}:${now.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black87),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          children: [
            Text(
              widget.user.name,
              style: const TextStyle(
                color: Colors.black87,
                fontSize: 15,
                fontWeight: FontWeight.w700,
                fontFamily: 'Plus Jakarta Sans',
              ),
            ),
            Text(
              widget.user.isOnline ? 'Online' : 'Offline',
              style: TextStyle(
                color: widget.user.isOnline ? Colors.green : Colors.grey.shade500,
                fontSize: 11,
                fontWeight: FontWeight.w600,
                fontFamily: 'Plus Jakarta Sans',
              ),
            ),
          ],
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.call, color: Color(0xff8CE4FF), size: 20),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.videocam, color: Color(0xff8CE4FF), size: 20),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              itemCount: messages.length,
              itemBuilder: (context, index) {
                final message = messages[index];
                return Align(
                  alignment: message.isSent
                      ? Alignment.centerRight
                      : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: message.isSent
                          ? const Color(0xff8CE4FF)
                          : Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: message.isSent
                          ? CrossAxisAlignment.end
                          : CrossAxisAlignment.start,
                      children: [
                        Text(
                          message.text,
                          style: TextStyle(
                            fontSize: 13,
                            color: message.isSent
                                ? Colors.white
                                : Colors.black87,
                            fontFamily: 'Plus Jakarta Sans',
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          message.timestamp,
                          style: TextStyle(
                            fontSize: 10,
                            color: message.isSent
                                ? Colors.white70
                                : Colors.grey.shade500,
                            fontFamily: 'Plus Jakarta Sans',
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 8,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: messageController,
                    style: const TextStyle(
                      fontSize: 13,
                      fontFamily: 'Plus Jakarta Sans',
                    ),
                    decoration: InputDecoration(
                      hintText: 'Ketik pesan...',
                      hintStyle: TextStyle(
                        color: Colors.grey.shade500,
                        fontSize: 13,
                        fontFamily: 'Plus Jakarta Sans',
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.grey.shade300),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.grey.shade300),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(
                          color: Color(0xff8CE4FF),
                          width: 2,
                        ),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 10,
                      ),
                      prefixIcon: Icon(
                        Icons.emoji_emotions_outlined,
                        color: Colors.grey.shade400,
                        size: 20,
                      ),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: _sendMessage,
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: const Color(0xff8CE4FF),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.send,
                      color: Colors.white,
                      size: 18,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class Message {
  final String text;
  final bool isSent;
  final String timestamp;

  Message({
    required this.text,
    required this.isSent,
    required this.timestamp,
  });
}

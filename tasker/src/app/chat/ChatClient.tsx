'use client';

import { useState, useEffect } from 'react';

interface Group {
  id: string;
  name: string;
  isGroup: boolean;
  members: { user: { id: string; firstName: string; lastName: string; email: string } }[];
  messages: { content: string; createdAt: string }[];
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; firstName: string; lastName: string; email: string };
}

export default function ChatClient() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);


  useEffect(() => {
    fetchGroups();
    fetchUsers();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/me');
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
      } else {
        console.error('Failed to fetch current user:', data.message);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };



  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/chat/groups');
      const data = await res.json();
      if (res.ok) {
        setGroups(data.groups);
      } else {
        console.error('Failed to fetch groups:', data.error);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
      } else {
        console.error('Failed to fetch users:', data.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchMessages = async (groupId: string) => {
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages);
      } else {
        console.error('Failed to fetch messages:', data.message);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedGroup || !newMessage.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: selectedGroup.id, content: newMessage }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
      } else {
        console.error('Failed to send message:', data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim()) return;

    try {
      const res = await fetch('/api/chat/createGroup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupName, memberIds: selectedMembers }),
      });
      const data = await res.json();
      if (res.ok) {
        setGroups(prev => [...prev, data.group]);
        setGroupName('');
        setSelectedMembers([]);
        setShowCreateForm(false);
      } else {
        console.error('Failed to create group:', data.message);
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const createDM = async (otherUserId: string) => {
    try {
      const res = await fetch('/api/chat/dm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otherUserId }),
      });
      const data = await res.json();
      if (res.ok) {
        const dm = data.group;
        setGroups(prev => {
          if (!prev.find(g => g.id === dm.id)) {
            return [...prev, dm];
          }
          return prev;
        });
        setSelectedGroup(dm);
        fetchMessages(dm.id);
      } else {
        console.error('Failed to create DM:', data.message);
      }
    } catch (error) {
      console.error('Error creating DM:', error);
    }
  };

  const selectGroup = (group: Group) => {
    setSelectedGroup(group);
    fetchMessages(group.id);
  };

  const chatGroups = groups.filter(g => g.isGroup);
  const dms = groups.filter(g => !g.isGroup);

  const getDMName = (group: Group) => {
    if (!currentUser) return 'DM';
    const otherMember = group.members.find(m => m.user.id !== currentUser.id);
    return otherMember ? `${otherMember.user.firstName} ${otherMember.user.lastName}` : 'DM';
  };

  const dmUserIds = dms.flatMap(dm => dm.members.filter(m => m.user.id !== (currentUser?.id || '')).map(m => m.user.id));
  const availableUsers = users.filter(u => currentUser && u.id !== currentUser.id && !dmUserIds.includes(u.id));


  return (
    <div className="flex h-screen">
      {/* Sidebar with groups */}
      <div className="w-1/4 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Chat</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded mb-4"
        >
          Create New Group
        </button>
        {showCreateForm && (
          <div className="mb-4 p-4 bg-white rounded shadow">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
              className="w-full p-2 border rounded mb-2"
            />
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Add Members:</label>
              <div className="max-h-32 overflow-y-auto border rounded p-2">
                {users.filter(u => currentUser && u.id !== currentUser.id).map(user => (
                  <label key={user.id} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMembers(prev => [...prev, user.id]);
                        } else {
                          setSelectedMembers(prev => prev.filter(id => id !== user.id));
                        }
                      }}
                      className="mr-2"
                    />
                    {user.firstName} {user.lastName}
                  </label>
                ))}
              </div>
            </div>
            <button
              onClick={createGroup}
              className="bg-green-500 text-white py-1 px-3 rounded mr-2"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setGroupName('');
                setSelectedMembers([]);
              }}
              className="bg-gray-500 text-white py-1 px-3 rounded"
            >
              Cancel
            </button>
          </div>
        )}

        <h3 className="text-lg font-semibold mb-2">Groups</h3>
        {chatGroups.map(group => (
          <div
            key={group.id}
            className={`p-2 mb-2 cursor-pointer rounded ${selectedGroup?.id === group.id ? 'bg-blue-200' : 'bg-white'}`}
            onClick={() => selectGroup(group)}
          >
            <div className="font-semibold">{group.name}</div>
            <div className="text-sm text-gray-600">
              {group.members.length} members
            </div>
            {group.messages.length > 0 && (
              <div className="text-xs text-gray-500">
                Last: {group.messages[0].content.substring(0, 30)}...
              </div>
            )}
          </div>
        ))}

        <h3 className="text-lg font-semibold mb-2 mt-4">Direct Messages</h3>
        {dms.map(group => (
          <div
            key={group.id}
            className={`p-2 mb-2 cursor-pointer rounded ${selectedGroup?.id === group.id ? 'bg-blue-200' : 'bg-white'}`}
            onClick={() => selectGroup(group)}
          >
            <div className="font-semibold">
              {getDMName(group)}
            </div>
            {group.messages.length > 0 && (
              <div className="text-xs text-gray-500">
                Last: {group.messages[0].content.substring(0, 30)}...
              </div>
            )}
          </div>
        ))}

        <h3 className="text-lg font-semibold mb-2 mt-4">Start DM</h3>
        {availableUsers.map(user => (
          <div
            key={user.id}
            className="p-2 mb-2 cursor-pointer rounded bg-white hover:bg-gray-200"
            onClick={() => createDM(user.id)}
          >
            {user.firstName} {user.lastName}
          </div>
        ))}
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {selectedGroup ? (
          <>
            <div className="bg-blue-500 text-white p-4">
              <h3 className="text-lg font-bold">{selectedGroup.name}</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map(message => (
                <div key={message.id} className="mb-4">
                  <div className="font-semibold">
                    {message.sender.firstName} {message.sender.lastName}
                  </div>
                  <div className="bg-gray-200 p-2 rounded">
                    {message.content}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(message.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t">
              <div className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 p-2 border rounded-l"
                  placeholder="Type a message..."
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-500 text-white px-4 rounded-r disabled:opacity-50"
                  disabled={loading || !newMessage.trim()}
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Select a group to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
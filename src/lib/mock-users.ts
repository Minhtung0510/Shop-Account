export const MOCK_USERS = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    email: "user1@example.com",
    password: "user123",
    role: "USER",
    balance: 500000,
    orders: 12,
    rank: "Gold",
    created: "2026-01-15",
  },
  {
    id: "2",
    name: "Trần Thị B",
    email: "user2@example.com",
    password: "user123",
    role: "USER",
    balance: 1200000,
    orders: 24,
    rank: "Platinum",
    created: "2026-02-01",
  },
  {
    id: "3",
    name: "Lê Văn C",
    email: "admin@example.com",
    password: "admin123",
    role: "ADMIN",
    balance: 0,
    orders: 0,
    rank: "Admin",
    created: "2026-01-01",
  },
  {
    id: "4",
    name: "Phạm Thị D",
    email: "user4@example.com",
    password: "user123",
    role: "USER",
    balance: 350000,
    orders: 8,
    rank: "Silver",
    created: "2026-03-10",
  },
];

export const MOCK_SESSIONS: Record<string, typeof MOCK_USERS[0]> = {};

export function findMockUser(email: string, password: string) {
  const user = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  return user || null;
}

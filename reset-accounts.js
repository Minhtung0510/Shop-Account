// Reset script - chạy trước khi test
const { db } = require('./src/lib/db');

async function resetAccounts() {
  try {
    // Reset all account lockouts
    await db.user.updateMany({
      data: {
        failedLoginAttempts: 0,
        isLocked: false,
        lockedAt: null,
        lockUntil: null
      }
    });
    console.log('✅ All account lockouts reset');

    // Show current status
    const users = await db.user.findMany({
      select: { email: true, isLocked: true, failedLoginAttempts: true }
    });
    console.log('\nCurrent users status:');
    users.forEach(u => {
      console.log(`  ${u.email}: locked=${u.isLocked}, attempts=${u.failedLoginAttempts}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

resetAccounts();

const bcrypt = require('bcryptjs');
const { User } = require('../models');

const DEFAULTS = {
  email: 'admin@carelink.com',
  password: 'Admin@123',
  phone: '9999999999',
  name: 'Super Admin',
};

async function ensureSuperAdmin(overrides = {}) {
  const email = overrides.email || process.env.ADMIN_EMAIL || DEFAULTS.email;
  const password = overrides.password || process.env.ADMIN_PASSWORD || DEFAULTS.password;
  const phone = overrides.phone || process.env.ADMIN_PHONE || DEFAULTS.phone;
  const name = overrides.name || DEFAULTS.name;

  const existing = await User.findOne({ where: { email } });
  const hashedPassword = await bcrypt.hash(password, 12);

  if (existing) {
    const needsUpdate =
      !['SUPERADMIN', 'ADMIN'].includes(existing.role) || !(await bcrypt.compare(password, existing.password));

    if (needsUpdate) {
      await existing.update({ role: 'SUPERADMIN', password: hashedPassword });
      return { created: false, updated: true, email };
    }
    return { created: false, updated: false, email };
  }

  await User.create({
    name,
    email,
    phone,
    password: hashedPassword,
    role: 'SUPERADMIN',
  });

  return { created: true, updated: false, email };
}

module.exports = { ensureSuperAdmin, DEFAULTS };

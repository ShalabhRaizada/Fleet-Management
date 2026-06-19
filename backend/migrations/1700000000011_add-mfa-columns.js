/* MFA (TOTP): adds mfa_enabled/mfa_secret to user_master so login can optionally
   require a second-factor code. mfa_secret is a sensitive system extension
   (same treatment as password_hash - never added to schema_spec.json, only
   ever read/written via direct SQL in the auth routes). mfa_enabled is a
   non-sensitive indicator flag and is safe to expose generically. */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('user_master', {
    mfa_enabled: { type: 'boolean', notNull: true, default: false },
    mfa_secret: { type: 'text' },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('user_master', ['mfa_enabled', 'mfa_secret']);
};

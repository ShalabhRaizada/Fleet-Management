/* Source data dictionary has no password/auth storage columns for user_master.
   Adding password_hash/refresh_token_hash/last_login_at as a necessary system
   extension for JWT/bcrypt auth (documented in ARCHITECTURE.md). */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('user_master', {
    password_hash: { type: 'varchar(255)' },
    refresh_token_hash: { type: 'varchar(255)' },
    last_login_at: { type: 'timestamptz' },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('user_master', ['password_hash', 'refresh_token_hash', 'last_login_at']);
};

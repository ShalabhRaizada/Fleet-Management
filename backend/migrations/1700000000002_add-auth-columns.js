exports.shorthands = undefined;

// Adds authentication-related columns to user_master.
// These are not in the source data dictionary (which models user_master as a
// pure reference/master table) but are required for Phase-1 JWT auth.
exports.up = (pgm) => {
  pgm.addColumns('user_master', {
    password_hash: { type: 'varchar(200)' },
    refresh_token_hash: { type: 'varchar(200)' },
    last_login_at: { type: 'timestamptz' },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('user_master', ['password_hash', 'refresh_token_hash', 'last_login_at']);
};
